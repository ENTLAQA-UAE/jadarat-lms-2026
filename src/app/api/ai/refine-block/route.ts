import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPlatformAIModel, logUsage, GatewayError } from '@/lib/ai/gateway';
import { streamText } from 'ai';
import { REFINE_PROMPTS } from '@/lib/ai/prompts';
import { z } from 'zod';

export const maxDuration = 60;

const requestSchema = z.object({
  content: z.string().min(1),
  action: z.enum(['expand', 'simplify', 'translate', 'rephrase', 'addExample']),
  language: z.enum(['ar', 'en']),
  target_language: z.enum(['ar', 'en']).optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success)
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
      });

    const { content, action, language, target_language, tone, audience } =
      parsed.data;

    // Use platform-level AI key (not tenant's per-org config)
    let platform;
    try {
      platform = getPlatformAIModel();
    } catch (err) {
      if (err instanceof GatewayError)
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
        });
      throw err;
    }

    let prompt: string;
    switch (action) {
      case 'expand':
        prompt = REFINE_PROMPTS.expand(content, language);
        break;
      case 'simplify':
        prompt = REFINE_PROMPTS.simplify(
          content,
          audience || 'general',
          language
        );
        break;
      case 'translate':
        prompt = REFINE_PROMPTS.translate(
          content,
          target_language || (language === 'ar' ? 'en' : 'ar')
        );
        break;
      case 'rephrase':
        prompt = REFINE_PROMPTS.rephrase(
          content,
          tone || 'conversational',
          language
        );
        break;
      case 'addExample':
        prompt = REFINE_PROMPTS.addExample(content, language);
        break;
    }

    const result = streamText({
      model: platform.model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
      onFinish: async ({ usage }) => {
        await logUsage(
          supabase,
          'refine_block',
          (usage?.inputTokens || 0) + (usage?.outputTokens || 0)
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Refine error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to refine content' }),
      { status: 500 }
    );
  }
}
