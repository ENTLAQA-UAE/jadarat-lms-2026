'use client';

import {
  Type,
  Image,
  Video,
  List,
  ChevronDown,
  Layers,
  ArrowUpDown,
  GitBranch,
  ArrowDown,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BlockType } from '@/types/authoring';
import { useEditorStore } from '@/stores/editor.store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Quick-access blocks (most commonly used — matches Rise's bottom bar)
const QUICK_BLOCKS: { type: BlockType; label: string; icon: LucideIcon }[] = [
  { type: BlockType.TEXT, label: 'Text', icon: Type },
  { type: BlockType.LIST, label: 'List', icon: List },
  { type: BlockType.IMAGE, label: 'Image', icon: Image },
  { type: BlockType.VIDEO, label: 'Video', icon: Video },
  { type: BlockType.PROCESS, label: 'Process', icon: GitBranch },
  { type: BlockType.FLASHCARD, label: 'Flashcards', icon: Layers },
  { type: BlockType.ACCORDION, label: 'Accordion', icon: ChevronDown },
  { type: BlockType.SORTING, label: 'Sorting', icon: ArrowUpDown },
  { type: BlockType.CONTINUE, label: 'Continue', icon: ArrowDown },
];

interface QuickAddBarProps {
  onInsertBlock: (type: BlockType) => void;
  compact?: boolean;
}

export function QuickAddBar({ onInsertBlock, compact = false }: QuickAddBarProps) {
  const toggleBlockLibrary = useEditorStore((s) => s.toggleBlockLibrary);
  const blockLibraryOpen = useEditorStore((s) => s.blockLibraryOpen);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-sm p-1.5 shadow-sm',
          compact ? 'flex-wrap justify-center' : '',
        )}
      >
        {/* Block Library toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleBlockLibrary}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
                blockLibraryOpen
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-primary/10 text-primary hover:bg-primary/15',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Block Library</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Open Block Library
          </TooltipContent>
        </Tooltip>

        {/* AI Block button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium bg-gradient-to-r from-violet-500/10 to-blue-500/10 text-violet-600 dark:text-violet-400 hover:from-violet-500/15 hover:to-blue-500/15 transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Block</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Generate with AI
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-6 w-px bg-border/40 mx-0.5" />

        {/* Quick block buttons */}
        {QUICK_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <Tooltip key={block.type}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onInsertBlock(block.type)}
                  className="group flex flex-col items-center gap-0.5 rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
                {block.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
