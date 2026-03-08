'use client';

import { useState, useMemo, useRef } from 'react';
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
  ChevronLeft,
  Paperclip,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BlockType } from '@/types/authoring';
import { useEditorStore } from '@/stores/editor.store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================
// BLOCK DEFINITIONS
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
      { type: BlockType.ATTACHMENT, label: 'Attachment', description: 'Downloadable file (PDF, DOCX, etc.)', icon: Paperclip, keywords: ['file', 'download', 'pdf', 'document'] },
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
  const language = useEditorStore((s) => s.content.settings.language) || 'ar';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the content you want to generate');
      return;
    }

    setAiLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai/refine-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: aiPrompt,
          action: 'expand',
          language,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI generation failed');
      }

      // Read streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      if (result.trim()) {
        // Insert a TEXT block — the parent page's onInsertBlock creates
        // a default block of the given type. We insert a TEXT block first,
        // then the parent's addBlock will place it. We use a custom event
        // so the EditorCanvas can populate the block with AI content.
        onInsertBlock(BlockType.TEXT);

        // Dispatch a custom event with the generated content so the
        // most-recently-inserted text block can pick it up.
        window.dispatchEvent(
          new CustomEvent('ai-block-generated', {
            detail: { content: result.trim() },
          }),
        );

        toast.success('AI content generated and inserted');
        setShowAIDialog(false);
        setAiPrompt('');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('AI generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setAiLoading(false);
    }
  };

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
    <div className="flex h-full w-[280px] flex-col border-e border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-vivid">
            <LayoutGrid className="h-3 w-3 text-white" />
          </div>
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">
            Blocks
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBlockLibraryOpen(false)}
          className="h-7 w-7 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-border/30">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setSelectedCategory(null);
            }}
            placeholder="Search blocks..."
            className="w-full rounded-lg border border-border/50 bg-muted/30 py-2 ps-8 pe-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Search results */}
        {searchResults !== null ? (
          <div className="p-2 space-y-px">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Search className="h-5 w-5 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground/50">No blocks found</p>
              </div>
            ) : (
              searchResults.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => handleInsert(block.type)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all duration-150 hover:bg-primary/[0.04]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/40 group-hover:bg-primary/8 group-hover:border-primary/15 group-hover:text-primary text-muted-foreground/60 transition-all duration-150">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-foreground/80 block">{block.label}</span>
                      <span className="text-[11px] text-muted-foreground/50 block truncate">{block.description}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : selectedCategory ? (
          /* Category detail — grid of block cards */
          <div className="p-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50 hover:text-foreground mb-3 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
              All Blocks
            </button>

            <h3 className="text-[11px] font-bold text-foreground/40 mb-3 uppercase tracking-wider">
              {selectedCategory}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {activeCategoryBlocks.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => handleInsert(block.type)}
                    className="group rounded-xl border border-border/40 bg-card p-3 text-start transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="mb-2.5 flex h-10 items-center justify-center rounded-lg bg-muted/30 border border-border/30">
                      <Icon className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                    </div>
                    <div className="text-[12px] font-semibold text-foreground/70 mb-0.5 leading-tight">{block.label}</div>
                    <div className="text-[10px] text-muted-foreground/40 leading-snug">{block.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Category list */
          <div className="py-1">
            {/* AI Blocks (special) */}
            <button
              type="button"
              className="group flex w-full items-center gap-3 px-4 py-2.5 text-start transition-all duration-150 hover:bg-accent/[0.04]"
              onClick={() => setShowAIDialog(true)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-vivid shadow-sm shadow-primary/15">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <span className="text-[13px] font-semibold text-foreground/80 block">AI Blocks</span>
                <span className="text-[10px] text-accent/70 font-medium">Generate content</span>
              </div>
            </button>

            <div className="mx-4 my-1 h-px bg-border/30" />

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
                  className="group flex w-full items-center gap-3 px-3 py-2 mx-1 text-start transition-all duration-150 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-lg"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40 border border-border/30 group-hover:bg-primary/[0.06] group-hover:border-primary/15 group-hover:text-primary text-muted-foreground/50 transition-all duration-150">
                    <CatIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[13px] font-medium text-foreground/70 flex-1">{category.name}</span>
                  {category.blocks.length > 1 && (
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* AI Block Generator Dialog */}
      <Dialog open={showAIDialog} onOpenChange={(open) => {
        if (!open) {
          abortRef.current?.abort();
          setAiLoading(false);
        }
        setShowAIDialog(open);
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Block Generator
            </DialogTitle>
            <DialogDescription>
              Describe the content you want and AI will generate a text block for you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'صف المحتوى الذي تريد إنشاءه...'
                  : 'Describe the content you want to generate...'
              }
              className="min-h-[120px] resize-none"
              disabled={aiLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleAIGenerate();
                }
              }}
            />
            <p className="mt-2 text-[11px] text-muted-foreground/60">
              {language === 'ar'
                ? 'اضغط Ctrl+Enter للإنشاء السريع'
                : 'Press Ctrl+Enter to generate quickly'}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAIDialog(false)}
              disabled={aiLoading}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAIGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
              className="gap-2"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'ar' ? 'جارٍ الإنشاء...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {language === 'ar' ? 'إنشاء' : 'Generate'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
