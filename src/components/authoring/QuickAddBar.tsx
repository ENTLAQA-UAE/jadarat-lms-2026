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

// Quick-access blocks (most commonly used)
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
          'flex items-center gap-0.5 rounded-xl bg-card border border-border/40 p-1 shadow-elevation-2',
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
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                blockLibraryOpen
                  ? 'gradient-vivid text-white shadow-sm shadow-primary/15'
                  : 'bg-primary/[0.06] text-primary hover:bg-primary/[0.1]',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Blocks</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Open Block Library
          </TooltipContent>
        </Tooltip>

        {/* AI Block */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold bg-accent/[0.06] text-accent hover:bg-accent/[0.1] transition-all duration-150"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Generate with AI
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-5 w-px bg-border/30 mx-0.5" />

        {/* Quick block buttons */}
        {QUICK_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <Tooltip key={block.type}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onInsertBlock(block.type)}
                  className="group flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-muted-foreground/40 transition-all duration-150 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-foreground/70"
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
