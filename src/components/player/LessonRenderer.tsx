'use client';

import { BlockRenderer } from './blocks';
import { PlayerNavigation } from './PlayerNavigation';
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
          style={{
            fontFamily: 'var(--player-font)',
            color: 'var(--player-text)',
          }}
        >
          {lesson.title}
        </h1>
        {lesson.description && (
          <p
            className="mt-2 text-muted-foreground"
            style={{ fontFamily: 'var(--player-font)' }}
          >
            {lesson.description}
          </p>
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
      <PlayerNavigation
        onPrevious={onPreviousLesson}
        onNext={onNextLesson}
        isFirstLesson={isFirstLesson}
        isLastLesson={isLastLesson}
        direction={direction}
      />
    </div>
  );
}
