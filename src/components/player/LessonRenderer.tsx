'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlockRenderer } from './blocks';
import type { Lesson, Block, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from './CoursePlayer';

interface LessonRendererProps {
  lesson: Lesson;
  moduleId: string;
  blockProgress: Map<string, BlockProgress>;
  onBlockComplete: (
    block: Block,
    score?: number,
    responseData?: Record<string, unknown>
  ) => void;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  theme: CourseTheme;
  direction: 'rtl' | 'ltr' | 'auto';
}

export function LessonRenderer({
  lesson,
  moduleId,
  blockProgress,
  onBlockComplete,
  onNextLesson,
  onPreviousLesson,
  isFirstLesson,
  isLastLesson,
  theme,
  direction,
}: LessonRendererProps) {
  return (
    <div className="space-y-6">
      {/* Lesson title */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: theme.font_family }}
        >
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="text-muted-foreground mt-2">{lesson.description}</p>
        )}
      </div>

      {/* Blocks */}
      {lesson.blocks
        .filter((block) => block.visible)
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const progress = blockProgress.get(block.id);
          return (
            <BlockRenderer
              key={block.id}
              block={block}
              progress={progress}
              onComplete={(score, responseData) =>
                onBlockComplete(block, score, responseData)
              }
              theme={theme}
              direction={direction}
            />
          );
        })}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-8 border-t mt-12">
        <Button
          variant="outline"
          onClick={onPreviousLesson}
          disabled={isFirstLesson}
          className="gap-2"
        >
          {direction === 'rtl' ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          Previous
        </Button>

        <Button
          onClick={onNextLesson}
          disabled={isLastLesson}
          className="gap-2"
        >
          Next
          {direction === 'rtl' ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
