'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  FileText,
  FolderOpen,
  Folder,
  GripVertical,
  BookOpen,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useEditorStore } from '@/stores/editor.store';
import { cn } from '@/lib/utils';

// ============================================================
// PERSIST HELPERS
// ============================================================

const EXPAND_KEY = 'jadarat-sidebar-expanded';

function loadExpanded(): Set<string> | null {
  try {
    const raw = localStorage.getItem(EXPAND_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return null;
}

function saveExpanded(ids: Set<string>) {
  try {
    localStorage.setItem(EXPAND_KEY, JSON.stringify(Array.from(ids)));
  } catch { /* ignore */ }
}

// ============================================================
// INLINE EDITABLE TITLE
// ============================================================

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

function InlineEdit({ value, onSave, className }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) setEditValue(value);
  }, [value, isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSave();
      else if (e.key === 'Escape') {
        setEditValue(value);
        setIsEditing(false);
      }
    },
    [handleSave, value],
  );

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        aria-label="Rename"
        className="h-6 px-1.5 py-0 text-xs border-primary/40 bg-primary/5 focus-visible:ring-primary/20 rounded-md"
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn('cursor-default truncate select-none', className)}
      title={`${value} — Double-click to rename`}
    >
      {value}
    </span>
  );
}

// ============================================================
// SORTABLE MODULE ROW
// ============================================================

interface SortableModuleProps {
  module: { id: string; title: string; lessons: { id: string; title: string; blocks?: unknown[] }[]; is_locked?: boolean };
  isExpanded: boolean;
  isModuleSelected: boolean;
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  otherModules: { id: string; title: string }[];
  onModuleClick: (moduleId: string) => void;
  onModuleRename: (moduleId: string, title: string) => void;
  onModuleDelete: (moduleId: string) => void;
  onLessonClick: (moduleId: string, lessonId: string) => void;
  onLessonRename: (moduleId: string, lessonId: string, title: string) => void;
  onLessonDelete: (moduleId: string, lessonId: string) => void;
  onAddLesson: (moduleId: string) => void;
  onReorderLessons: (moduleId: string, from: number, to: number) => void;
  onMoveLessonToModule: (fromModuleId: string, lessonId: string, toModuleId: string) => void;
}

