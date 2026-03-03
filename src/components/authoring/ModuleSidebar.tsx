'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  FileText,
  FolderOpen,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditorStore } from '@/stores/editor.store';
import { cn } from '@/lib/utils';

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
    if (!isEditing) {
      setEditValue(value);
    }
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
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
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
        className="h-6 px-1.5 py-0 text-xs border-primary/40 bg-primary/5 focus-visible:ring-primary/20"
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setIsEditing(true)}
      className={cn('cursor-default truncate select-none', className)}
      title={`${value} — Double-click to rename`}
    >
      {value}
    </span>
  );
}

// ============================================================
// MODULE SIDEBAR COMPONENT
// ============================================================

export function ModuleSidebar() {
  const modules = useEditorStore((s) => s.content.modules);
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

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.map((m) => m.id)),
  );

  useEffect(() => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      for (const m of modules) {
        if (!next.has(m.id)) {
          next.add(m.id);
        }
      }
      return next;
    });
  }, [modules]);

  const toggleModuleExpanded = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  const handleLessonClick = useCallback(
    (moduleId: string, lessonId: string) => {
      selectModule(moduleId);
      selectLesson(lessonId);
    },
    [selectModule, selectLesson],
  );

  const handleAddModule = useCallback(() => {
    addModule('New Module');
  }, [addModule]);

  const handleAddLesson = useCallback(
    (moduleId: string) => {
      addLesson(moduleId, 'New Lesson');
    },
    [addLesson],
  );

  const handleModuleRename = useCallback(
    (moduleId: string, newTitle: string) => {
      updateModule(moduleId, { title: newTitle });
    },
    [updateModule],
  );

  const handleLessonRename = useCallback(
    (moduleId: string, lessonId: string, newTitle: string) => {
      updateLesson(moduleId, lessonId, { title: newTitle });
    },
    [updateLesson],
  );

  const handleDeleteModule = useCallback(
    (e: React.MouseEvent, moduleId: string) => {
      e.stopPropagation();
      deleteModule(moduleId);
    },
    [deleteModule],
  );

  const handleDeleteLesson = useCallback(
    (e: React.MouseEvent, moduleId: string, lessonId: string) => {
      e.stopPropagation();
      deleteLesson(moduleId, lessonId);
    },
    [deleteLesson],
  );

  return (
    <div className="flex h-full w-72 flex-col border-e border-border/60 bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Course Structure
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddModule}
          className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Module
        </Button>
      </div>

      {/* Module Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2.5 space-y-1">
          {modules.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
                <FolderOpen className="h-5 w-5 text-primary/50" />
              </div>
              <p className="text-xs text-muted-foreground">
                No modules yet.
              </p>
              <button
                onClick={handleAddModule}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Create your first module
              </button>
            </div>
          )}

          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const isModuleSelected =
              selectedModuleId === module.id && !selectedLessonId;
            const lessonCount = module.lessons.length;

            return (
              <div key={module.id}>
                {/* Module Row */}
                <div
                  className={cn(
                    'group/mod flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 cursor-pointer',
                    isModuleSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground',
                  )}
                  onClick={() => toggleModuleExpanded(module.id)}
                >
                  {/* Expand chevron */}
                  <span className="shrink-0 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>

                  {/* Folder icon */}
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-primary/60" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}

                  {/* Module title */}
                  <InlineEdit
                    value={module.title}
                    onSave={(newTitle) =>
                      handleModuleRename(module.id, newTitle)
                    }
                    className="flex-1 text-sm font-medium"
                  />

                  {/* Lesson count badge */}
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums transition-colors',
                      isModuleSelected
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {lessonCount}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteModule(e, module.id)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground transition-all opacity-0 group-hover/mod:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    title="Delete module"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {/* Lessons */}
                {isExpanded && (
                  <div className="ms-4 mt-0.5 border-s-2 border-border/40 ps-2 space-y-0.5">
                    {module.lessons.map((lesson) => {
                      const isSelected =
                        selectedModuleId === module.id &&
                        selectedLessonId === lesson.id;
                      const blockCount = lesson.blocks?.length ?? 0;

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'group/lesson flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150 cursor-pointer',
                            isSelected
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-muted text-foreground/80',
                          )}
                          onClick={() =>
                            handleLessonClick(module.id, lesson.id)
                          }
                        >
                          {/* Lesson icon */}
                          <FileText
                            className={cn(
                              'h-3.5 w-3.5 shrink-0',
                              isSelected
                                ? 'text-primary'
                                : 'text-muted-foreground',
                            )}
                          />

                          {/* Lesson title */}
                          <InlineEdit
                            value={lesson.title}
                            onSave={(newTitle) =>
                              handleLessonRename(
                                module.id,
                                lesson.id,
                                newTitle,
                              )
                            }
                            className="flex-1 text-xs"
                          />

                          {/* Block count */}
                          {blockCount > 0 && (
                            <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                              {blockCount}
                            </span>
                          )}

                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}

                          {/* Delete */}
                          <button
                            onClick={(e) =>
                              handleDeleteLesson(e, module.id, lesson.id)
                            }
                            className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-all opacity-0 group-hover/lesson:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                            title="Delete lesson"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add Lesson */}
                    <button
                      onClick={() => handleAddLesson(module.id)}
                      className="mt-0.5 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                      Add Lesson
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
