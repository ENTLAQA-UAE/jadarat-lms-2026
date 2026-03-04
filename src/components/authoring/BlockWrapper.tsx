'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BlockWrapperProps {
  id: string;
  isSelected: boolean;
  blockType?: string;
  blockIndex?: number;
  totalBlocks?: number;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
}

export const BlockWrapper = React.memo(function BlockWrapper({
  id,
  isSelected,
  blockType,
  blockIndex,
  totalBlocks,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  children,
}: BlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const canMoveUp = blockIndex !== undefined && blockIndex > 0;
  const canMoveDown =
    blockIndex !== undefined &&
    totalBlocks !== undefined &&
    blockIndex < totalBlocks - 1;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group/block relative rounded-2xl bg-white dark:bg-slate-900 transition-all duration-200',
          isSelected
            ? 'border border-indigo-300 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5 ring-2 ring-indigo-500/10'
            : 'border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50',
          isDragging && 'opacity-50 shadow-2xl scale-[1.01] ring-2 ring-indigo-500/20',
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-block-action]')) return;
          onSelect();
        }}
      >
        {/* Block type label */}
        {blockType && (
          <div
            className={cn(
              'absolute -top-2.5 start-3 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200',
              isSelected
                ? 'opacity-100 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                : 'opacity-0 group-hover/block:opacity-100 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm',
            )}
          >
            {blockType.replace(/_/g, ' ')}
          </div>
        )}

        {/* Drag handle */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={cn(
            'absolute -start-3 top-1/2 -translate-y-1/2 flex h-10 w-6 cursor-grab items-center justify-center rounded-lg border bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-sm transition-all duration-200 hover:shadow-md hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-500/30 active:cursor-grabbing active:scale-90',
            isSelected || isDragging
              ? 'opacity-100 border-indigo-200 dark:border-indigo-500/20'
              : 'opacity-0 group-hover/block:opacity-100 border-slate-200 dark:border-slate-700',
          )}
          aria-label="Drag to reorder block"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Floating action toolbar */}
        {isSelected && (
          <div className="absolute -top-4 end-3 z-20 flex items-center gap-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {/* Move Up */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.();
                  }}
                  disabled={!canMoveUp}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
                Move up
              </TooltipContent>
            </Tooltip>

            {/* Move Down */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.();
                  }}
                  disabled={!canMoveDown}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
                Move down
              </TooltipContent>
            </Tooltip>

            <div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Duplicate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
                Duplicate
              </TooltipContent>
            </Tooltip>

            {/* Delete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
                Delete
              </TooltipContent>
            </Tooltip>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuItem
                  className="rounded-lg text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Duplicate Block
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg text-sm text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Selected accent line */}
        {isSelected && (
          <div className="absolute inset-y-2 start-0 w-[3px] rounded-e-full bg-gradient-to-b from-indigo-500 to-violet-500" />
        )}

        {/* Block content */}
        <div className={cn('p-5', isSelected && 'ps-6')}>{children}</div>
      </div>
    </TooltipProvider>
  );
});
