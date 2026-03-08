'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor.store';
import type {
  Block,
  BlockType,
  ContentOptions,
  CourseOutline,
  DocumentChunk,
} from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { resolveGenerateMarker } from '@/components/authoring/ai/AIImageGenerator';

// ============================================================
// TYPES
// ============================================================

interface StepGenerationProps {
  courseId: number;
  outline: CourseOutline;
  options: ContentOptions;
  language: 'ar' | 'en';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audience: string;
  sourceChunks?: DocumentChunk[];
  onComplete: () => void;
  onBack: () => void;
}

interface LessonStatus {
  moduleIndex: number;
  lessonIndex: number;
  moduleTitle: string;
  lessonTitle: string;
  status: 'pending' | 'generating' | 'generating_images' | 'done' | 'error';
  blocks: Block[];
  error?: string;
  imageCount?: number;
  imagesResolved?: number;
  startTime?: number;
  endTime?: number;
}

// ============================================================
// BLOCK VALIDATION — validates AI-generated blocks before loading
// ============================================================

const VALID_BLOCK_TYPES = new Set([
  'text', 'image', 'video', 'audio', 'embed', 'quote', 'list', 'code',
  'table', 'divider', 'cover', 'gallery', 'chart', 'callout', 'statement',
  'button', 'attachment', 'accordion', 'tabs', 'flashcard', 'labeled_graphic',
  'process', 'timeline', 'hotspot', 'scenario', 'continue', 'multiple_choice',
  'true_false', 'multiple_response', 'fill_in_blank', 'matching', 'sorting',
]);

function validateBlock(block: unknown): block is Block {
  if (!block || typeof block !== 'object') return false;
  const b = block as Record<string, unknown>;

  // Must have type and data
  if (!b.type || !VALID_BLOCK_TYPES.has(b.type as string)) return false;
  if (!b.data || typeof b.data !== 'object') return false;

  return true;
}

function sanitizeBlocks(rawBlocks: unknown[]): Block[] {
  return rawBlocks
    .filter(validateBlock)
    .map((block, index) => ({
      ...block,
      id: block.id || uuidv4(),
      order: index,
      visible: block.visible !== false,
      locked: block.locked === true,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'ai' as const,
        ...((block.metadata && typeof block.metadata === 'object') ? block.metadata : {}),
      },
    }));
}

// ============================================================
// COMPONENT
// ============================================================

