import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPlatformAIModel, checkRateLimit, logUsage, GatewayError, withRetry } from '@/lib/ai/gateway';
import { generateText } from 'ai';
import { QUIZ_SYSTEM_PROMPT, QUIZ_USER_PROMPT } from '@/lib/ai/prompts';
import { repairJSON } from '@/lib/ai/json-repair';
import { z } from 'zod';

export const maxDuration = 120;

const requestSchema = z.object({
  module_title: z.string().min(1),
  lesson_contents: z.string().min(1),
  language: z.enum(['ar', 'en']),
  question_count: z.number().int().min(3).max(20).default(5),
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

    // Rate limiting
    const rateLimit = await checkRateLimit(supabase, user.id, 'generate_quiz');
    if (!rateLimit.allowed) {
      const isMinuteLimit = rateLimit.requests_minute >= rateLimit.limit_minute;
      const detail = isMinuteLimit
        ? `Rate limit exceeded: ${rateLimit.requests_minute}/${rateLimit.limit_minute} requests per minute`
        : `Daily limit exceeded: ${rateLimit.requests_day}/${rateLimit.limit_day} requests per day`;
      return NextResponse.json({ error: detail }, { status: 429 });
    }

    // Use platform-level AI key (not tenant's per-org config)
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

    const result = await withRetry(() =>
      generateText({
        model: platform.model,
        system: QUIZ_SYSTEM_PROMPT,
        prompt: QUIZ_USER_PROMPT({
          moduleTitle: params.module_title,
          lessonContents: params.lesson_contents,
          language: params.language,
          questionCount: params.question_count,
          sourceChunks: params.source_chunks,
        }),
        temperature: 0.7,
        maxOutputTokens: 4000,
      })
    );

    const durationMs = Date.now() - startTime;

    // Parse AI response
    let questions;
    const rawText = result.text;
    try {
      let text = rawText.trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      questions = JSON.parse(text.trim());
    } catch {
      // Attempt repair before giving up
      try {
        questions = JSON.parse(repairJSON(rawText));
      } catch {
        return NextResponse.json(
          { error: 'AI returned invalid JSON. Please try again.' },
          { status: 502 }
        );
      }
    }

    const inputTokens = result.usage?.inputTokens || 0;
    const outputTokens = result.usage?.outputTokens || 0;

    await supabase.from('ai_generation_log').insert({
      organization_id: (await supabase.rpc('get_user_org_id')).data,
      user_id: user.id,
      operation: 'generate_quiz',
      model: platform.modelId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: (inputTokens * 3 + outputTokens * 15) / 1_000_000,
      input_summary: `Quiz for: ${params.module_title}`,
      output_summary: `${Array.isArray(questions) ? questions.length : 0} questions generated`,
      duration_ms: durationMs,
    });

    await logUsage(supabase, 'generate_quiz', inputTokens + outputTokens);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