function SortableModuleRow({
  module,
  isExpanded,
  isModuleSelected,
  selectedModuleId,
  selectedLessonId,
  otherModules,
  onModuleClick,
  onModuleRename,
  onModuleDelete,
  onLessonClick,
  onLessonRename,
  onLessonDelete,
  onAddLesson,
  onReorderLessons,
  onMoveLessonToModule,
}: SortableModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lessonCount = module.lessons?.length ?? 0;

  // Lesson DnD
  const lessonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleLessonDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const lessons = module.lessons ?? [];
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderLessons(module.id, oldIndex, newIndex);
      }
    },
    [module.id, module.lessons, onReorderLessons],
  );

  const lessonIds = (module.lessons ?? []).map((l) => l.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('animate-in fade-in duration-200', isDragging && 'opacity-50 z-50')}
      role="treeitem"
      aria-expanded={isExpanded}
      aria-label={`Module: ${module.title}, ${lessonCount} lessons`}
    >
      {/* Module Row */}
      <div
        className={cn(
          'group/mod flex items-center gap-1 rounded-xl px-2 py-2 text-sm transition-all duration-200 cursor-pointer',
          isModuleSelected
            ? 'bg-primary/8 text-primary shadow-sm shadow-primary/5 border border-primary/15'
            : 'hover:bg-muted/60 text-foreground border border-transparent',
        )}
        onClick={() => onModuleClick(module.id)}
      >
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 opacity-0 group-hover/mod:opacity-100 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-opacity"
          aria-label={`Drag to reorder ${module.title}`}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        {/* Expand chevron */}
        <span className={cn('shrink-0', isExpanded ? 'text-primary/60' : 'text-muted-foreground')}>
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>

        {/* Folder icon */}
        <div className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-200',
          isModuleSelected || isExpanded ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground',
        )}>
          {isExpanded ? <FolderOpen className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
        </div>

        {/* Title */}
        <InlineEdit
          value={module.title}
          onSave={(t) => onModuleRename(module.id, t)}
          className="flex-1 text-[13px] font-medium"
        />

        {/* Lesson count */}
        <span className={cn(
          'shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums',
          isModuleSelected ? 'bg-primary/15 text-primary' : 'bg-muted/60 text-muted-foreground',
        )}>
          {lessonCount}
        </span>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 opacity-0 group-hover/mod:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete module ${module.title}`}
            >
              <X className="h-3 w-3" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete module?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{module.title}</strong> and its {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onModuleDelete(module.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Lessons (sortable) */}
      {isExpanded && (
        <div
          className="ms-5 mt-0.5 border-s-2 border-border/30 ps-1.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200"
          role="group"
          aria-label={`Lessons in ${module.title}`}
        >
          <DndContext sensors={lessonSensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
              {(module.lessons ?? []).map((lesson) => (
                <SortableLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  moduleId={module.id}
                  isSelected={selectedModuleId === module.id && selectedLessonId === lesson.id}
                  otherModules={otherModules}
                  onLessonClick={onLessonClick}
                  onLessonRename={onLessonRename}
                  onLessonDelete={onLessonDelete}
                  onMoveToModule={onMoveLessonToModule}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add Lesson */}
          <button
            onClick={() => onAddLesson(module.id)}
            className="mt-0.5 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/70 transition-all duration-200 hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10"
            aria-label={`Add lesson to ${module.title}`}
          >
            <Plus className="h-3 w-3" />
            Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SORTABLE LESSON ROW
// ============================================================

interface SortableLessonProps {
  lesson: { id: string; title: string; blocks?: unknown[] };
  moduleId: string;
  isSelected: boolean;
  otherModules: { id: string; title: string }[];
  onLessonClick: (moduleId: string, lessonId: string) => void;
  onLessonRename: (moduleId: string, lessonId: string, title: string) => void;
  onLessonDelete: (moduleId: string, lessonId: string) => void;
  onMoveToModule: (fromModuleId: string, lessonId: string, toModuleId: string) => void;
}

function SortableLessonRow({
  lesson,
  moduleId,
  isSelected,
  otherModules,
  onLessonClick,
  onLessonRename,
  onLessonDelete,
  onMoveToModule,
}: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockCount = (lesson.blocks as unknown[])?.length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/lesson flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 cursor-pointer',
        isSelected
          ? 'bg-primary/8 text-primary font-medium border border-primary/15'
          : 'hover:bg-muted/50 text-foreground/75 border border-transparent',
        isDragging && 'opacity-50 z-50',
      )}
      onClick={() => onLessonClick(moduleId, lesson.id)}
      role="treeitem"
      aria-label={`Lesson: ${lesson.title}, ${blockCount} blocks`}
      aria-selected={isSelected}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 flex h-4 w-4 items-center justify-center rounded text-muted-foreground/30 opacity-0 group-hover/lesson:opacity-100 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-opacity"
        aria-label={`Drag to reorder ${lesson.title}`}
      >
        <GripVertical className="h-2.5 w-2.5" />
      </button>

      {/* Icon */}
      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded', isSelected ? 'text-primary' : 'text-muted-foreground/60')}>
        <FileText className="h-3.5 w-3.5" />
      </div>

      {/* Title */}
      <InlineEdit
        value={lesson.title}
        onSave={(t) => onLessonRename(moduleId, lesson.id, t)}
        className="flex-1 text-xs"
      />

      {/* Block count */}
      {blockCount > 0 && (
        <span className={cn('shrink-0 text-[10px] tabular-nums', isSelected ? 'text-primary/60' : 'text-muted-foreground/50')}>
          {blockCount}
        </span>
      )}

      {/* Selected dot */}
      {isSelected && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/30" />}

      {/* Actions (Move + Delete) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-all duration-200 opacity-0 group-hover/lesson:opacity-100 hover:bg-muted/80 hover:text-foreground"
            aria-label={`Actions for lesson ${lesson.title}`}
          >
            <X className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          {otherModules.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-lg text-xs">
                <ArrowRightLeft className="mr-2 h-3 w-3" />
                Move to module
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-xl">
                {otherModules.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    className="rounded-lg text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToModule(moduleId, lesson.id, m.id);
                    }}
                  >
                    <Folder className="mr-2 h-3 w-3" />
                    {m.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="rounded-lg text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={(e) => e.preventDefault()}
              >
                <X className="mr-2 h-3 w-3" />
                Delete lesson
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{lesson.title}</strong> and all its {blockCount} {blockCount === 1 ? 'block' : 'blocks'}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onLessonDelete(moduleId, lesson.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ============================================================
// MODULE SIDEBAR COMPONENT
// ============================================================

export function ModuleSidebar() {
  const modules = useEditorStore((s) => s.content.modules) ?? [];
  const selectedModuleId = useEditorStore((s) => s.selectedModuleId);
  const selectedLessonId = useEditorStore((s) => s.selectedLessonId);
  const addModule = useEditorStore((s) => s.addModule);
  const addLesson = useEditorStore((s) => s.addLesson);
  const updateModule = useEditorStore((s) => s.updateModule);
  const updateLesson = useEditorStore((s) => s.updateLesson);
  const deleteModule = useEditorStore((s) => s.deleteModule);
  const deleteLesson = useEditorStore((s) => s.deleteLesson);
  const selectModule = useEditorStore((s) => s.selectModule);
  const selectLesson = useEditorStore((s) => s.selectLesson);
  const reorderModules = useEditorStore((s) => s.reorderModules);
  const reorderLessons = useEditorStore((s) => s.reorderLessons);
  const moveLessonToModule = useEditorStore((s) => s.moveLessonToModule);

  // Persisted expand/collapse state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const saved = loadExpanded();
    return saved ?? new Set(modules.map((m) => m.id));
  });

  // Auto-expand new modules
  useEffect(() => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const m of modules) {
        if (!next.has(m.id)) {
          next.add(m.id);
          changed = true;
        }
      }
      if (changed) saveExpanded(next);
      return changed ? next : prev;
    });
  }, [modules]);

  const toggleModuleExpanded = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      saveExpanded(next);
      return next;
    });
  }, []);

  // Module DnD
  const moduleSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleModuleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderModules(oldIndex, newIndex);
      }
    },
    [modules, reorderModules],
  );

  // Handlers
  const handleModuleClick = useCallback(
    (moduleId: string) => {
      selectModule(moduleId);
      toggleModuleExpanded(moduleId);
    },
    [selectModule, toggleModuleExpanded],
  );

  const handleLessonClick = useCallback(
    (moduleId: string, lessonId: string) => {
      selectModule(moduleId);
      selectLesson(lessonId);
    },
    [selectModule, selectLesson],
  );

  const handleAddModule = useCallback(() => addModule('New Module'), [addModule]);
  const handleAddLesson = useCallback((moduleId: string) => addLesson(moduleId, 'New Lesson'), [addLesson]);
  const handleModuleRename = useCallback((moduleId: string, title: string) => updateModule(moduleId, { title }), [updateModule]);
  const handleLessonRename = useCallback((moduleId: string, lessonId: string, title: string) => updateLesson(moduleId, lessonId, { title }), [updateLesson]);

  const moduleIds = modules.map((m) => m.id);

  return (
    <div
      className="flex h-full w-72 flex-col border-e border-border/40 bg-background/50 backdrop-blur-sm"
      role="tree"
      aria-label="Course structure"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
            <BookOpen className="h-3 w-3 text-primary" />
          </div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Structure
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddModule}
          className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
          aria-label="Add new module"
        >
          <Plus className="h-3.5 w-3.5" />
          Module
        </Button>
      </div>

      {/* Module Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {modules.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                <FolderOpen className="h-6 w-6 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-foreground/70 mb-1">No modules yet</p>
              <p className="text-xs text-muted-foreground mb-4">Create your first module to start building</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddModule}
                className="gap-1.5 text-xs rounded-lg border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Module
              </Button>
            </div>
          )}

          <DndContext sensors={moduleSensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
            <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
              {modules.map((module) => (
                <SortableModuleRow
                  key={module.id}
                  module={module}
                  isExpanded={expandedModules.has(module.id)}
                  isModuleSelected={selectedModuleId === module.id && !selectedLessonId}
                  selectedModuleId={selectedModuleId}
                  selectedLessonId={selectedLessonId}
                  otherModules={modules.filter((m) => m.id !== module.id).map((m) => ({ id: m.id, title: m.title }))}
                  onModuleClick={handleModuleClick}
                  onModuleRename={handleModuleRename}
                  onModuleDelete={deleteModule}
                  onLessonClick={handleLessonClick}
                  onLessonRename={handleLessonRename}
                  onLessonDelete={deleteLesson}
                  onAddLesson={handleAddLesson}
                  onReorderLessons={reorderLessons}
                  onMoveLessonToModule={moveLessonToModule}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      {/* Footer stats */}
      {modules.length > 0 && (
        <div className="border-t border-border/40 px-4 py-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{modules.length} {modules.length === 1 ? 'module' : 'modules'}</span>
            <span>{modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0)} lessons</span>
          </div>
        </div>
      )}
    </div>
  );
}
