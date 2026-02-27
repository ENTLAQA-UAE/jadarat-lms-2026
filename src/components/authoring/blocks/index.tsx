'use client';

import React from 'react';
import { type Block, BlockType } from '@/types/authoring';
import { TextBlockEditor } from './TextBlock';
import { ImageBlockEditor } from './ImageBlock';
import { VideoBlockEditor } from './VideoBlock';
import { AccordionBlockEditor } from './AccordionBlock';
import { TabsBlockEditor } from './TabsBlock';
import { MultipleChoiceBlockEditor } from './MultipleChoiceBlock';

interface BlockEditorProps {
  block: Block;
  onChange: (data: Partial<Block['data']>) => void;
}

/**
 * Dispatches rendering to the appropriate block editor based on block type.
 * New block types should be registered here as their editors are built.
 */
export function BlockEditor({ block, onChange }: BlockEditorProps) {
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
    default:
      return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-sm text-muted-foreground">
          <span>
            Block type <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{block.type}</code> editor is not yet implemented.
          </span>
        </div>
      );
  }
}
