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
          'flex items-center gap-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-1.5 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
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
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                blockLibraryOpen
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/15',
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
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10 text-violet-600 dark:text-violet-400 hover:from-violet-100 hover:to-fuchsia-100 dark:hover:from-violet-500/15 dark:hover:to-fuchsia-500/15 transition-all duration-200"
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
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Quick block buttons */}
        {QUICK_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <Tooltip key={block.type}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onInsertBlock(block.type)}
                  className="group flex flex-col items-center gap-0.5 rounded-xl p-2 text-slate-400 dark:text-slate-500 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <Icon className="h-4 w-4 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
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
