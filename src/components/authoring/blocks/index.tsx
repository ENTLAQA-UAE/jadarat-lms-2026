'use client';

import {
  type Block,
  BlockType,
} from '@/types/authoring';

// Phase 1 block editors
import { TextBlockEditor } from './TextBlock';
import { ImageBlockEditor } from './ImageBlock';
import { VideoBlockEditor } from './VideoBlock';
import { AccordionBlockEditor } from './AccordionBlock';
import { TabsBlockEditor } from './TabsBlock';
import { MultipleChoiceBlockEditor } from './MultipleChoiceBlock';
import { TrueFalseBlockEditor } from './TrueFalseBlock';
import { DividerBlockEditor } from './DividerBlock';
import { CoverBlockEditor } from './CoverBlock';

// Phase 4 block editors -- Interactive
import { FlashcardBlockEditor } from './FlashcardBlock';
import { LabeledGraphicBlockEditor } from './LabeledGraphicBlock';
import { ProcessBlockEditor } from './ProcessBlock';
import { TimelineBlockEditor } from './TimelineBlock';

// Phase 4 block editors -- Assessment
import { MultipleResponseBlockEditor } from './MultipleResponseBlock';
import { FillInBlankBlockEditor } from './FillInBlankBlock';
import { MatchingBlockEditor } from './MatchingBlock';
import { SortingBlockEditor } from './SortingBlock';

// Phase 4 block editors -- Content
import { AudioBlockEditor } from './AudioBlock';
import { EmbedBlockEditor } from './EmbedBlock';
import { QuoteBlockEditor } from './QuoteBlock';
import { ListBlockEditor } from './ListBlock';

// Phase 5 block editors -- Content
import { CalloutBlockEditor } from './CalloutBlock';

// Phase 5 block editors -- Advanced
import { ScenarioBlockEditor } from './ScenarioBlock';
import { HotspotBlockEditor } from './HotspotBlock';
import { GalleryBlockEditor } from './GalleryBlock';
import { ChartBlockEditor } from './ChartBlock';
import { TableBlockEditor } from './TableBlock';
import { CodeBlockEditor } from './CodeBlock';

// Re-export all individual block editors
export {
  TextBlockEditor,
  ImageBlockEditor,
  VideoBlockEditor,
  AccordionBlockEditor,
  TabsBlockEditor,
  MultipleChoiceBlockEditor,
  TrueFalseBlockEditor,
  DividerBlockEditor,
  CoverBlockEditor,
  FlashcardBlockEditor,
  LabeledGraphicBlockEditor,
  ProcessBlockEditor,
  TimelineBlockEditor,
  MultipleResponseBlockEditor,
  FillInBlankBlockEditor,
  MatchingBlockEditor,
  SortingBlockEditor,
  AudioBlockEditor,
  EmbedBlockEditor,
  QuoteBlockEditor,
  ListBlockEditor,
  ScenarioBlockEditor,
  HotspotBlockEditor,
  GalleryBlockEditor,
  ChartBlockEditor,
  TableBlockEditor,
  CodeBlockEditor,
  CalloutBlockEditor,
};

// Unified BlockEditor that switches on block.type
export function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: any) => void;
}) {
  switch (block.type) {
    // Phase 1 -- Content
    case BlockType.TEXT:
      return <TextBlockEditor block={block} onChange={onChange} />;
    case BlockType.IMAGE:
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case BlockType.VIDEO:
      return <VideoBlockEditor block={block} onChange={onChange} />;
    case BlockType.DIVIDER:
      return <DividerBlockEditor block={block} onChange={onChange} />;
    case BlockType.COVER:
      return <CoverBlockEditor block={block} onChange={onChange} />;

    // Phase 1 -- Interactive
    case BlockType.ACCORDION:
      return <AccordionBlockEditor block={block} onChange={onChange} />;
    case BlockType.TABS:
      return <TabsBlockEditor block={block} onChange={onChange} />;

    // Phase 1 -- Assessment
    case BlockType.MULTIPLE_CHOICE:
      return <MultipleChoiceBlockEditor block={block} onChange={onChange} />;
    case BlockType.TRUE_FALSE:
      return <TrueFalseBlockEditor block={block} onChange={onChange} />;

    // Phase 4 -- Content
    case BlockType.AUDIO:
      return <AudioBlockEditor block={block} onChange={onChange} />;
    case BlockType.EMBED:
      return <EmbedBlockEditor block={block} onChange={onChange} />;
    case BlockType.QUOTE:
      return <QuoteBlockEditor block={block} onChange={onChange} />;
    case BlockType.LIST:
      return <ListBlockEditor block={block} onChange={onChange} />;

    // Phase 4 -- Interactive
    case BlockType.FLASHCARD:
      return <FlashcardBlockEditor block={block} onChange={onChange} />;
    case BlockType.LABELED_GRAPHIC:
      return <LabeledGraphicBlockEditor block={block} onChange={onChange} />;
    case BlockType.PROCESS:
      return <ProcessBlockEditor block={block} onChange={onChange} />;
    case BlockType.TIMELINE:
      return <TimelineBlockEditor block={block} onChange={onChange} />;

    // Phase 4 -- Assessment
    case BlockType.MULTIPLE_RESPONSE:
      return <MultipleResponseBlockEditor block={block} onChange={onChange} />;
    case BlockType.FILL_IN_BLANK:
      return <FillInBlankBlockEditor block={block} onChange={onChange} />;
    case BlockType.MATCHING:
      return <MatchingBlockEditor block={block} onChange={onChange} />;
    case BlockType.SORTING:
      return <SortingBlockEditor block={block} onChange={onChange} />;

    // Phase 5 -- Advanced
    case BlockType.SCENARIO:
      return <ScenarioBlockEditor block={block} onChange={onChange} />;
    case BlockType.HOTSPOT:
      return <HotspotBlockEditor block={block} onChange={onChange} />;
    case BlockType.GALLERY:
      return <GalleryBlockEditor block={block} onChange={onChange} />;
    case BlockType.CHART:
      return <ChartBlockEditor block={block} onChange={onChange} />;
    case BlockType.TABLE:
      return <TableBlockEditor block={block} onChange={onChange} />;
    case BlockType.CODE:
      return <CodeBlockEditor block={block} onChange={onChange} />;
    case BlockType.CALLOUT:
      return <CalloutBlockEditor block={block} onChange={onChange} />;

    default:
      return (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Unsupported block type: {(block as Block).type}
        </div>
      );
  }
}
