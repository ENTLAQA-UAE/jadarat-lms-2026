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
  Eye,
  EyeOff,
  Lock,
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
    <TooltipProvider delayDuration={400}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group/block relative rounded-xl border bg-card transition-all duration-200',
          isSelected
            ? 'border-primary/60 shadow-[0_0_0_1px_rgba(var(--primary-rgb,59,130,246),0.15)] ring-[3px] ring-primary/10'
            : 'border-border/60 hover:border-border hover:shadow-sm',
          isDragging && 'opacity-40 shadow-2xl scale-[1.02] rotate-[0.5deg]',
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-block-action]')) return;
          onSelect();
        }}
      >
        {/* Block type label - shows on hover */}
        {blockType && (
          <div
            className={cn(
              'absolute -top-2.5 start-3 z-10 rounded-md bg-muted/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border border-border/50 transition-all duration-200',
              isSelected
                ? 'opacity-100 bg-primary/10 text-primary border-primary/20'
                : 'opacity-0 group-hover/block:opacity-100',
            )}
          >
            {blockType.replace(/_/g, ' ')}
          </div>
        )}

        {/* Drag handle - left side pill */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={cn(
            'absolute -start-3.5 top-1/2 -translate-y-1/2 flex h-10 w-7 cursor-grab items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:text-foreground hover:border-primary/30 active:cursor-grabbing active:scale-95',
            isSelected || isDragging
              ? 'opacity-100 border-primary/20'
              : 'opacity-0 group-hover/block:opacity-100',
          )}
          aria-label="Drag to reorder block"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Floating action toolbar - shown when selected */}
        {isSelected && (
          <div className="absolute -top-4 end-3 z-20 flex items-center gap-0.5 rounded-lg border border-border/80 bg-background/95 backdrop-blur-sm px-1 py-0.5 shadow-lg">
            {/* Move Up */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.();
                  }}
                  disabled={!canMoveUp}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
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
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.();
                  }}
                  disabled={!canMoveDown}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Move down
              </TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="mx-0.5 h-4 w-px bg-border" />

            {/* Duplicate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
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
                  className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
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
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
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
                  className="text-destructive focus:text-destructive"
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

        {/* Block content */}
        <div className="p-4">{children}</div>
      </div>
    </TooltipProvider>
  );
}
