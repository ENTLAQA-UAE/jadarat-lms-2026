'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Plus, Sparkles, LayoutGrid } from 'lucide-react';
import { useEditorStore } from '@/stores/editor.store';
import { BlockEditor } from '@/components/authoring/blocks';
import { BlockWrapper } from './BlockWrapper';
import { QuickAddBar } from './QuickAddBar';
import { BlockType, type Block } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

export function createDefaultBlock(type: BlockType): Block {
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
    case BlockType.AUDIO:
      return { ...base, type, data: { src: '', title: '', duration_seconds: 0, show_transcript: false } };
    case BlockType.EMBED:
      return { ...base, type, data: { url: '', provider: 'youtube', aspect_ratio: '16:9', allow_fullscreen: true } };
    case BlockType.TABLE:
      return { ...base, type, data: { headers: ['Column 1', 'Column 2'], rows: [['', '']], has_header_row: true, striped: false } };
    case BlockType.GALLERY:
      return { ...base, type, data: { images: [], layout: 'grid', columns: 3 } };
    case BlockType.CHART:
      return { ...base, type, data: { chart_type: 'bar', title: '', labels: ['Label 1'], datasets: [{ label: 'Dataset 1', data: [0], color: '#1a73e8' }], show_legend: true } };
    case BlockType.TABS:
      return { ...base, type, data: { tabs: [{ id: uuidv4(), label: 'Tab 1', content: '' }], style: 'horizontal' } };
    case BlockType.FLASHCARD:
      return { ...base, type, data: { cards: [{ id: uuidv4(), front: '', back: '' }], shuffle: false } };
    case BlockType.LABELED_GRAPHIC:
      return { ...base, type, data: { image: '', markers: [] } };
    case BlockType.PROCESS:
      return { ...base, type, data: { steps: [{ id: uuidv4(), title: 'Step 1', description: '' }], layout: 'vertical', numbered: true } };
    case BlockType.TIMELINE:
      return { ...base, type, data: { events: [{ id: uuidv4(), date: '', title: 'Event 1', description: '' }], direction: 'vertical' } };
    case BlockType.HOTSPOT:
      return { ...base, type, data: { image: '', regions: [], mode: 'explore' } };
    case BlockType.SCENARIO:
      return { ...base, type, data: { title: '', description: '', nodes: [{ id: uuidv4(), type: 'question', content: '', choices: [] }], start_node_id: '' } };
    case BlockType.MULTIPLE_RESPONSE:
      return { ...base, type, data: { question: '', options: [{ id: uuidv4(), text: '', is_correct: false }], explanation: '', min_selections: 1, max_selections: 2, scoring: 'all_or_nothing', points: 1 } };
    case BlockType.FILL_IN_BLANK:
      return { ...base, type, data: { text_with_blanks: '', blanks: [{ id: 'blank_1', correct_answers: [''], case_sensitive: false }], explanation: '', points: 1 } };
    case BlockType.MATCHING:
      return { ...base, type, data: { instruction: '', pairs: [{ id: uuidv4(), left: '', right: '' }], shuffle: true, explanation: '', points: 1 } };
    case BlockType.SORTING:
      return { ...base, type, data: { instruction: '', categories: [{ id: uuidv4(), name: 'Category 1' }], items: [{ id: uuidv4(), text: '', correct_category_id: '' }], explanation: '', points: 1 } };
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+Z / Ctrl+Shift+Z — Undo/Redo (skip if inside input)
      if (isCtrlOrCmd && !isInput) {
        if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          redo();
          return;
        } else if (e.key === 'z') {
          e.preventDefault();
          undo();
          return;
        }
      }

      // Skip remaining shortcuts when editing text
      if (isInput) return;

      // Escape — deselect block
      if (e.key === 'Escape') {
        e.preventDefault();
        selectBlock(null);
        return;
      }

      // Delete / Backspace — delete selected block
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId && selectedModuleId && selectedLessonId) {
        e.preventDefault();
        deleteBlock(selectedModuleId, selectedLessonId, selectedBlockId);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectBlock, deleteBlock, selectedBlockId, selectedModuleId, selectedLessonId]);

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

  // ── Empty states ────────────────────────────────────────
  if (!selectedModuleId || !currentModule) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-50 dark:from-indigo-500/15 dark:to-violet-500/10 border border-indigo-200/50 dark:border-indigo-500/15 shadow-lg shadow-indigo-500/5">
            <Sparkles className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Select a module</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto mb-8">
            Choose a module from the sidebar, or create a new one to start building your course.
          </p>
          <button
            type="button"
            onClick={() => {
              const toggleSidebar = useEditorStore.getState().toggleSidebar;
              const sidebarOpen = useEditorStore.getState().sidebarOpen;
              if (!sidebarOpen) toggleSidebar();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            Open Sidebar
          </button>
        </div>
      </div>
    );
  }

  if (!selectedLessonId || !currentLesson) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-50 dark:from-indigo-500/15 dark:to-violet-500/10 border border-indigo-200/50 dark:border-indigo-500/15 shadow-lg shadow-indigo-500/5">
            <Plus className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Select a lesson</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto mb-8">
            Pick a lesson from <strong className="text-slate-600 dark:text-slate-300">{currentModule.title}</strong> to start adding content blocks.
          </p>
          <button
            type="button"
            onClick={() => {
              const toggleSidebar = useEditorStore.getState().toggleSidebar;
              const sidebarOpen = useEditorStore.getState().sidebarOpen;
              if (!sidebarOpen) toggleSidebar();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            Open Sidebar
          </button>
        </div>
      </div>
    );
  }

  const blocks = currentLesson.blocks ?? [];
  const blockIds = blocks.map((b) => b.id);

  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center max-w-lg">
          {/* Module > Lesson breadcrumb */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5">
            {currentModule.title} / {currentLesson.title}
          </div>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Add your first block</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Use the Block Library or quick-add bar below to start building your lesson content.
          </p>

          <QuickAddBar onInsertBlock={handleInsertBlock} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-2 px-6 py-8"
      role="region"
      aria-label={`Editing lesson: ${currentLesson.title}`}
    >
      {/* Lesson header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-indigo-500/70 dark:text-indigo-400/50 uppercase tracking-wider mb-1">
            {currentModule.title}
          </p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
            {currentLesson.title}
          </h2>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 font-medium">
          <span className="tabular-nums">{blocks.length}</span>
          <span>{blocks.length === 1 ? 'block' : 'blocks'}</span>
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
                <LazyBlockContent>
                  <BlockEditor
                    block={block}
                    onChange={(data) =>
                      updateBlock(selectedModuleId, selectedLessonId, block.id, data)
                    }
                  />
                </LazyBlockContent>
              </BlockWrapper>
            </React.Fragment>
          ))}
        </SortableContext>
      </DndContext>

      {/* Bottom quick-add bar (Rise-style) */}
      <div className="pt-6 flex justify-center">
        <QuickAddBar onInsertBlock={handleInsertBlock} />
      </div>

      <div className="h-20" />
    </div>
  );
}

