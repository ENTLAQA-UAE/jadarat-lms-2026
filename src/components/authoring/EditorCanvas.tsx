'use client';

import React, { useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useEditorStore } from '@/stores/editor.store';
import { BlockEditor } from '@/components/authoring/blocks';
import { BlockWrapper } from './BlockWrapper';
import { Button } from '@/components/ui/button';

export function EditorCanvas() {
  const selectedModuleId = useEditorStore((s) => s.selectedModuleId);
  const selectedLessonId = useEditorStore((s) => s.selectedLessonId);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const getCurrentModule = useEditorStore((s) => s.getCurrentModule);
  const getCurrentLesson = useEditorStore((s) => s.getCurrentLesson);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const currentModule = getCurrentModule();
  const currentLesson = getCurrentLesson();

  // Undo/Redo keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !selectedModuleId || !selectedLessonId || !currentLesson) {
        return;
      }

      const oldIndex = currentLesson.blocks.findIndex((b) => b.id === active.id);
      const newIndex = currentLesson.blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(selectedModuleId, selectedLessonId, oldIndex, newIndex);
      }
    },
    [selectedModuleId, selectedLessonId, currentLesson, reorderBlocks],
  );

  // No module selected
  if (!selectedModuleId || !currentModule) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No module selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select or create a module to start
          </p>
        </div>
      </div>
    );
  }

  // No lesson selected
  if (!selectedLessonId || !currentLesson) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No lesson selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select or create a lesson to start
          </p>
        </div>
      </div>
    );
  }

  const blocks = currentLesson.blocks;
  const blockIds = blocks.map((b) => b.id);

  // Empty lesson - no blocks yet
  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No blocks yet</h3>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Add your first block to start building this lesson
          </p>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => {
              // BlockToolbar handles block creation - this button acts as a visual cue.
              // Scroll to the toolbar at the bottom or trigger block menu.
              const toolbar = document.getElementById('block-toolbar');
              toolbar?.scrollIntoView({ behavior: 'smooth' });
              toolbar?.focus();
            }}
          >
            <Plus className="h-4 w-4" />
            Add your first block
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-3 p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockWrapper
              key={block.id}
              id={block.id}
              isSelected={selectedBlockId === block.id}
              onSelect={() => selectBlock(block.id)}
              onDelete={() => deleteBlock(selectedModuleId, selectedLessonId, block.id)}
              onDuplicate={() => duplicateBlock(selectedModuleId, selectedLessonId, block.id)}
            >
              <BlockEditor
                block={block}
                onChange={(data) =>
                  updateBlock(selectedModuleId, selectedLessonId, block.id, data)
                }
              />
            </BlockWrapper>
          ))}
        </SortableContext>
      </DndContext>

      {/* Block toolbar area at the bottom for adding new blocks */}
      <div id="block-toolbar" tabIndex={-1} />
    </div>
  );
}
