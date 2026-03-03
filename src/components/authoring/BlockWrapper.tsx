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

export function BlockWrapper({
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
          'group/block relative rounded-xl border bg-card transition-all duration-200',
          isSelected
            ? 'border-primary/40 shadow-md shadow-primary/5 ring-2 ring-primary/8'
            : 'border-border/40 hover:border-border/70 hover:shadow-sm',
          isDragging && 'opacity-50 shadow-2xl scale-[1.01] ring-2 ring-primary/20',
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-block-action]')) return;
          onSelect();
        }}
      >
        {/* Block type label - shows on hover or when selected */}
        {blockType && (
          <div
            className={cn(
              'absolute -top-2.5 start-3 z-10 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200',
              isSelected
                ? 'opacity-100 bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm'
                : 'opacity-0 group-hover/block:opacity-100 bg-muted/90 text-muted-foreground border border-border/50 backdrop-blur-sm',
            )}
          >
            {blockType.replace(/_/g, ' ')}
          </div>
        )}

        {/* Drag handle - left side */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={cn(
            'absolute -start-3 top-1/2 -translate-y-1/2 flex h-10 w-6 cursor-grab items-center justify-center rounded-lg border bg-background/95 backdrop-blur-sm text-muted-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:text-foreground hover:border-primary/30 active:cursor-grabbing active:scale-90',
            isSelected || isDragging
              ? 'opacity-100 border-primary/15'
              : 'opacity-0 group-hover/block:opacity-100 border-border/50',
          )}
          aria-label="Drag to reorder block"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Floating action toolbar - shown when selected */}
        {isSelected && (
          <div className="absolute -top-4 end-3 z-20 flex items-center gap-0.5 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl px-1 py-0.5 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {/* Move Up */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
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
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
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

            {/* Divider */}
            <div className="mx-0.5 h-4 w-px bg-border/50" />

            {/* Duplicate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
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
                  className="h-7 w-7 p-0 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
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
                  className="rounded-lg text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
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
          <div className="absolute inset-y-2 start-0 w-[3px] rounded-e-full bg-gradient-to-b from-primary to-primary/60" />
        )}

        {/* Block content */}
        <div className={cn('p-4', isSelected && 'ps-5')}>{children}</div>
      </div>
    </TooltipProvider>
  );
}
