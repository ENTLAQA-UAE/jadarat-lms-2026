'use client';

import { useState } from 'react';
import {
  Type,
  Image,
  Video,
  ChevronDown,
  Columns,
  CircleDot,
  ToggleLeft,
  Minus,
  Frame,
  Headphones,
  Code,
  ExternalLink,
  Quote,
  List,
  Table2,
  GalleryHorizontal,
  BarChart3,
  Layers,
  Tag,
  GitBranch,
  Clock,
  MousePointerClick,
  Route,
  CheckSquare,
  TextCursorInput,
  ArrowLeftRight,
  ArrowUpDown,
  Plus,
  MessageSquareWarning,
  MessageSquare,
  SquareMousePointer,
  ArrowDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BlockType } from '@/types/authoring';

interface BlockToolbarProps {
  onInsertBlock: (blockType: BlockType) => void;
}

interface BlockOption {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  phase1: boolean;
}

interface BlockCategory {
  name: string;
  blocks: BlockOption[];
}

const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    name: 'Content',
    blocks: [
      { type: BlockType.TEXT, label: 'Text', icon: Type, phase1: true },
      { type: BlockType.IMAGE, label: 'Image', icon: Image, phase1: true },
      { type: BlockType.VIDEO, label: 'Video', icon: Video, phase1: true },
      { type: BlockType.DIVIDER, label: 'Divider', icon: Minus, phase1: true },
      { type: BlockType.COVER, label: 'Cover', icon: Frame, phase1: true },
      { type: BlockType.AUDIO, label: 'Audio', icon: Headphones, phase1: true },
      { type: BlockType.CODE, label: 'Code', icon: Code, phase1: true },
      { type: BlockType.EMBED, label: 'Embed', icon: ExternalLink, phase1: true },
      { type: BlockType.QUOTE, label: 'Quote', icon: Quote, phase1: true },
      { type: BlockType.LIST, label: 'List', icon: List, phase1: true },
      { type: BlockType.TABLE, label: 'Table', icon: Table2, phase1: true },
      { type: BlockType.GALLERY, label: 'Gallery', icon: GalleryHorizontal, phase1: true },
      { type: BlockType.CHART, label: 'Chart', icon: BarChart3, phase1: true },
      { type: BlockType.CALLOUT, label: 'Callout', icon: MessageSquareWarning, phase1: true },
      { type: BlockType.STATEMENT, label: 'Statement', icon: MessageSquare, phase1: true },
    ],
  },
  {
    name: 'Interactive',
    blocks: [
      { type: BlockType.ACCORDION, label: 'Accordion', icon: ChevronDown, phase1: true },
      { type: BlockType.TABS, label: 'Tabs', icon: Columns, phase1: true },
      { type: BlockType.FLASHCARD, label: 'Flashcard', icon: Layers, phase1: true },
      { type: BlockType.LABELED_GRAPHIC, label: 'Labeled Graphic', icon: Tag, phase1: true },
      { type: BlockType.PROCESS, label: 'Process', icon: GitBranch, phase1: true },
      { type: BlockType.TIMELINE, label: 'Timeline', icon: Clock, phase1: true },
      { type: BlockType.HOTSPOT, label: 'Hotspot', icon: MousePointerClick, phase1: true },
      { type: BlockType.SCENARIO, label: 'Scenario', icon: Route, phase1: true },
    ],
  },
  {
    name: 'Assessment',
    blocks: [
      { type: BlockType.MULTIPLE_CHOICE, label: 'Multiple Choice', icon: CircleDot, phase1: true },
      { type: BlockType.TRUE_FALSE, label: 'True / False', icon: ToggleLeft, phase1: true },
      { type: BlockType.MULTIPLE_RESPONSE, label: 'Multiple Response', icon: CheckSquare, phase1: true },
      { type: BlockType.FILL_IN_BLANK, label: 'Fill in Blank', icon: TextCursorInput, phase1: true },
      { type: BlockType.MATCHING, label: 'Matching', icon: ArrowLeftRight, phase1: true },
      { type: BlockType.SORTING, label: 'Sorting', icon: ArrowUpDown, phase1: true },
    ],
  },
  {
    name: 'Navigation',
    blocks: [
      { type: BlockType.BUTTON, label: 'Button', icon: SquareMousePointer, phase1: true },
      { type: BlockType.CONTINUE, label: 'Continue', icon: ArrowDown, phase1: true },
    ],
  },
];

export function BlockToolbar({ onInsertBlock }: BlockToolbarProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(block: BlockOption) {
    if (!block.phase1) return;
    onInsertBlock(block.type);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[420px] max-h-[480px] overflow-y-auto p-0"
      >
        <div className="p-3 space-y-4">
          {BLOCK_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {category.name}
              </h4>
              <div className="grid grid-cols-3 gap-1">
                {category.blocks.map((block) => {
                  const Icon = block.icon;
                  const disabled = !block.phase1;

                  return (
                    <button
                      key={block.type}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(block)}
                      className={
                        'relative flex flex-col items-center gap-1.5 rounded-md px-2 py-3 text-xs transition-colors ' +
                        (disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'hover:bg-muted cursor-pointer')
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="leading-tight text-center">
                        {block.label}
                      </span>
                      {disabled && (
                        <span className="absolute -top-0.5 -end-0.5 rounded bg-muted px-1 py-px text-[9px] font-medium text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
