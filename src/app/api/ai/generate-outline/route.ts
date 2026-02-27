import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAIProvider, logUsage, GatewayError } from '@/lib/ai/gateway';
import { generateText } from 'ai';
import { OUTLINE_SYSTEM_PROMPT, OUTLINE_USER_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';
import type { CourseOutline } from '@/types/authoring';

export const maxDuration = 120;

const requestSchema = z.object({
  topic: z.string().min(3).max(500),
  audience: z.string().min(3).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['ar', 'en']),
  tone: z.enum(['formal', 'conversational', 'academic']).default('formal'),
  module_count: z.number().int().min(3).max(7).default(5),
  lessons_per_module: z.number().int().min(2).max(5).default(3),
  source_chunks: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = parsed.data;

    let gateway;
    try {
      gateway = await getAIProvider(supabase, user.id, 'generate_outline');
    } catch (err) {
      if (err instanceof GatewayError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const startTime = Date.now();

    const result = await generateText({
      model: gateway.model,
      system: OUTLINE_SYSTEM_PROMPT,
      prompt: OUTLINE_USER_PROMPT({
        topic: params.topic,
        audience: params.audience,
        difficulty: params.difficulty,
        language: params.language,
        moduleCount: params.module_count,
        lessonsPerModule: params.lessons_per_module,
        sourceChunks: params.source_chunks,
      }),
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    const durationMs = Date.now() - startTime;

    // Parse AI response as JSON
    let outline: CourseOutline;
    try {
      let text = result.text.trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      outline = JSON.parse(text.trim());
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 502 }
      );
    }

    // Log AI usage
    const inputTokens = result.usage?.inputTokens || 0;
    const outputTokens = result.usage?.outputTokens || 0;

    await supabase.from('ai_generation_log').insert({
      organization_id: (await supabase.rpc('get_user_org_id')).data,
      user_id: user.id,
      operation: 'generate_outline',
      model: gateway.config.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: estimateCost(inputTokens, outputTokens, gateway.config.model),
      input_summary: `Topic: ${params.topic}`,
      output_summary: `${outline.modules?.length || 0} modules generated`,
      duration_ms: durationMs,
    });

    await logUsage(supabase, 'generate_outline', inputTokens + outputTokens);

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Outline generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}

function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  if (model.includes('sonnet')) {
    return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
  }
  if (model.includes('haiku')) {
    return (inputTokens * 0.8 + outputTokens * 4) / 1_000_000;
  }
  return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
}
