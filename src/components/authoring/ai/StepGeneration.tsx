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
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor.store';
import type {
  Block,
  ContentOptions,
  CourseOutline,
} from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { resolveGenerateMarker } from '@/components/authoring/ai/AIImageGenerator';

interface StepGenerationProps {
  courseId: number;
  outline: CourseOutline;
  options: ContentOptions;
  language: 'ar' | 'en';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audience: string;
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

export function StepGeneration({
  courseId,
  outline,
  options,
  language,
  difficulty,
  audience,
  onComplete,
  onBack,
}: StepGenerationProps) {
  const loadContent = useEditorStore((s) => s.loadContent);
  const [lessons, setLessons] = useState<LessonStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const abortRef = useRef(false);
  const avgTimeRef = useRef(0);

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

  // Generate a single lesson and return its blocks
  const generateSingleLesson = useCallback(async (
    lessonIndex: number,
    lessonData: LessonStatus,
    durations: number[],
  ) => {
    const outlineLesson =
      outline.modules[lessonData.moduleIndex].lessons[lessonData.lessonIndex];

    const lessonStart = Date.now();

    // Mark as generating
    setLessons((prev) =>
      prev.map((l, idx) =>
        idx === lessonIndex ? { ...l, status: 'generating', startTime: lessonStart } : l
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
        const hasQuiz = suggestedBlocks.some(
          (b) => b === 'multiple_choice' || b === 'true_false'
        );
        if (!hasQuiz) {
          suggestedBlocks.push('multiple_choice', 'true_false');
        }
      } else if (options.assessment_density === 'per_module') {
        const moduleData = outline.modules[lessonData.moduleIndex];
        const isLastLesson =
          lessonData.lessonIndex === moduleData.lessons.length - 1;
        if (isLastLesson) {
          const hasQuiz = suggestedBlocks.some(
            (b) => b === 'multiple_choice' || b === 'true_false'
          );
          if (!hasQuiz) {
            suggestedBlocks.push('multiple_choice', 'true_false');
          }
        } else {
          suggestedBlocks = suggestedBlocks.filter(
            (b) => b !== 'multiple_choice' && b !== 'true_false'
          );
        }
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
          previous_context:
            lessonIndex > 0
              ? `Previous lesson: ${lessons[lessonIndex - 1]?.lessonTitle}`
              : undefined,
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

      // Parse the complete JSON response
      let blocks: Block[] = [];
      try {
        let text = fullText.trim();
        if (text.startsWith('```json')) text = text.slice(7);
        if (text.startsWith('```')) text = text.slice(3);
        if (text.endsWith('```')) text = text.slice(0, -3);
        blocks = JSON.parse(text.trim());
        if (!Array.isArray(blocks)) blocks = [];

        // Normalize flashcard blocks: AI may use front_text/back_text instead of front/back
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
      } catch {
        blocks = [
          {
            id: uuidv4(),
            type: 'text',
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

      // Resolve GENERATE: markers in image and cover blocks
      if (options.generate_images) {
        const imageMarkers = blocks.filter(
          (b) =>
            (b.type === 'image' &&
              (b.data as { src?: string }).src?.startsWith('GENERATE:')) ||
            (b.type === 'cover' &&
              (b.data as { background_image?: string }).background_image?.startsWith(
                'GENERATE:'
              ))
        );

        if (imageMarkers.length > 0) {
          setLessons((prev) =>
            prev.map((l, idx) =>
              idx === lessonIndex
                ? {
                    ...l,
                    status: 'generating_images',
                    imageCount: imageMarkers.length,
                    imagesResolved: 0,
                  }
                : l
            )
          );

          // Resolve images in parallel (up to 2 at a time per lesson)
          const imageBlocks = blocks.filter((b) => {
            const bd = b.data as Record<string, unknown>;
            return (
              (b.type === 'image' && typeof bd.src === 'string' && bd.src.startsWith('GENERATE:')) ||
              (b.type === 'cover' && typeof bd.background_image === 'string' && bd.background_image.startsWith('GENERATE:'))
            );
          });

          let resolved = 0;
          // Process images 2 at a time
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
        // Remove GENERATE: markers if images are disabled
        for (const block of blocks) {
          const blockData = block.data as Record<string, unknown>;
          if (
            block.type === 'image' &&
            typeof blockData.src === 'string' &&
            blockData.src.startsWith('GENERATE:')
          ) {
            blockData.src = '';
          }
          if (
            block.type === 'cover' &&
            typeof blockData.background_image === 'string' &&
            blockData.background_image.startsWith('GENERATE:')
          ) {
            blockData.background_image = '';
          }
        }
      }

      const lessonEnd = Date.now();
      durations.push(lessonEnd - lessonStart);
      avgTimeRef.current =
        durations.reduce((a, b) => a + b, 0) / durations.length;

      setLessons((prev) =>
        prev.map((l, idx) =>
          idx === lessonIndex
            ? { ...l, status: 'done', blocks, endTime: lessonEnd }
            : l
        )
      );
    } catch (error) {
      setLessons((prev) =>
        prev.map((l, idx) =>
          idx === lessonIndex
            ? {
                ...l,
                status: 'error',
                error:
                  error instanceof Error
                    ? error.message
                    : 'Generation failed',
              }
            : l
        )
      );
    }
  }, [outline, options, language, difficulty, audience, lessons]);

  const generateAll = useCallback(async () => {
    setIsGenerating(true);
    abortRef.current = false;
    const durations: number[] = [];
    const BATCH_SIZE = 3; // Generate 3 lessons in parallel

    for (let batchStart = 0; batchStart < lessons.length; batchStart += BATCH_SIZE) {
      if (abortRef.current) break;

      const batchEnd = Math.min(batchStart + BATCH_SIZE, lessons.length);
      const batchPromises: Promise<void>[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(generateSingleLesson(i, lessons[i], durations));
      }

      // Wait for current batch to complete before starting next batch
      await Promise.all(batchPromises);
    }

    // After all lessons are generated, run quiz generation if enabled
    if (options.assessment_density !== 'none' && !abortRef.current) {
      try {
        // Group lessons by module to generate quiz per module
        const moduleMap = new Map<number, number[]>();
        for (let i = 0; i < lessons.length; i++) {
          const mi = lessons[i].moduleIndex;
          if (!moduleMap.has(mi)) moduleMap.set(mi, []);
          moduleMap.get(mi)!.push(i);
        }

        const moduleEntries = Array.from(moduleMap.entries());
        for (const [moduleIndex, lessonIndices] of moduleEntries) {
          if (abortRef.current) break;

          // Find the last lesson in this module that was successfully generated
          const doneLessons = lessonIndices.filter(
            (li: number) => lessons[li].status === 'done'
          );
          if (doneLessons.length === 0) continue;

          const targetLessonIdx = doneLessons[doneLessons.length - 1];

          // Collect text content from all lessons in this module for quiz context
          const lessonContents = doneLessons
            .map((li: number) => {
              const ls = lessons[li];
              const blocks = ls.blocks || [];
              return blocks
                .filter((b: any) => b.type === 'text')
                .map((b: any) => (b.data as any)?.content || '')
                .join('\n');
            })
            .filter(Boolean)
            .join('\n\n');

          if (!lessonContents.trim()) continue;

          const questionCount = options.assessment_density === 'per_lesson' ? 3 : 5;

          try {
            const quizRes = await fetch('/api/ai/generate-quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                module_title: outline.modules[moduleIndex].title,
                lesson_contents: lessonContents.slice(0, 8000),
                language,
                question_count: questionCount,
              }),
            });

            if (quizRes.ok) {
              const { questions } = await quizRes.json();
              if (Array.isArray(questions) && questions.length > 0) {
                // Convert quiz questions to block format and append to the target lesson
                const quizBlocks: Block[] = questions.map((q: any, qi: number) => ({
                  id: uuidv4(),
                  type: q.type || 'multiple_choice',
                  order: 900 + qi,
                  visible: true,
                  locked: false,
                  metadata: {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    created_by: 'ai' as const,
                  },
                  data: q.data || q,
                }));

                setLessons((prev) =>
                  prev.map((l, idx) =>
                    idx === targetLessonIdx
                      ? { ...l, blocks: [...(l.blocks || []), ...quizBlocks] }
                      : l
                  )
                );
              }
            }
          } catch {
            // Quiz generation is optional — don't fail the whole process
            console.warn(`Quiz generation failed for module ${moduleIndex}`);
          }
        }
      } catch {
        console.warn('Quiz generation post-processing failed');
      }
    }

    setIsGenerating(false);
    setIsDone(true);
  }, [lessons.length, generateSingleLesson, options.assessment_density, outline.modules, language]);

  const handleApplyToEditor = () => {
    const modules = outline.modules.map((mod, mi) => ({
      id: uuidv4(),
      title: mod.title,
      order: mi,
      is_locked: false,
      lessons: mod.lessons.map((les, li) => {
        const generated = lessons.find(
          (l) => l.moduleIndex === mi && l.lessonIndex === li
        );
        return {
          id: uuidv4(),
          title: les.title,
          order: li,
          is_locked: false,
          blocks: (generated?.blocks || []).map((b, bi) => ({
            ...b,
            id: b.id || uuidv4(),
            order: bi,
          })),
        };
      }),
    }));

    loadContent(
      courseId,
      {
        modules,
        settings: {
          theme: {
            primary_color: '#1a73e8',
            secondary_color: '#f59e0b',
            background_color: '#ffffff',
            text_color: '#1f2937',
            font_family: 'cairo',
            border_radius: 'medium',
            cover_style: 'gradient',
            navigation_style: 'sidebar',
            lesson_header_style: 'full_width_banner',
            dark_mode: false,
          },
          navigation: 'sequential',
          show_progress_bar: true,
          show_lesson_list: true,
          completion_criteria: 'all_blocks',
          language,
          direction: language === 'ar' ? 'rtl' : 'ltr',
          sidebar_default_open: true,
          allow_search: true,
          allow_mark_complete: false,
          show_lesson_count: true,
          quiz_settings: {
            allow_retries: true,
            max_retries: 0,
            randomize_questions: false,
            shuffle_answers: true,
            require_passing_to_continue: false,
          },
          block_entrance_animations: true,
        },
      },
      '',
      1
    );

    toast.success('Course content loaded into editor');
    onComplete();
  };

  const completedCount = lessons.filter((l) => l.status === 'done').length;
  const errorCount = lessons.filter((l) => l.status === 'error').length;
  const totalCount = lessons.length;
  const progressPercent =
    totalCount > 0
      ? Math.round(((completedCount + errorCount) / totalCount) * 100)
      : 0;

  // Estimated time remaining
  const remainingLessons = totalCount - completedCount - errorCount;
  const estimatedSecondsRemaining =
    avgTimeRef.current > 0
      ? Math.round((remainingLessons * avgTimeRef.current) / 1000)
      : 0;

  const currentLesson = lessons.find((l) => l.status === 'generating' || l.status === 'generating_images');

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
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Current lesson indicator */}
          {currentLesson && (
            <p className="text-sm text-muted-foreground text-center">
              Generating: <strong>{currentLesson.lessonTitle}</strong>
            </p>
          )}

          {/* Time estimate */}
          {isGenerating && estimatedSecondsRemaining > 0 && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              ~{estimatedSecondsRemaining < 60
                ? `${estimatedSecondsRemaining}s`
                : `${Math.ceil(estimatedSecondsRemaining / 60)}min`}{' '}
              remaining
            </p>
          )}

          {isGenerating && !currentLesson && (
            <p className="text-sm text-muted-foreground text-center">
              Preparing to generate lessons...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lesson list */}
      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${
              lesson.status === 'done'
                ? 'bg-card border-green-200 dark:border-green-800'
                : lesson.status === 'generating' || lesson.status === 'generating_images'
                  ? 'bg-primary/5 border-primary/20'
                  : lesson.status === 'error'
                    ? 'bg-destructive/5 border-destructive/20'
                    : 'bg-card border-border opacity-60'
            }`}
          >
            {lesson.status === 'pending' && (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
            )}
            {lesson.status === 'generating' && (
              <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
            )}
            {lesson.status === 'generating_images' && (
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin shrink-0" />
            )}
            {lesson.status === 'done' && (
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            {lesson.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {lesson.lessonTitle}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {lesson.moduleTitle}
              </p>
            </div>

            {lesson.status === 'generating_images' && (
              <Badge
                variant="outline"
                className="shrink-0 text-amber-600 border-amber-300"
              >
                Images {lesson.imagesResolved || 0}/{lesson.imageCount || 0}
              </Badge>
            )}
            {lesson.status === 'done' && (
              <Badge variant="secondary" className="shrink-0">
                {lesson.blocks.length} blocks
              </Badge>
            )}
            {lesson.status === 'error' && (
              <Badge variant="destructive" className="shrink-0">
                Error
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isGenerating}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {isDone && (
          <Button onClick={handleApplyToEditor}>
            Open in Editor
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
