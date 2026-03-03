'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BlockType } from '@/types/authoring';
import { cn } from '@/lib/utils';

interface BlockToolbarProps {
  onInsertBlock: (blockType: BlockType) => void;
}

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  phase1: boolean;
  keywords: string[];
}

interface BlockCategory {
  name: string;
  blocks: BlockOption[];
}

const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    name: 'Content',
    blocks: [
      { type: BlockType.TEXT, label: 'Text', description: 'Rich text with formatting', icon: Type, phase1: true, keywords: ['paragraph', 'write', 'rich', 'heading'] },
      { type: BlockType.IMAGE, label: 'Image', description: 'Upload or embed an image', icon: Image, phase1: true, keywords: ['photo', 'picture', 'upload', 'media'] },
      { type: BlockType.VIDEO, label: 'Video', description: 'Embed a video lesson', icon: Video, phase1: true, keywords: ['media', 'stream', 'bunny', 'youtube'] },
      { type: BlockType.DIVIDER, label: 'Divider', description: 'Visual separator between sections', icon: Minus, phase1: true, keywords: ['separator', 'line', 'break', 'space'] },
      { type: BlockType.COVER, label: 'Cover', description: 'Full-width hero banner', icon: Frame, phase1: true, keywords: ['banner', 'hero', 'header', 'title'] },
      { type: BlockType.AUDIO, label: 'Audio', description: 'Audio clip or podcast', icon: Headphones, phase1: true, keywords: ['music', 'sound', 'podcast', 'mp3'] },
      { type: BlockType.CODE, label: 'Code', description: 'Syntax-highlighted code block', icon: Code, phase1: true, keywords: ['snippet', 'programming', 'developer'] },
      { type: BlockType.EMBED, label: 'Embed', description: 'External content via iframe', icon: ExternalLink, phase1: true, keywords: ['iframe', 'external', 'website', 'url'] },
      { type: BlockType.QUOTE, label: 'Quote', description: 'Highlighted quotation', icon: Quote, phase1: true, keywords: ['citation', 'blockquote', 'testimonial'] },
      { type: BlockType.LIST, label: 'List', description: 'Bullet, numbered, or icon list', icon: List, phase1: true, keywords: ['bullet', 'numbered', 'items', 'checklist'] },
      { type: BlockType.TABLE, label: 'Table', description: 'Data in rows and columns', icon: Table2, phase1: true, keywords: ['grid', 'spreadsheet', 'data', 'rows'] },
      { type: BlockType.GALLERY, label: 'Gallery', description: 'Image carousel or grid', icon: GalleryHorizontal, phase1: true, keywords: ['carousel', 'slideshow', 'images'] },
      { type: BlockType.CHART, label: 'Chart', description: 'Data visualization chart', icon: BarChart3, phase1: true, keywords: ['graph', 'bar', 'pie', 'visualization'] },
      { type: BlockType.CALLOUT, label: 'Callout', description: 'Info, warning, or tip box', icon: MessageSquareWarning, phase1: true, keywords: ['alert', 'notice', 'tip', 'warning', 'info'] },
      { type: BlockType.STATEMENT, label: 'Statement', description: 'Bold emphasized message', icon: MessageSquare, phase1: true, keywords: ['highlight', 'emphasis', 'key point'] },
    ],
  },
  {
    name: 'Interactive',
    blocks: [
      { type: BlockType.ACCORDION, label: 'Accordion', description: 'Expandable content sections', icon: ChevronDown, phase1: true, keywords: ['collapse', 'expand', 'faq', 'toggle'] },
      { type: BlockType.TABS, label: 'Tabs', description: 'Tabbed content panels', icon: Columns, phase1: true, keywords: ['panel', 'switch', 'sections'] },
      { type: BlockType.FLASHCARD, label: 'Flashcard', description: 'Flip cards for memorization', icon: Layers, phase1: true, keywords: ['flip', 'cards', 'study', 'memory'] },
      { type: BlockType.LABELED_GRAPHIC, label: 'Labeled Graphic', description: 'Image with labeled markers', icon: Tag, phase1: true, keywords: ['annotate', 'diagram', 'markers', 'labels'] },
      { type: BlockType.PROCESS, label: 'Process', description: 'Step-by-step flow', icon: GitBranch, phase1: true, keywords: ['steps', 'workflow', 'procedure', 'flow'] },
      { type: BlockType.TIMELINE, label: 'Timeline', description: 'Chronological sequence', icon: Clock, phase1: true, keywords: ['history', 'dates', 'chronology', 'events'] },
      { type: BlockType.HOTSPOT, label: 'Hotspot', description: 'Clickable regions on an image', icon: MousePointerClick, phase1: true, keywords: ['click', 'regions', 'interactive image'] },
      { type: BlockType.SCENARIO, label: 'Scenario', description: 'Branching decision scenario', icon: Route, phase1: true, keywords: ['branch', 'decision', 'choose', 'path'] },
    ],
  },
  {
    name: 'Assessment',
    blocks: [
      { type: BlockType.MULTIPLE_CHOICE, label: 'Multiple Choice', description: 'Single-answer question', icon: CircleDot, phase1: true, keywords: ['quiz', 'question', 'mcq', 'test'] },
      { type: BlockType.TRUE_FALSE, label: 'True / False', description: 'Binary answer question', icon: ToggleLeft, phase1: true, keywords: ['quiz', 'boolean', 'yes no'] },
      { type: BlockType.MULTIPLE_RESPONSE, label: 'Multiple Response', description: 'Multi-answer selection', icon: CheckSquare, phase1: true, keywords: ['quiz', 'multi', 'select all'] },
      { type: BlockType.FILL_IN_BLANK, label: 'Fill in Blank', description: 'Type the answer', icon: TextCursorInput, phase1: true, keywords: ['quiz', 'input', 'type', 'blank'] },
      { type: BlockType.MATCHING, label: 'Matching', description: 'Pair items together', icon: ArrowLeftRight, phase1: true, keywords: ['quiz', 'pair', 'connect', 'match'] },
      { type: BlockType.SORTING, label: 'Sorting', description: 'Arrange items in order', icon: ArrowUpDown, phase1: true, keywords: ['quiz', 'order', 'rank', 'sequence'] },
    ],
  },
  {
    name: 'Navigation',
    blocks: [
      { type: BlockType.BUTTON, label: 'Button', description: 'Clickable action button', icon: SquareMousePointer, phase1: true, keywords: ['link', 'cta', 'action', 'click'] },
      { type: BlockType.CONTINUE, label: 'Continue', description: 'Lesson progress gate', icon: ArrowDown, phase1: true, keywords: ['gate', 'progress', 'lock', 'next'] },
    ],
  },
];

