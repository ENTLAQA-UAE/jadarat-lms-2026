import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAIProvider, logUsage, GatewayError } from '@/lib/ai/gateway';
import { streamText } from 'ai';
import { LESSON_SYSTEM_PROMPT, LESSON_USER_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';

export const maxDuration = 120;

const requestSchema = z.object({
  lesson_title: z.string().min(1),
  lesson_description: z.string().min(1),
  module_title: z.string().min(1),
  course_title: z.string().min(1),
  suggested_blocks: z.array(z.string()),
  language: z.enum(['ar', 'en']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  audience: z.string(),
  previous_context: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
      });
    }

    const params = parsed.data;

    let gateway;
    try {
      gateway = await getAIProvider(supabase, user.id, 'generate_lesson');
    } catch (err) {
      if (err instanceof GatewayError) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
        });
      }
      throw err;
    }

    const result = streamText({
      model: gateway.model,
      system: LESSON_SYSTEM_PROMPT,
      prompt: LESSON_USER_PROMPT({
        lessonTitle: params.lesson_title,
        lessonDescription: params.lesson_description,
        moduleTitle: params.module_title,
        courseTitle: params.course_title,
        suggestedBlocks: params.suggested_blocks,
        language: params.language,
        difficulty: params.difficulty,
        audience: params.audience,
        previousLessonsContext: params.previous_context,
      }),
      temperature: 0.7,
      maxOutputTokens: 8000,
      onFinish: async ({ usage }) => {
        await supabase.from('ai_generation_log').insert({
          organization_id: (await supabase.rpc('get_user_org_id')).data,
          user_id: user.id,
          operation: 'generate_lesson',
          model: gateway.config.model,
          input_tokens: usage?.inputTokens || 0,
          output_tokens: usage?.outputTokens || 0,
          cost_usd: estimateCost(
            usage?.inputTokens || 0,
            usage?.outputTokens || 0
          ),
          input_summary: `Lesson: ${params.lesson_title}`,
          output_summary: `Generated lesson content`,
        });
        await logUsage(
          supabase,
          'generate_lesson',
          (usage?.inputTokens || 0) + (usage?.outputTokens || 0)
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Lesson generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate lesson' }),
      { status: 500 }
    );
  }
}

function estimateCost(input: number, output: number): number {
  return (input * 3 + output * 15) / 1_000_000;
}
