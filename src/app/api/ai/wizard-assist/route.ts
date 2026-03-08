import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  getPlatformAIModel,
  logUsage,
  GatewayError,
  withRetry,
} from '@/lib/ai/gateway';
import { generateText } from 'ai';
import {
  WIZARD_ASSIST_SYSTEM_PROMPT,
  WIZARD_ASSIST_PROMPTS,
} from '@/lib/ai/prompts';
import { z } from 'zod';

export const maxDuration = 60;

// ── Shared sub-schemas ──────────────────────────────────────

const lessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  suggested_blocks: z.array(z.string()),
  estimated_duration_minutes: z.number(),
  topics: z.array(z.string()).default([]),
});

const moduleSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  lessons: z.array(lessonSchema),
});

const outlineSchema = z.object({
  title: z.string(),
  description: z.string(),
  target_audience: z.string(),
  difficulty: z.string(),
  language: z.string(),
  estimated_duration_minutes: z.number(),
  modules: z.array(moduleSchema),
  learning_outcomes: z.array(z.string()).default([]),
});

const courseContextSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  difficulty: z.string(),
  language: z.enum(['ar', 'en']),
});

// ── Request schemas (discriminated union) ───────────────────

const requestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('rewrite_objectives'),
    objectives: z.array(z.string()),
    context: z.object({
      topic: z.string(),
      audience: z.string(),
      language: z.enum(['ar', 'en']),
    }),
  }),
  z.object({
    action: z.literal('add_objectives'),
    objectives: z.array(z.string()),
    context: z.object({
      topic: z.string(),
      audience: z.string(),
      language: z.enum(['ar', 'en']),
    }),
  }),
  z.object({
    action: z.literal('restructure_outline'),
    outline: outlineSchema,
    language: z.enum(['ar', 'en']),
  }),
  z.object({
    action: z.literal('expand_outline'),
    outline: outlineSchema,
    language: z.enum(['ar', 'en']),
  }),
  z.object({
    action: z.literal('simplify_outline'),
    outline: outlineSchema,
    language: z.enum(['ar', 'en']),
  }),
  z.object({
    action: z.literal('expand_module'),
    module: moduleSchema,
    courseContext: courseContextSchema,
  }),
  z.object({
    action: z.literal('add_ai_lessons'),
    module: moduleSchema,
    courseContext: courseContextSchema,
  }),
  z.object({
    action: z.literal('rewrite_description'),
    lesson: z.object({ title: z.string(), description: z.string() }),
    moduleTitle: z.string(),
    language: z.enum(['ar', 'en']),
  }),
  z.object({
    action: z.literal('suggest_topics'),
    lesson: z.object({
      title: z.string(),
      description: z.string(),
      topics: z.array(z.string()).optional(),
    }),
    moduleTitle: z.string(),
    language: z.enum(['ar', 'en']),
  }),
]);

// ── Build prompt for each action ────────────────────────────

function buildPrompt(
  data: z.infer<typeof requestSchema>
): string {
  switch (data.action) {
    case 'rewrite_objectives':
      return WIZARD_ASSIST_PROMPTS.rewrite_objectives({
        objectives: data.objectives,
        topic: data.context.topic,
        audience: data.context.audience,
        language: data.context.language,
      });
    case 'add_objectives':
      return WIZARD_ASSIST_PROMPTS.add_objectives({
        objectives: data.objectives,
        topic: data.context.topic,
        audience: data.context.audience,
        language: data.context.language,
      });
    case 'restructure_outline':
      return WIZARD_ASSIST_PROMPTS.restructure_outline({
        outline: JSON.stringify(data.outline, null, 2),
        language: data.language,
      });
    case 'expand_outline':
      return WIZARD_ASSIST_PROMPTS.expand_outline({
        outline: JSON.stringify(data.outline, null, 2),
        language: data.language,
      });
    case 'simplify_outline':
      return WIZARD_ASSIST_PROMPTS.simplify_outline({
        outline: JSON.stringify(data.outline, null, 2),
        language: data.language,
      });
    case 'expand_module':
      return WIZARD_ASSIST_PROMPTS.expand_module({
        module: JSON.stringify(data.module, null, 2),
        topic: data.courseContext.topic,
        audience: data.courseContext.audience,
        difficulty: data.courseContext.difficulty,
        language: data.courseContext.language,
      });
    case 'add_ai_lessons':
      return WIZARD_ASSIST_PROMPTS.add_ai_lessons({
        module: JSON.stringify(data.module, null, 2),
        topic: data.courseContext.topic,
        audience: data.courseContext.audience,
        difficulty: data.courseContext.difficulty,
        language: data.courseContext.language,
      });
    case 'rewrite_description':
      return WIZARD_ASSIST_PROMPTS.rewrite_description({
        lessonTitle: data.lesson.title,
        lessonDescription: data.lesson.description,
        moduleTitle: data.moduleTitle,
        language: data.language,
      });
    case 'suggest_topics':
      return WIZARD_ASSIST_PROMPTS.suggest_topics({
        lessonTitle: data.lesson.title,
        lessonDescription: data.lesson.description,
        existingTopics: data.lesson.topics || [],
        moduleTitle: data.moduleTitle,
        language: data.language,
      });
  }
}

// ── Route handler ───────────────────────────────────────────

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

    const data = parsed.data;

    let platform;
    try {
      platform = getPlatformAIModel();
    } catch (err) {
      if (err instanceof GatewayError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      throw err;
    }

    const prompt = buildPrompt(data);

    // Outline actions need more tokens
    const isOutlineAction = [
      'restructure_outline',
      'expand_outline',
      'simplify_outline',
      'expand_module',
    ].includes(data.action);

    const result = await withRetry(() =>
      generateText({
        model: platform.model,
        system: WIZARD_ASSIST_SYSTEM_PROMPT,
        prompt,
        temperature: 0.7,
        maxOutputTokens: isOutlineAction ? 4000 : 1500,
      })
    );

    // Parse JSON from response
    let parsedResult: unknown;
    try {
      let text = result.text.trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      parsedResult = JSON.parse(text.trim());
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 502 }
      );
    }

    // Log usage
    const totalTokens =
      (result.usage?.inputTokens || 0) + (result.usage?.outputTokens || 0);
    await logUsage(supabase, `wizard_assist_${data.action}`, totalTokens);

    return NextResponse.json({ result: parsedResult });
  } catch (error) {
    console.error('Wizard assist error:', error);
    return NextResponse.json(
      { error: 'AI assist failed. Please try again.' },
      { status: 500 }
    );
  }
}
