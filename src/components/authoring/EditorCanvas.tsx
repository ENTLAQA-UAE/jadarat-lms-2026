'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import { Plus, Sparkles } from 'lucide-react';
import { useEditorStore } from '@/stores/editor.store';
import { BlockEditor } from '@/components/authoring/blocks';
import { BlockWrapper } from './BlockWrapper';
import { BlockToolbar } from './BlockToolbar';
import { BlockType, type Block } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

function createDefaultBlock(type: BlockType): Block {
  const now = new Date().toISOString();
  const base = {
    id: uuidv4(),
    type,
    order: 0,
    visible: true,
    locked: false,
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: 'human' as const,
    },
  };

  switch (type) {
    case BlockType.TEXT:
      return { ...base, type, data: { content: '', alignment: 'start', direction: 'auto' } };
    case BlockType.IMAGE:
      return { ...base, type, data: { src: '', alt: '', caption: '', width: 'full', alignment: 'center' } };
    case BlockType.VIDEO:
      return { ...base, type, data: { bunny_video_id: '', bunny_library_id: '', title: '', duration_seconds: 0, thumbnail_url: '', captions: [], chapters: [], completion_criteria: 'watch_75', allow_skip: false, autoplay: false } };
    case BlockType.DIVIDER:
      return { ...base, type, data: { style: 'line', spacing: 'medium' } };
    case BlockType.QUOTE:
      return { ...base, type, data: { text: '', attribution: '', style: 'default' } };
    case BlockType.LIST:
      return { ...base, type, data: { items: [{ id: uuidv4(), text: '' }], style: 'bullet', columns: 1 } };
    case BlockType.CODE:
      return { ...base, type, data: { code: '', language: 'javascript', show_line_numbers: true, caption: '' } };
    case BlockType.ACCORDION:
      return { ...base, type, data: { items: [{ id: uuidv4(), title: 'Section 1', content: '' }], allow_multiple_open: false, start_expanded: false } };
    case BlockType.CALLOUT:
      return { ...base, type, data: { variant: 'info', title: '', content: '', collapsible: false } };
    case BlockType.STATEMENT:
      return { ...base, type, data: { text: '', style: 'bold', alignment: 'center', accent_color: '' } };
    case BlockType.BUTTON:
      return { ...base, type, data: { buttons: [{ id: uuidv4(), label: 'Click me', action: 'link', url: '', style: 'primary' }], alignment: 'center', layout: 'inline' } };
    case BlockType.CONTINUE:
      return { ...base, type, data: { label: 'Continue', completion_type: 'none' } };
    case BlockType.COVER:
      return { ...base, type, data: { background_image: '', title: '', overlay_color: '#000000AA', text_alignment: 'center', height: 'medium' } };
    case BlockType.MULTIPLE_CHOICE:
      return { ...base, type, data: { question: '', options: [{ id: uuidv4(), text: '', is_correct: false }], explanation: '', allow_retry: true, shuffle_options: false, points: 1 } };
    case BlockType.TRUE_FALSE:
      return { ...base, type, data: { statement: '', correct_answer: true, explanation_true: '', explanation_false: '', points: 1 } };
    default:
      return { ...base, data: {} } as Block;
  }
}

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
  const addBlock = useEditorStore((s) => s.addBlock);

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const currentModule = getCurrentModule();
  const currentLesson = getCurrentLesson();

  // Track which inline inserter is open
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

  // Undo/Redo keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

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
      activationConstraint: { distance: 8 },
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

  const handleMoveBlock = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!selectedModuleId || !selectedLessonId) return;
      reorderBlocks(selectedModuleId, selectedLessonId, fromIndex, toIndex);
    },
    [selectedModuleId, selectedLessonId, reorderBlocks],
  );

  const handleInsertBlock = useCallback(
    (type: BlockType) => {
      if (!selectedModuleId || !selectedLessonId) return;
      const block = createDefaultBlock(type);
      addBlock(selectedModuleId, selectedLessonId, block);
      setInsertAfterIndex(null);
    },
    [selectedModuleId, selectedLessonId, addBlock],
  );

  // ── Empty states ─────────────────────────────────────────
  if (!selectedModuleId || !currentModule) {
    return (
      <EmptyState
        icon={<Sparkles className="h-8 w-8 text-primary/60" />}
        title="No module selected"
        description="Select a module from the sidebar or create a new one to start building."
      />
    );
  }

  if (!selectedLessonId || !currentLesson) {
    return (
      <EmptyState
        icon={<Plus className="h-8 w-8 text-primary/60" />}
        title="No lesson selected"
        description="Select a lesson from the sidebar to start editing its content blocks."
      />
    );
  }

  const blocks = currentLesson.blocks;
  const blockIds = blocks.map((b) => b.id);

  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <Plus className="h-8 w-8 text-primary/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Start building</h3>
          <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
            Add blocks to create an engaging lesson. Mix text, images, interactive elements, and quizzes.
          </p>
          <BlockToolbar onInsertBlock={handleInsertBlock} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-1 px-6 py-8">
      {/* Lesson header breadcrumb */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {currentModule.title}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {currentLesson.title}
          </h2>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1 border border-border/40">
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {/* Inline "+" insertion between blocks */}
              {index > 0 && (
                <InlineInsertButton
                  isOpen={insertAfterIndex === index - 1}
                  onToggle={() =>
                    setInsertAfterIndex(
                      insertAfterIndex === index - 1 ? null : index - 1
                    )
                  }
                  onInsert={handleInsertBlock}
                />
              )}

              <BlockWrapper
                id={block.id}
                isSelected={selectedBlockId === block.id}
                blockType={block.type}
                blockIndex={index}
                totalBlocks={blocks.length}
                onSelect={() => selectBlock(block.id)}
                onDelete={() =>
                  deleteBlock(selectedModuleId, selectedLessonId, block.id)
                }
                onDuplicate={() =>
                  duplicateBlock(selectedModuleId, selectedLessonId, block.id)
                }
                onMoveUp={
                  index > 0
                    ? () => handleMoveBlock(index, index - 1)
                    : undefined
                }
                onMoveDown={
                  index < blocks.length - 1
                    ? () => handleMoveBlock(index, index + 1)
                    : undefined
                }
              >
                <BlockEditor
                  block={block}
                  onChange={(data) =>
                    updateBlock(selectedModuleId, selectedLessonId, block.id, data)
                  }
                />
              </BlockWrapper>
            </React.Fragment>
          ))}
        </SortableContext>
      </DndContext>

      {/* Bottom "Add Block" area */}
      <div className="pt-4 flex justify-center">
        <BlockToolbar onInsertBlock={handleInsertBlock} />
      </div>

      <div className="h-32" />
    </div>
  );
}

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ============================================================
// INLINE INSERT BUTTON (Notion-style "+" between blocks)
// ============================================================

function InlineInsertButton({
  isOpen,
  onToggle,
  onInsert,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onInsert: (type: BlockType) => void;
}) {
  return (
    <div
      className={cn(
        'group/insert relative flex items-center justify-center transition-all',
        isOpen ? 'py-2' : 'py-0.5',
      )}
    >
      {/* Horizontal line */}
      <div
        className={cn(
          'absolute inset-x-0 top-1/2 h-px transition-colors duration-200',
          isOpen
            ? 'bg-primary/30'
            : 'bg-transparent group-hover/insert:bg-border',
        )}
      />

      {/* "+" circle */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200',
          isOpen
            ? 'bg-primary text-primary-foreground border-primary shadow-md scale-110'
            : 'bg-background text-muted-foreground border-border/60 opacity-0 group-hover/insert:opacity-100 hover:border-primary hover:text-primary hover:shadow-sm',
        )}
      >
        <Plus
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-45',
          )}
        />
      </button>

      {/* Popover-style insert menu */}
      {isOpen && (
        <div className="absolute top-full z-30 mt-1">
          <BlockToolbar onInsertBlock={onInsert} />
        </div>
      )}
    </div>
  );
}
