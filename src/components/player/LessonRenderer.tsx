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
  moduleTitle?: string;
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
  moduleTitle,
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
  const headerStyle = theme.lesson_header_style ?? 'full_width_banner';

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
      if (blockIndex === 0) return true;
      const prevBlock = sortedBlocks[blockIndex - 1];
      return blockProgress.get(prevBlock.id)?.completed ?? false;
    }

    if (continueData.completion_type === 'all_above') {
      for (let i = blockIndex - 1; i >= 0; i--) {
        const aboveBlock = sortedBlocks[i];
        if (aboveBlock.type === BlockType.CONTINUE) break;
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

  // Calculate lesson progress for interactive blocks
  const completableBlocks = sortedBlocks.filter(
    (b) =>
      b.type !== BlockType.TEXT &&
      b.type !== BlockType.DIVIDER &&
      b.type !== BlockType.IMAGE &&
      b.type !== BlockType.STATEMENT
  );
  const completedCount = completableBlocks.filter(
    (b) => blockProgress.get(b.id)?.completed
  ).length;
  const lessonProgress = completableBlocks.length > 0
    ? Math.round((completedCount / completableBlocks.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Lesson header */}
      {headerStyle === 'full_width_banner' ? (
        <div
          className="relative -mx-6 -mt-6 mb-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--player-primary), color-mix(in srgb, var(--player-primary) 70%, var(--player-secondary)))`,
          }}
        >
          {/* Decorative dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative px-6 py-8 md:py-10">
            {moduleTitle && (
              <motion.p
                className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2"
                initial={enableAnimations ? { opacity: 0, y: 10 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {moduleTitle}
              </motion.p>
            )}
            <motion.h1
              className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight"
              style={{ fontFamily: 'var(--player-font)' }}
              initial={enableAnimations ? { opacity: 0, y: 15 } : undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {lesson.title}
            </motion.h1>
            {lesson.description && (
              <motion.p
                className="mt-2 text-sm text-white/65 max-w-lg leading-relaxed"
                style={{ fontFamily: 'var(--player-font)' }}
                initial={enableAnimations ? { opacity: 0 } : undefined}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {lesson.description}
              </motion.p>
            )}
            {/* Lesson progress mini-bar */}
            {lessonProgress > 0 && lessonProgress < 100 && (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 w-24 rounded-full bg-white/15 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${lessonProgress}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
                <span className="text-[10px] text-white/40 font-medium tabular-nums">
                  {lessonProgress}%
                </span>
              </div>
            )}
          </div>
        </div>
      ) : headerStyle === 'compact' ? (
        <div className="mb-6 pb-4 border-b">
          {moduleTitle && (
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'var(--player-primary)', opacity: 0.5 }}
            >
              {moduleTitle}
            </p>
          )}
          <h1
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--player-font)',
              color: 'var(--player-text)',
            }}
          >
            {lesson.title}
          </h1>
          {lesson.description && (
            <p
              className="mt-1 text-sm text-muted-foreground"
              style={{ fontFamily: 'var(--player-font)' }}
            >
              {lesson.description}
            </p>
          )}
        </div>
      ) : (
        /* none - minimal spacing */
        <div className="mb-4" />
      )}

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