// Flatten all blocks for search
const ALL_BLOCKS = BLOCK_CATEGORIES.flatMap((c) =>
  c.blocks.map((b) => ({ ...b, category: c.name })),
);

export function BlockToolbar({ onInsertBlock }: BlockToolbarProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search when popover opens
  useEffect(() => {
    if (open) {
      setSearch('');
      // Small delay for popover animation
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filteredResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase().trim();
    return ALL_BLOCKS.filter(
      (b) =>
        b.label.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.keywords.some((k) => k.includes(q)) ||
        b.category.toLowerCase().includes(q),
    );
  }, [search]);

  function handleSelect(block: BlockOption) {
    if (!block.phase1) return;
    onInsertBlock(block.type);
    setOpen(false);
  }

  const showSearch = filteredResults !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[440px] max-h-[520px] overflow-hidden p-0"
      >
        {/* Search input */}
        <div className="sticky top-0 z-10 border-b border-border/60 bg-background p-2.5">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks..."
              className="w-full rounded-md border border-border/60 bg-muted/30 py-1.5 ps-8 pe-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Results area */}
        <div className="overflow-y-auto max-h-[440px]">
          {showSearch ? (
            /* ── Search results (list view) ── */
            <div className="p-2">
              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No blocks match &ldquo;{search}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredResults.map((block) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={block.type}
                        type="button"
                        onClick={() => handleSelect(block)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-muted group"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 border border-border/40 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {block.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                              {block.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {block.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── Category grid view ── */
            <div className="p-3 space-y-4">
              {BLOCK_CATEGORIES.map((category) => (
                <div key={category.name}>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
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
                          className={cn(
                            'group relative flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-xs transition-all',
                            disabled
                              ? 'cursor-not-allowed opacity-40'
                              : 'hover:bg-primary/5 hover:text-primary cursor-pointer',
                          )}
                          title={block.description}
                        >
                          <div
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                              disabled
                                ? 'bg-muted/40'
                                : 'bg-muted/60 border border-border/40 group-hover:bg-primary/10 group-hover:border-primary/20',
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                          </div>
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
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