export function StepGeneration({
  courseId,
  outline,
  options,
  language,
  difficulty,
  audience,
  sourceChunks,
  onComplete,
  onBack,
}: StepGenerationProps) {
  const loadContent = useEditorStore((s) => s.loadContent);
  const [lessons, setLessons] = useState<LessonStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const abortRef = useRef(false);
  const avgTimeRef = useRef(0);
  const lessonsRef = useRef<LessonStatus[]>([]);

  // Keep ref in sync with state for access inside callbacks
  useEffect(() => {
    lessonsRef.current = lessons;
  }, [lessons]);

  // Prepare source material context
  const sourceContext = sourceChunks && sourceChunks.length > 0
    ? sourceChunks.map((c) => c.text).join('\n\n').slice(0, 10000)
    : undefined;

  // Build flat lesson list from outline
  useEffect(() => {
    const flat: LessonStatus[] = [];
    outline.modules.forEach((mod, mi) => {
      mod.lessons.forEach((les, li) => {
        flat.push({
          moduleIndex: mi,
          lessonIndex: li,
          moduleTitle: mod.title,
          lessonTitle: les.title,
          status: 'pending',
          blocks: [],
        });
      });
    });
    setLessons(flat);
  }, [outline]);

  // Auto-start generation when lessons are loaded
  const hasStarted = useRef(false);
  useEffect(() => {
    if (lessons.length > 0 && !hasStarted.current && !isGenerating && !isDone) {
      hasStarted.current = true;
      generateAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons.length]);

  // Generate a single lesson
  const generateSingleLesson = useCallback(async (
    lessonIndex: number,
    lessonData: LessonStatus,
    durations: number[],
  ) => {
    const outlineLesson =
      outline.modules[lessonData.moduleIndex].lessons[lessonData.lessonIndex];

    const lessonStart = Date.now();

    setLessons((prev) =>
      prev.map((l, idx) =>
        idx === lessonIndex ? { ...l, status: 'generating', startTime: lessonStart, error: undefined } : l
      )
    );

    try {
      // Determine suggested blocks based on content options
      let suggestedBlocks: string[] = [...(outlineLesson.suggested_blocks || [])];
      if (options.content_format === 'text_only') {
        suggestedBlocks = suggestedBlocks.filter(
          (b) => b === 'text' || b === 'divider' || b === 'cover'
        );
        if (suggestedBlocks.length === 0) suggestedBlocks = ['text', 'cover'];
      }
      if (options.assessment_density === 'none') {
        suggestedBlocks = suggestedBlocks.filter(
          (b) => b !== 'multiple_choice' && b !== 'true_false'
        );
      } else if (options.assessment_density === 'per_lesson') {
        if (!suggestedBlocks.some((b) => b === 'multiple_choice' || b === 'true_false')) {
          suggestedBlocks.push('multiple_choice', 'true_false');
        }
      } else if (options.assessment_density === 'per_module') {
        const moduleData = outline.modules[lessonData.moduleIndex];
        const isLastLesson = lessonData.lessonIndex === moduleData.lessons.length - 1;
        if (isLastLesson) {
          if (!suggestedBlocks.some((b) => b === 'multiple_choice' || b === 'true_false')) {
            suggestedBlocks.push('multiple_choice', 'true_false');
          }
        } else {
          suggestedBlocks = suggestedBlocks.filter(
            (b) => b !== 'multiple_choice' && b !== 'true_false'
          );
        }
      }

      // Build previous context from completed lessons
      const currentLessons = lessonsRef.current;
      let previousContext: string | undefined;
      if (lessonIndex > 0 && currentLessons[lessonIndex - 1]?.status === 'done') {
        const prevLesson = currentLessons[lessonIndex - 1];
        const prevTexts = prevLesson.blocks
          .filter((b) => b.type === 'text')
          .map((b) => (b.data as { content?: string }).content || '')
          .join(' ')
          .slice(0, 500);
        previousContext = `Previous lesson "${prevLesson.lessonTitle}": ${prevTexts}`;
      }

      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_title: outlineLesson.title,
          lesson_description: outlineLesson.description,
          module_title: outline.modules[lessonData.moduleIndex].title,
          course_title: outline.title,
          suggested_blocks: suggestedBlocks,
          assessment_density: options.assessment_density,
          language,
          difficulty,
          audience,
          previous_context: previousContext,
          source_chunks: sourceContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate lesson');
      }

      // Read streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      // Parse and validate blocks
      let blocks: Block[] = [];
      try {
        let text = fullText.trim();
        if (text.startsWith('```json')) text = text.slice(7);
        if (text.startsWith('```')) text = text.slice(3);
        if (text.endsWith('```')) text = text.slice(0, -3);
        const rawBlocks = JSON.parse(text.trim());
        if (!Array.isArray(rawBlocks)) throw new Error('Not an array');

        // Validate and sanitize blocks against schema
        blocks = sanitizeBlocks(rawBlocks);

        // Normalize flashcard blocks
        for (const block of blocks) {
          if (block.type === 'flashcard' && Array.isArray((block.data as any)?.cards)) {
            (block.data as any).cards = (block.data as any).cards.map((card: any) => ({
              id: card.id || uuidv4(),
              front: card.front || card.front_text || '',
              back: card.back || card.back_text || '',
              image_front: card.image_front || card.front_image || undefined,
              image_back: card.image_back || card.back_image || undefined,
            }));
          }
        }

        if (blocks.length === 0) {
          throw new Error('No valid blocks generated');
        }
      } catch {
        blocks = [
          {
            id: uuidv4(),
            type: 'text' as BlockType,
            order: 0,
            visible: true,
            locked: false,
            metadata: {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'ai',
            },
            data: {
              content: `<p>${fullText.slice(0, 500)}</p>`,
              alignment: 'start',
              direction: language === 'ar' ? 'rtl' : 'ltr',
            },
          } as Block,
        ];
      }

      // Resolve GENERATE: markers
      if (options.generate_images) {
        const imageBlocks = blocks.filter((b) => {
          const bd = b.data as Record<string, unknown>;
          return (
            (b.type === 'image' && typeof bd.src === 'string' && bd.src.startsWith('GENERATE:')) ||
            (b.type === 'cover' && typeof bd.background_image === 'string' && bd.background_image.startsWith('GENERATE:'))
          );
        });

        if (imageBlocks.length > 0) {
          setLessons((prev) =>
            prev.map((l, idx) =>
              idx === lessonIndex
                ? { ...l, status: 'generating_images', imageCount: imageBlocks.length, imagesResolved: 0 }
                : l
            )
          );

          let resolved = 0;
          for (let imgI = 0; imgI < imageBlocks.length; imgI += 2) {
            if (abortRef.current) break;
            const batch = imageBlocks.slice(imgI, imgI + 2);
            await Promise.all(
              batch.map(async (block) => {
                const blockData = block.data as Record<string, unknown>;
                if (block.type === 'image' && typeof blockData.src === 'string' && blockData.src.startsWith('GENERATE:')) {
                  const url = await resolveGenerateMarker(blockData.src, false);
                  if (url) blockData.src = url;
                }
                if (block.type === 'cover' && typeof blockData.background_image === 'string' && blockData.background_image.startsWith('GENERATE:')) {
                  const url = await resolveGenerateMarker(blockData.background_image, true);
                  if (url) blockData.background_image = url;
                }
                resolved++;
                setLessons((prev) =>
                  prev.map((l, idx) =>
                    idx === lessonIndex ? { ...l, imagesResolved: resolved } : l
                  )
                );
              })
            );
          }
        }
      } else {
        for (const block of blocks) {
          const blockData = block.data as Record<string, unknown>;
          if (block.type === 'image' && typeof blockData.src === 'string' && blockData.src.startsWith('GENERATE:')) {
            blockData.src = '';
          }
          if (block.type === 'cover' && typeof blockData.background_image === 'string' && blockData.background_image.startsWith('GENERATE:')) {
            blockData.background_image = '';
          }
        }
      }

      const lessonEnd = Date.now();
      durations.push(lessonEnd - lessonStart);
      avgTimeRef.current = durations.reduce((a, b) => a + b, 0) / durations.length;

      setLessons((prev) =>
        prev.map((l, idx) =>
          idx === lessonIndex ? { ...l, status: 'done', blocks, endTime: lessonEnd } : l
        )
      );
    } catch (error) {
      setLessons((prev) =>
        prev.map((l, idx) =>
          idx === lessonIndex
            ? { ...l, status: 'error', error: error instanceof Error ? error.message : 'Generation failed' }
            : l
        )
      );
    }
  }, [outline, options, language, difficulty, audience, sourceContext]);

  // Regenerate a single lesson (retry failed or re-do completed)
  const regenerateLesson = useCallback(async (lessonIndex: number) => {
    const lessonData = lessonsRef.current[lessonIndex];
    if (!lessonData) return;
    await generateSingleLesson(lessonIndex, lessonData, []);
  }, [generateSingleLesson]);

  const generateAll = useCallback(async () => {
    setIsGenerating(true);
    abortRef.current = false;
    const durations: number[] = [];
    const BATCH_SIZE = 3;

    for (let batchStart = 0; batchStart < lessons.length; batchStart += BATCH_SIZE) {
      if (abortRef.current) break;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, lessons.length);
      const batchPromises: Promise<void>[] = [];
      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(generateSingleLesson(i, lessons[i], durations));
      }
      await Promise.all(batchPromises);
    }

    // Quiz generation
    if (options.assessment_density !== 'none' && !abortRef.current) {
      try {
        const currentLessons = lessonsRef.current;
        const moduleMap = new Map<number, number[]>();
        for (let i = 0; i < currentLessons.length; i++) {
          const mi = currentLessons[i].moduleIndex;
          if (!moduleMap.has(mi)) moduleMap.set(mi, []);
          moduleMap.get(mi)!.push(i);
        }

        for (const [moduleIndex, lessonIndices] of Array.from(moduleMap.entries())) {
          if (abortRef.current) break;
          const doneLessons = lessonIndices.filter((li: number) => currentLessons[li].status === 'done');
          if (doneLessons.length === 0) continue;
          const targetLessonIdx = doneLessons[doneLessons.length - 1];

          const lessonContents = doneLessons
            .map((li: number) => (currentLessons[li].blocks || [])
              .filter((b) => b.type === 'text')
              .map((b) => (b.data as { content?: string })?.content || '')
              .join('\n')
            )
            .filter(Boolean)
            .join('\n\n');

          if (!lessonContents.trim()) continue;

          try {
            const quizRes = await fetch('/api/ai/generate-quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                module_title: outline.modules[moduleIndex].title,
                lesson_contents: lessonContents.slice(0, 8000),
                language,
                question_count: options.assessment_density === 'per_lesson' ? 3 : 5,
                source_chunks: sourceContext?.slice(0, 5000),
              }),
            });

            if (quizRes.ok) {
              const { questions } = await quizRes.json();
              if (Array.isArray(questions) && questions.length > 0) {
                const quizBlocks: Block[] = questions.map((q: any, qi: number) => ({
                  id: uuidv4(),
                  type: q.type || 'multiple_choice',
                  order: 900 + qi,
                  visible: true,
                  locked: false,
                  metadata: { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: 'ai' as const },
                  data: q.data || q,
                }));
                setLessons((prev) =>
                  prev.map((l, idx) => idx === targetLessonIdx ? { ...l, blocks: [...(l.blocks || []), ...quizBlocks] } : l)
                );
              }
            }
          } catch {
            console.warn(`Quiz generation failed for module ${moduleIndex}`);
          }
        }
      } catch {
        console.warn('Quiz generation post-processing failed');
      }
    }

    setIsGenerating(false);
    setIsDone(true);
  }, [lessons.length, generateSingleLesson, options.assessment_density, outline.modules, language, sourceContext]);

  const handleApplyToEditor = () => {
    const currentLessons = lessonsRef.current;
    const modules = outline.modules.map((mod, mi) => ({
      id: uuidv4(),
      title: mod.title,
      order: mi,
      is_locked: false,
      lessons: mod.lessons.map((les, li) => {
        const generated = currentLessons.find((l) => l.moduleIndex === mi && l.lessonIndex === li);
        return {
          id: uuidv4(),
          title: les.title,
          order: li,
          is_locked: false,
          blocks: (generated?.blocks || []).map((b, bi) => ({ ...b, id: b.id || uuidv4(), order: bi })),
        };
      }),
    }));

    loadContent(courseId, {
      modules,
      settings: {
        theme: { primary_color: '#1a73e8', secondary_color: '#f59e0b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'cairo', border_radius: 'medium', cover_style: 'gradient', navigation_style: 'sidebar', lesson_header_style: 'full_width_banner', dark_mode: false },
        navigation: 'sequential', show_progress_bar: true, show_lesson_list: true, completion_criteria: 'all_blocks', language, direction: language === 'ar' ? 'rtl' : 'ltr',
        sidebar_default_open: true, allow_search: true, allow_mark_complete: false, show_lesson_count: true,
        quiz_settings: { allow_retries: true, max_retries: 0, randomize_questions: false, shuffle_answers: true, require_passing_to_continue: false },
        block_entrance_animations: true,
      },
    }, '', 1);

    toast.success('Course content loaded into editor');
    onComplete();
  };

  const completedCount = lessons.filter((l) => l.status === 'done').length;
  const errorCount = lessons.filter((l) => l.status === 'error').length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round(((completedCount + errorCount) / totalCount) * 100) : 0;
  const remainingLessons = totalCount - completedCount - errorCount;
  const estimatedSecondsRemaining = avgTimeRef.current > 0 ? Math.round((remainingLessons * avgTimeRef.current) / 1000) : 0;
  const currentLesson = lessons.find((l) => l.status === 'generating' || l.status === 'generating_images');
  const canOpenEditor = completedCount > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generating Course Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {completedCount} of {totalCount} lessons generated
                {errorCount > 0 && <span className="text-destructive ml-1">({errorCount} failed)</span>}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {currentLesson && (
            <p className="text-sm text-muted-foreground text-center">
              Generating: <strong>{currentLesson.lessonTitle}</strong>
            </p>
          )}

          {isGenerating && estimatedSecondsRemaining > 0 && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              ~{estimatedSecondsRemaining < 60 ? `${estimatedSecondsRemaining}s` : `${Math.ceil(estimatedSecondsRemaining / 60)}min`} remaining
            </p>
          )}

          {isGenerating && !currentLesson && (
            <p className="text-sm text-muted-foreground text-center">Preparing to generate lessons...</p>
          )}
        </CardContent>
      </Card>

      {/* Lesson list */}
      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${
              lesson.status === 'done' ? 'bg-card border-green-200 dark:border-green-800'
                : lesson.status === 'generating' || lesson.status === 'generating_images' ? 'bg-primary/5 border-primary/20'
                : lesson.status === 'error' ? 'bg-destructive/5 border-destructive/20'
                : 'bg-card border-border opacity-60'
            }`}
          >
            {lesson.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
            {lesson.status === 'generating' && <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />}
            {lesson.status === 'generating_images' && <Loader2 className="h-5 w-5 text-amber-500 animate-spin shrink-0" />}
            {lesson.status === 'done' && (
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            {lesson.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{lesson.lessonTitle}</p>
              <p className="text-xs text-muted-foreground truncate">{lesson.moduleTitle}</p>
            </div>

            {lesson.status === 'generating_images' && (
              <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300">
                Images {lesson.imagesResolved || 0}/{lesson.imageCount || 0}
              </Badge>
            )}
            {lesson.status === 'done' && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="secondary">{lesson.blocks.length} blocks</Badge>
                {!isGenerating && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => regenerateLesson(i)} title="Regenerate this lesson">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
            {lesson.status === 'error' && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="destructive">Error</Badge>
                {!isGenerating && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => regenerateLesson(i)} title="Retry this lesson">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {canOpenEditor && !isGenerating && (
          <Button onClick={handleApplyToEditor}>
            {errorCount > 0 ? `Open in Editor (${completedCount}/${totalCount} lessons)` : 'Open in Editor'}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
