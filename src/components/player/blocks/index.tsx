'use client';

import { BlockType } from '@/types/authoring';
import type { Block, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

import { TextRenderer } from './TextRenderer';
import { ImageRenderer } from './ImageRenderer';
import { VideoRenderer } from './VideoRenderer';
import { AccordionRenderer } from './AccordionRenderer';
import { TabsRenderer } from './TabsRenderer';
import { MCQRenderer } from './MCQRenderer';
import { TrueFalseRenderer } from './TrueFalseRenderer';
import { DividerRenderer } from './DividerRenderer';
import { CoverRenderer } from './CoverRenderer';

interface BlockRendererProps {
  block: Block;
  progress?: BlockProgress;
  onComplete: (score?: number, responseData?: Record<string, unknown>) => void;
  theme: CourseTheme;
  direction: 'rtl' | 'ltr' | 'auto';
}

export function BlockRenderer({
  block,
  progress,
  onComplete,
  theme,
  direction,
}: BlockRendererProps) {
  switch (block.type) {
    case BlockType.TEXT:
      return (
        <TextRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
          direction={direction}
        />
      );

    case BlockType.IMAGE:
      return (
        <ImageRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.VIDEO:
      return (
        <VideoRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.ACCORDION:
      return (
        <AccordionRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.TABS:
      return (
        <TabsRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.MULTIPLE_CHOICE:
      return (
        <MCQRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    case BlockType.TRUE_FALSE:
      return (
        <TrueFalseRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    case BlockType.DIVIDER:
      return (
        <DividerRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
        />
      );

    case BlockType.COVER:
      return (
        <CoverRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    default:
      return (
        <div className="p-4 border rounded-lg bg-muted/50 text-muted-foreground text-sm">
          Block type &ldquo;{block.type}&rdquo; is not yet supported in the player.
        </div>
      );
  }
}
