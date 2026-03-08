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
  Unlock,
  Paintbrush,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BlockStyle } from '@/types/authoring';

interface BlockWrapperProps {
  id: string;
  isSelected: boolean;
  blockType?: string;
  blockIndex?: number;
  totalBlocks?: number;
  isVisible?: boolean;
  isLocked?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility?: () => void;
  onToggleLock?: () => void;
  blockStyle?: BlockStyle;
  onStyleChange?: (style: BlockStyle) => void;
  children: React.ReactNode;
}

export const BlockWrapper = React.memo(function BlockWrapper({
  id,
  isSelected,
  blockType,
  blockIndex,
  totalBlocks,
  isVisible = true,
  isLocked = false,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleLock,
  blockStyle,
  onStyleChange,
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
          'group/block relative rounded-xl transition-all duration-200',
          isSelected
            ? 'bg-card border border-primary/20 shadow-elevation-2 ring-1 ring-primary/8'
            : 'bg-card border border-border/40 hover:border-border/70 hover:shadow-elevation-1',
          isDragging && 'opacity-40 shadow-elevation-3 scale-[1.005] ring-2 ring-primary/15',
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-block-action]')) return;
          onSelect();
        }}
      >
        {/* Block type label — only visible on selection or hover */}
        {blockType && (
          <div
            className={cn(
              'absolute -top-2.5 start-3 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-150',
              isSelected
                ? 'opacity-100 bg-primary/8 text-primary/70 border border-primary/12'
                : 'opacity-0 group-hover/block:opacity-100 bg-card text-muted-foreground/50 border border-border/50 shadow-xs',
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
            'absolute -start-2.5 top-1/2 -translate-y-1/2 flex h-9 w-5 cursor-grab items-center justify-center rounded-md border bg-card text-muted-foreground/25 transition-all duration-150 hover:text-primary hover:border-primary/20 hover:shadow-sm active:cursor-grabbing active:scale-90',
            isSelected || isDragging
              ? 'opacity-100 border-primary/12'
              : 'opacity-0 group-hover/block:opacity-100 border-border/40',
          )}
          aria-label="Drag to reorder block"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Floating action toolbar */}
        {isSelected && (
          <div className="absolute -top-3.5 end-3 z-20 flex items-center gap-px rounded-lg border border-border/50 bg-card px-0.5 py-0.5 shadow-elevation-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {/* Move Up */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-150"
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
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-150"
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

            <div className="mx-px h-4 w-px bg-border/40" />

            {/* Duplicate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-primary/[0.06] transition-all duration-150"
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

            {/* Design */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 rounded-md transition-all duration-150",
                    blockStyle?.background_color || blockStyle?.card_mode
                      ? "text-primary bg-primary/[0.06]"
                      : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Paintbrush className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Block Design</h4>

                {/* Background color */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={blockStyle?.background_color || '#ffffff'}
                      onChange={(e) => onStyleChange?.({ ...blockStyle, background_color: e.target.value })}
                      className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                    <Input
                      type="text"
                      value={blockStyle?.background_color || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                          onStyleChange?.({ ...blockStyle, background_color: val });
                        }
                      }}
                      placeholder="None"
                      className="h-8 flex-1 font-mono text-xs"
                      maxLength={7}
                    />
                    {blockStyle?.background_color && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => {
                          const { background_color, ...rest } = blockStyle || {};
                          onStyleChange?.(rest);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Padding */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Padding</Label>
                  <div className="flex gap-1">
                    {(['none', 'small', 'medium', 'large'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onStyleChange?.({ ...blockStyle, padding: p })}
                        className={cn(
                          'flex-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors capitalize',
                          (blockStyle?.padding || 'medium') === p
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card mode */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Card Style</Label>
                  <Switch
                    checked={blockStyle?.card_mode ?? false}
                    onCheckedChange={(checked) => onStyleChange?.({ ...blockStyle, card_mode: checked })}
                  />
                </div>

                {/* Full width */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Full Width</Label>
                  <Switch
                    checked={blockStyle?.full_width ?? false}
                    onCheckedChange={(checked) => onStyleChange?.({ ...blockStyle, full_width: checked })}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Delete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-block-action
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-all duration-150"
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
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-150"
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
                {onToggleVisibility && (
                  <DropdownMenuItem
                    className="rounded-lg text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility();
                    }}
                  >
                    {isVisible ? (
                      <>
                        <EyeOff className="mr-2 h-3.5 w-3.5" />
                        Hide Block
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Show Block
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onToggleLock && (
                  <DropdownMenuItem
                    className="rounded-lg text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock();
                    }}
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="mr-2 h-3.5 w-3.5" />
                        Unlock Block
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-3.5 w-3.5" />
                        Lock Block
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg text-sm text-destructive focus:text-destructive focus:bg-destructive/8"
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
          <div className="absolute inset-y-2 start-0 w-[2.5px] rounded-e-full gradient-vivid" />
        )}

        {/* Hidden/Locked indicators */}
        {(!isVisible || isLocked) && (
          <div className="absolute top-2 end-2 z-10 flex items-center gap-1">
            {!isVisible && (
              <span className="flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 border border-border/30">
                <EyeOff className="h-3 w-3" />
                Hidden
              </span>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 rounded-md bg-amber-500/8 px-1.5 py-0.5 text-[10px] font-medium text-amber-600/70 border border-amber-500/15">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            )}
          </div>
        )}

        {/* Block content */}
        <div className={cn('p-5', isSelected && 'ps-6', !isVisible && 'opacity-40')}>{children}</div>
      </div>
    </TooltipProvider>
  );
});
