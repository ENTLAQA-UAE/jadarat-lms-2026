'use client';

import { useState, useMemo } from 'react';
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
  X,
  Search,
  Sparkles,
  LayoutGrid,
  MessageSquareWarning,
  MessageSquare,
  SquareMousePointer,
  ArrowDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlockType } from '@/types/authoring';
import { useEditorStore } from '@/stores/editor.store';
import { cn } from '@/lib/utils';

// ============================================================
// BLOCK DEFINITIONS (mirroring Rise 360 style categories)
// ============================================================

interface BlockDef {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
}

interface Category {
  name: string;
  icon: LucideIcon;
  blocks: BlockDef[];
}

const CATEGORIES: Category[] = [
  {
    name: 'Text',
    icon: Type,
    blocks: [
      { type: BlockType.TEXT, label: 'Paragraph', description: 'Rich text with formatting', icon: Type, keywords: ['paragraph', 'write', 'heading'] },
    ],
  },
  {
    name: 'Statement',
    icon: MessageSquare,
    blocks: [
      { type: BlockType.STATEMENT, label: 'Statement', description: 'Bold emphasized message', icon: MessageSquare, keywords: ['highlight', 'emphasis'] },
      { type: BlockType.CALLOUT, label: 'Callout', description: 'Info, warning, or tip box', icon: MessageSquareWarning, keywords: ['alert', 'notice', 'tip'] },
    ],
  },
  {
    name: 'Quote',
    icon: Quote,
    blocks: [
      { type: BlockType.QUOTE, label: 'Quote', description: 'Highlighted quotation', icon: Quote, keywords: ['citation', 'blockquote'] },
    ],
  },
  {
    name: 'List',
    icon: List,
    blocks: [
      { type: BlockType.LIST, label: 'List', description: 'Bullet, numbered, or icon list', icon: List, keywords: ['bullet', 'numbered', 'items'] },
    ],
  },
  {
    name: 'Image',
    icon: Image,
    blocks: [
      { type: BlockType.IMAGE, label: 'Image', description: 'Upload or embed an image', icon: Image, keywords: ['photo', 'picture', 'upload'] },
      { type: BlockType.COVER, label: 'Cover', description: 'Full-width hero banner', icon: Frame, keywords: ['banner', 'hero', 'header'] },
    ],
  },
  {
    name: 'Gallery',
    icon: GalleryHorizontal,
    blocks: [
      { type: BlockType.GALLERY, label: 'Gallery', description: 'Image carousel or grid', icon: GalleryHorizontal, keywords: ['carousel', 'slideshow'] },
    ],
  },
  {
    name: 'Multimedia',
    icon: Video,
    blocks: [
      { type: BlockType.VIDEO, label: 'Video', description: 'Embed a video lesson', icon: Video, keywords: ['media', 'stream'] },
      { type: BlockType.AUDIO, label: 'Audio', description: 'Audio clip or podcast', icon: Headphones, keywords: ['music', 'podcast'] },
      { type: BlockType.EMBED, label: 'Embed', description: 'External content via iframe', icon: ExternalLink, keywords: ['iframe', 'external'] },
    ],
  },
  {
    name: 'Interactive',
    icon: ChevronDown,
    blocks: [
      { type: BlockType.ACCORDION, label: 'Accordion', description: 'Expandable content sections', icon: ChevronDown, keywords: ['collapse', 'faq'] },
      { type: BlockType.TABS, label: 'Tabs', description: 'Tabbed content panels', icon: Columns, keywords: ['panel', 'switch'] },
      { type: BlockType.FLASHCARD, label: 'Flashcard', description: 'Flip cards for memorization', icon: Layers, keywords: ['flip', 'cards'] },
      { type: BlockType.LABELED_GRAPHIC, label: 'Labeled Graphic', description: 'Image with labeled markers', icon: Tag, keywords: ['annotate', 'diagram'] },
      { type: BlockType.PROCESS, label: 'Process', description: 'Step-by-step flow', icon: GitBranch, keywords: ['steps', 'workflow'] },
      { type: BlockType.TIMELINE, label: 'Timeline', description: 'Chronological sequence', icon: Clock, keywords: ['history', 'dates'] },
      { type: BlockType.HOTSPOT, label: 'Hotspot', description: 'Clickable regions on image', icon: MousePointerClick, keywords: ['click', 'regions'] },
      { type: BlockType.SCENARIO, label: 'Scenario', description: 'Branching decision scenario', icon: Route, keywords: ['branch', 'decision'] },
    ],
  },
  {
    name: 'Knowledge Check',
    icon: CircleDot,
    blocks: [
      { type: BlockType.MULTIPLE_CHOICE, label: 'Multiple Choice', description: 'Single-answer question', icon: CircleDot, keywords: ['quiz', 'question'] },
      { type: BlockType.TRUE_FALSE, label: 'True / False', description: 'Binary answer question', icon: ToggleLeft, keywords: ['quiz', 'boolean'] },
      { type: BlockType.MULTIPLE_RESPONSE, label: 'Multiple Response', description: 'Multi-answer selection', icon: CheckSquare, keywords: ['quiz', 'multi'] },
      { type: BlockType.FILL_IN_BLANK, label: 'Fill in Blank', description: 'Type the answer', icon: TextCursorInput, keywords: ['quiz', 'input'] },
      { type: BlockType.MATCHING, label: 'Matching', description: 'Pair items together', icon: ArrowLeftRight, keywords: ['quiz', 'pair'] },
      { type: BlockType.SORTING, label: 'Sorting', description: 'Arrange items in order', icon: ArrowUpDown, keywords: ['quiz', 'order'] },
    ],
  },
  {
    name: 'Chart',
    icon: BarChart3,
    blocks: [
      { type: BlockType.CHART, label: 'Chart', description: 'Data visualization chart', icon: BarChart3, keywords: ['graph', 'bar', 'pie'] },
      { type: BlockType.TABLE, label: 'Table', description: 'Data in rows and columns', icon: Table2, keywords: ['grid', 'spreadsheet'] },
    ],
  },
  {
    name: 'Divider',
    icon: Minus,
    blocks: [
      { type: BlockType.DIVIDER, label: 'Divider', description: 'Visual separator', icon: Minus, keywords: ['separator', 'line'] },
    ],
  },
  {
    name: 'Code',
    icon: Code,
    blocks: [
      { type: BlockType.CODE, label: 'Code', description: 'Syntax-highlighted code block', icon: Code, keywords: ['snippet', 'programming'] },
    ],
  },
  {
    name: 'Navigation',
    icon: SquareMousePointer,
    blocks: [
      { type: BlockType.BUTTON, label: 'Button', description: 'Clickable action button', icon: SquareMousePointer, keywords: ['link', 'cta'] },
      { type: BlockType.CONTINUE, label: 'Continue', description: 'Lesson progress gate', icon: ArrowDown, keywords: ['gate', 'progress'] },
    ],
  },
];

