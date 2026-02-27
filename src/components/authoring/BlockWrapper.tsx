'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockWrapperProps {
  id: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  children: React.ReactNode;
}

export function BlockWrapper({
  id,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card transition-colors',
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-muted-foreground/30',
        isDragging && 'opacity-50 shadow-lg',
      )}
      onClick={(e) => {
        // Prevent selection when clicking action buttons
        if ((e.target as HTMLElement).closest('[data-block-action]')) return;
        onSelect();
      }}
    >
      {/* Drag handle - visible on hover or when selected */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          'absolute -start-3 top-1/2 -translate-y-1/2 flex h-8 w-6 cursor-grab items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm transition-opacity active:cursor-grabbing',
          isSelected || isDragging
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100',
        )}
        aria-label="Drag to reorder block"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Action buttons - shown when selected */}
      {isSelected && (
        <div className="absolute -top-3 end-2 z-10 flex items-center gap-1">
          <Button
            data-block-action
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-background shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate block"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            data-block-action
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete block"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Block content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
