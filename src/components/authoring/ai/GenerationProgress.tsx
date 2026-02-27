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
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor.store';
import type { Block, CourseOutline } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';

interface GenerationProgressProps {
  courseId: number;
  outline: CourseOutline;
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
  status: 'pending' | 'generating' | 'done' | 'error';
  blocks: Block[];
  error?: string;
}

export function GenerationProgress({
  courseId,
  outline,
  language,
  difficulty,
  audience,
  onComplete,
  onBack,
}: GenerationProgressProps) {
  const loadContent = useEditorStore((s) => s.loadContent);
  const [lessons, setLessons] = useState<LessonStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const abortRef = useRef(false);

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

  const generateAll = useCallback(async () => {
    setIsGenerating(true);
    abortRef.current = false;

    for (let i = 0; i < lessons.length; i++) {
      if (abortRef.current) break;

      const lesson = lessons[i];
      const outlineLesson =
        outline.modules[lesson.moduleIndex].lessons[lesson.lessonIndex];

      // Mark as generating
      setLessons((prev) =>
        prev.map((l, idx) =>
          idx === i ? { ...l, status: 'generating' } : l
        )
      );

      try {
        const res = await fetch('/api/ai/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_title: outlineLesson.title,
            lesson_description: outlineLesson.description,
            module_title: outline.modules[lesson.moduleIndex].title,
            course_title: outline.title,
            suggested_blocks: outlineLesson.suggested_blocks,
            language,
            difficulty,
            audience,
            previous_context:
              i > 0
                ? `Previous lesson: ${lessons[i - 1].lessonTitle}`
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
        } catch {
          // If JSON parse fails, create a single text block with the content
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

        setLessons((prev) =>
          prev.map((l, idx) =>
            idx === i ? { ...l, status: 'done', blocks } : l
          )
        );
      } catch (error) {
        setLessons((prev) =>
          prev.map((l, idx) =>
            idx === i
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
    }

    setIsGenerating(false);
    setIsDone(true);
  }, [lessons.length, outline, language, difficulty, audience]);

  const handleApplyToEditor = () => {
    // Build CourseContent from outline + generated blocks
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
          },
          navigation: 'sequential',
          show_progress_bar: true,
          show_lesson_list: true,
          completion_criteria: 'all_blocks',
          language,
          direction: language === 'ar' ? 'rtl' : 'ltr',
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

          {!isGenerating && !isDone && (
            <Button onClick={generateAll} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Start Generating All Lessons
            </Button>
          )}

          {isGenerating && (
            <p className="text-sm text-muted-foreground text-center">
              Generating lesson content with AI... This may take a few
              minutes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lesson list */}
      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-card"
          >
            {lesson.status === 'pending' && (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
            )}
            {lesson.status === 'generating' && (
              <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
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
          Back to Outline
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