const ALL_BLOCKS = CATEGORIES.flatMap((c) =>
  c.blocks.map((b) => ({ ...b, category: c.name })),
);

// ============================================================
// BLOCK LIBRARY SIDEBAR
// ============================================================

interface BlockLibrarySidebarProps {
  onInsertBlock: (type: BlockType) => void;
}

export function BlockLibrarySidebar({ onInsertBlock }: BlockLibrarySidebarProps) {
  const setBlockLibraryOpen = useEditorStore((s) => s.setBlockLibraryOpen);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const searchResults = useMemo(() => {
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

  const handleInsert = (type: BlockType) => {
    onInsertBlock(type);
  };

  const activeCategoryBlocks = selectedCategory
    ? CATEGORIES.find((c) => c.name === selectedCategory)?.blocks ?? []
    : [];

  return (
    <div className="flex h-full w-[280px] flex-col border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/20">
            <LayoutGrid className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            Block Library
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBlockLibraryOpen(false)}
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setSelectedCategory(null);
            }}
            placeholder="Search blocks..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 ps-8 pe-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500/30 transition-all"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Search results */}
        {searchResults !== null ? (
          <div className="p-2 space-y-0.5">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Search className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No blocks found</p>
              </div>
            ) : (
              searchResults.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => handleInsert(block.type)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all duration-150 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/15 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-slate-500 dark:text-slate-400 transition-all">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 block">{block.label}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">{block.description}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : selectedCategory ? (
          /* Category detail view - shows block variants */
          <div className="p-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors"
            >
              <ChevronDown className="h-3 w-3 rotate-90" />
              All Blocks
            </button>

            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
              {selectedCategory}
            </h3>

            <div className="space-y-2">
              {activeCategoryBlocks.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => handleInsert(block.type)}
                    className="group w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 text-start transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5"
                  >
                    {/* Preview card */}
                    <div className="mb-3 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 border border-slate-200/50 dark:border-slate-700/50">
                      <Icon className="h-7 w-7 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-0.5">{block.label}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">{block.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Category list */
          <div className="py-1.5">
            {/* AI Blocks (special) */}
            <button
              type="button"
              className="group flex w-full items-center gap-3 px-4 py-2.5 text-start transition-all duration-150 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              onClick={() => {
                // AI blocks can trigger the AI wizard
              }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 block">AI Blocks</span>
                <span className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">Generate content</span>
              </div>
            </button>

            <div className="mx-4 my-1.5 h-px bg-slate-100 dark:bg-slate-800" />

            {/* Regular categories */}
            {CATEGORIES.map((category) => {
              const CatIcon = category.icon;
              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => {
                    if (category.blocks.length === 1) {
                      handleInsert(category.blocks[0].type);
                    } else {
                      setSelectedCategory(category.name);
                    }
                  }}
                  className="group flex w-full items-center gap-3 px-4 py-2.5 text-start transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg mx-1"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-slate-400 dark:text-slate-500 transition-all">
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex-1">{category.name}</span>
                  {category.blocks.length > 1 && (
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
