'use client';

import { BlockType } from '@/types/authoring';
import type { Block, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

// Phase 1 renderers
import { TextRenderer } from './TextRenderer';
import { ImageRenderer } from './ImageRenderer';
import { VideoRenderer } from './VideoRenderer';
import { AccordionRenderer } from './AccordionRenderer';
import { TabsRenderer } from './TabsRenderer';
import { MCQRenderer } from './MCQRenderer';
import { TrueFalseRenderer } from './TrueFalseRenderer';
import { DividerRenderer } from './DividerRenderer';
import { CoverRenderer } from './CoverRenderer';

// Phase 4 renderers -- Interactive
import { FlashcardRenderer } from './FlashcardRenderer';
import { LabeledGraphicRenderer } from './LabeledGraphicRenderer';
import { ProcessRenderer } from './ProcessRenderer';
import { TimelineRenderer } from './TimelineRenderer';

// Phase 4 renderers -- Assessment
import { MultipleResponseRenderer } from './MultipleResponseRenderer';
import { FillInBlankRenderer } from './FillInBlankRenderer';
import { MatchingRenderer } from './MatchingRenderer';
import { SortingRenderer } from './SortingRenderer';

// Phase 4 renderers -- Content
import { AudioRenderer } from './AudioRenderer';
import { EmbedRenderer } from './EmbedRenderer';
import { QuoteRenderer } from './QuoteRenderer';
import { ListRenderer } from './ListRenderer';

// Phase 5 renderers -- Content
import { CalloutRenderer } from './CalloutRenderer';

// Phase 5 renderers -- Advanced
import { ScenarioRenderer } from './ScenarioRenderer';
import { HotspotRenderer } from './HotspotRenderer';
import { GalleryRenderer } from './GalleryRenderer';
import { ChartRenderer } from './ChartRenderer';
import { TableRenderer } from './TableRenderer';
import { CodeRenderer } from './CodeRenderer';

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
    // Phase 1 -- Content
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

    // Phase 1 -- Interactive
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

    // Phase 1 -- Assessment
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

    // Phase 4 -- Content
    case BlockType.AUDIO:
      return (
        <AudioRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.EMBED:
      return (
        <EmbedRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.QUOTE:
      return (
        <QuoteRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.LIST:
      return (
        <ListRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    // Phase 4 -- Interactive
    case BlockType.FLASHCARD:
      return (
        <FlashcardRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.LABELED_GRAPHIC:
      return (
        <LabeledGraphicRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.PROCESS:
      return (
        <ProcessRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.TIMELINE:
      return (
        <TimelineRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    // Phase 4 -- Assessment
    case BlockType.MULTIPLE_RESPONSE:
      return (
        <MultipleResponseRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    case BlockType.FILL_IN_BLANK:
      return (
        <FillInBlankRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    case BlockType.MATCHING:
      return (
        <MatchingRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    case BlockType.SORTING:
      return (
        <SortingRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    // Phase 5 -- Advanced Content
    case BlockType.GALLERY:
      return (
        <GalleryRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.CHART:
      return (
        <ChartRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.TABLE:
      return (
        <TableRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.CODE:
      return (
        <CodeRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    // Phase 5 -- Advanced Interactive
    case BlockType.SCENARIO:
      return (
        <ScenarioRenderer
          block={block}
          progress={progress}
          onComplete={() => onComplete()}
          theme={theme}
        />
      );

    case BlockType.HOTSPOT:
      return (
        <HotspotRenderer
          block={block}
          progress={progress}
          onComplete={(score, data) => onComplete(score, data)}
          theme={theme}
        />
      );

    case BlockType.CALLOUT:
      return (
        <CalloutRenderer
          block={block}
          theme={theme}
        />
      );

    default:
      return (
        <div className="p-4 border rounded-lg bg-muted/50 text-muted-foreground text-sm">
          Block type &ldquo;{(block as Block).type}&rdquo; is not yet supported in the player.
        </div>
      );
  }
}