// ============================================================
// LAZY BLOCK CONTENT (defers rendering for off-screen blocks)
// ============================================================

function LazyBlockContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }, // Pre-render 300px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {hasBeenVisible ? (
        children
      ) : (
        <div className="h-20 rounded-lg bg-muted/20 animate-pulse" />
      )}
    </div>
  );
}

// ============================================================
// INLINE INSERT BUTTON (Rise-style "+" between blocks)
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
        'group/insert relative flex items-center justify-center transition-all duration-300',
        isOpen ? 'py-3' : 'py-1',
      )}
    >
      {/* Horizontal line */}
      <div
        className={cn(
          'absolute inset-x-0 top-1/2 h-px transition-all duration-300',
          isOpen
            ? 'bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent'
            : 'bg-transparent group-hover/insert:bg-gradient-to-r group-hover/insert:from-transparent group-hover/insert:via-slate-300/60 dark:group-hover/insert:via-slate-600/60 group-hover/insert:to-transparent',
        )}
      />

      {/* "+" circle */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300',
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-110'
            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-0 group-hover/insert:opacity-100 hover:border-indigo-400 hover:text-indigo-500 hover:shadow-sm hover:scale-110',
        )}
      >
        <Plus
          className={cn(
            'h-3 w-3 transition-transform duration-300',
            isOpen && 'rotate-45',
          )}
        />
      </button>

      {/* Rise-style inline quick-add bar */}
      {isOpen && (
        <div className="absolute top-full z-30 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <QuickAddBar onInsertBlock={onInsert} compact />
        </div>
      )}
    </div>
  );
}
