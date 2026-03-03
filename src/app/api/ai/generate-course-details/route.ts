import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPlatformAIModel, logUsage, GatewayError } from '@/lib/ai/gateway';
import { generateText } from 'ai';
import { COURSE_DETAILS_SYSTEM_PROMPT, COURSE_DETAILS_USER_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';
import type { CourseDetails } from '@/types/authoring';

export const maxDuration = 60;

const requestSchema = z.object({
  description: z.string().min(3).max(2000),
  language: z.enum(['ar', 'en']),
  source_chunks: z.string().optional(),
  industry: z.string().optional(),
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

    let platform;
    try {
      platform = getPlatformAIModel();
    } catch (err) {
      if (err instanceof GatewayError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const startTime = Date.now();

    const result = await generateText({
      model: platform.model,
      system: COURSE_DETAILS_SYSTEM_PROMPT,
      prompt: COURSE_DETAILS_USER_PROMPT({
        description: params.description,
        language: params.language,
        sourceChunks: params.source_chunks,
        industry: params.industry,
      }),
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    const durationMs = Date.now() - startTime;

    let details: CourseDetails;
    try {
      let text = result.text.trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      details = JSON.parse(text.trim());
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 502 }
      );
    }

    const inputTokens = result.usage?.inputTokens || 0;
    const outputTokens = result.usage?.outputTokens || 0;

    await supabase.from('ai_generation_log').insert({
      organization_id: (await supabase.rpc('get_user_org_id')).data,
      user_id: user.id,
      operation: 'generate_course_details',
      model: platform.modelId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: estimateCost(inputTokens, outputTokens, platform.modelId),
      input_summary: `Description: ${params.description.slice(0, 100)}`,
      output_summary: `Topic: ${details.topic?.slice(0, 80) || 'N/A'}`,
      duration_ms: durationMs,
    });

    await logUsage(supabase, 'generate_course_details', inputTokens + outputTokens);

    return NextResponse.json({ details });
  } catch (error) {
    console.error('Course details generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate course details' },
      { status: 500 }
    );
  }
}

function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  if (model.includes('sonnet')) {
    return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
  }
  if (model.includes('haiku')) {
    return (inputTokens * 0.8 + outputTokens * 4) / 1_000_000;
  }
  return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
}
