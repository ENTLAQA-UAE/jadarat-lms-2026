'use client';

import {
  type Block,
  BlockType,
} from '@/types/authoring';

import { TextBlockEditor } from './TextBlock';
import { ImageBlockEditor } from './ImageBlock';
import { VideoBlockEditor } from './VideoBlock';
import { AccordionBlockEditor } from './AccordionBlock';
import { TabsBlockEditor } from './TabsBlock';
import { MultipleChoiceBlockEditor } from './MultipleChoiceBlock';
import { TrueFalseBlockEditor } from './TrueFalseBlock';
import { DividerBlockEditor } from './DividerBlock';
import { CoverBlockEditor } from './CoverBlock';

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
    case BlockType.TEXT:
      return <TextBlockEditor block={block} onChange={onChange} />;
    case BlockType.IMAGE:
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case BlockType.VIDEO:
      return <VideoBlockEditor block={block} onChange={onChange} />;
    case BlockType.ACCORDION:
      return <AccordionBlockEditor block={block} onChange={onChange} />;
    case BlockType.TABS:
      return <TabsBlockEditor block={block} onChange={onChange} />;
    case BlockType.MULTIPLE_CHOICE:
      return <MultipleChoiceBlockEditor block={block} onChange={onChange} />;
    case BlockType.TRUE_FALSE:
      return <TrueFalseBlockEditor block={block} onChange={onChange} />;
    case BlockType.DIVIDER:
      return <DividerBlockEditor block={block} onChange={onChange} />;
    case BlockType.COVER:
      return <CoverBlockEditor block={block} onChange={onChange} />;
    default:
      return (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Unsupported block type: {(block as Block).type}
        </div>
      );
  }
}
