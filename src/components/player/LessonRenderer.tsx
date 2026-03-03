'use client';

import { motion } from 'framer-motion';
import { BlockRenderer } from './blocks';
import { PlayerNavigation } from './PlayerNavigation';
import { BlockType } from '@/types/authoring';
import type { Lesson, Block, CourseTheme, CourseSettings } from '@/types/authoring';
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
  settings?: CourseSettings;
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
  settings,
}: LessonRendererProps) {
  const enableAnimations = settings?.block_entrance_animations ?? true;

  const sortedBlocks = lesson.blocks
    .filter((block) => block.visible)
    .sort((a, b) => a.order - b.order);

  /**
   * For ContinueBlock: check if all blocks above it are completed.
   * This implements Rise 360's "Complete All Blocks Above" behavior.
   */
  const isContinueUnlocked = (blockIndex: number, block: Block): boolean => {
    if (block.type !== BlockType.CONTINUE) return true;

    const continueData = block.data as {
      completion_type: 'none' | 'above' | 'all_above';
    };

    if (continueData.completion_type === 'none') return true;

    if (continueData.completion_type === 'above') {
      // Check only the block directly above
      if (blockIndex === 0) return true;
      const prevBlock = sortedBlocks[blockIndex - 1];
      return blockProgress.get(prevBlock.id)?.completed ?? false;
    }

    if (continueData.completion_type === 'all_above') {
      // Check all blocks above up to the previous Continue block
      for (let i = blockIndex - 1; i >= 0; i--) {
        const aboveBlock = sortedBlocks[i];
        if (aboveBlock.type === BlockType.CONTINUE) break; // Stop at previous continue
        const isCompletable =
          aboveBlock.type !== BlockType.TEXT &&
          aboveBlock.type !== BlockType.DIVIDER &&
          aboveBlock.type !== BlockType.COVER &&
          aboveBlock.type !== BlockType.IMAGE &&
          aboveBlock.type !== BlockType.STATEMENT &&
          aboveBlock.type !== BlockType.BUTTON;
        if (isCompletable && !blockProgress.get(aboveBlock.id)?.completed) {
          return false;
        }
      }
      return true;
    }

    return true;
  };

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
      {sortedBlocks.map((block, index) => {
        const progress = blockProgress.get(block.id);
        const isTextLike =
          block.type === BlockType.TEXT || block.type === BlockType.DIVIDER;

        const blockElement = (
          <BlockRenderer
            key={block.id}
            block={block}
            progress={progress}
            onComplete={(score, responseData) =>
              onBlockComplete(block, score, responseData)
            }
            theme={theme}
            direction={direction}
            isContinueUnlocked={isContinueUnlocked(index, block)}
            onNextLesson={onNextLesson}
            onPreviousLesson={onPreviousLesson}
          />
        );

        // Wrap non-text blocks in animation if enabled
        if (enableAnimations && !isTextLike) {
          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {blockElement}
            </motion.div>
          );
        }

        return <div key={block.id}>{blockElement}</div>;
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
