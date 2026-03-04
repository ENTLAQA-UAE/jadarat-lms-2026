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
  GripVertical,
  BookOpen,
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
        className="h-6 px-1.5 py-0 text-xs border-primary/40 bg-primary/5 focus-visible:ring-primary/20 rounded-md"
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

  const handleModuleClick = useCallback(
    (moduleId: string) => {
      // Select module AND toggle expand (Rise-style: click selects + toggles)
      selectModule(moduleId);
      toggleModuleExpanded(moduleId);
    },
    [selectModule, toggleModuleExpanded],
  );

  const confirmDeleteModule = useCallback(
    (moduleId: string) => {
      deleteModule(moduleId);
    },
    [deleteModule],
  );

  const confirmDeleteLesson = useCallback(
    (moduleId: string, lessonId: string) => {
      deleteLesson(moduleId, lessonId);
    },
    [deleteLesson],
  );

  return (
    <div className="flex h-full w-72 flex-col border-e border-border/40 bg-background/50 backdrop-blur-sm">
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
              <p className="text-sm font-medium text-foreground/70 mb-1">
                No modules yet
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Create your first module to start building
              </p>
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

          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(module.id);
            const isModuleSelected =
              selectedModuleId === module.id && !selectedLessonId;
            const lessonCount = module.lessons?.length ?? 0;

            return (
              <div key={module.id} className="animate-in fade-in duration-200">
                {/* Module Row */}
                <div
                  className={cn(
                    'group/mod flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm transition-all duration-200 cursor-pointer',
                    isModuleSelected
                      ? 'bg-primary/8 text-primary shadow-sm shadow-primary/5 border border-primary/15'
                      : 'hover:bg-muted/60 text-foreground border border-transparent',
                  )}
                  onClick={() => handleModuleClick(module.id)}
                >
                  {/* Expand chevron */}
                  <span className={cn(
                    'shrink-0 transition-transform duration-200',
                    isExpanded ? 'text-primary/60' : 'text-muted-foreground',
                  )}>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </span>

                  {/* Folder icon */}
                  <div className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-200',
                    isModuleSelected || isExpanded
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground',
                  )}>
                    {isExpanded ? (
                      <FolderOpen className="h-3.5 w-3.5" />
                    ) : (
                      <Folder className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Module title */}
                  <InlineEdit
                    value={module.title}
                    onSave={(newTitle) =>
                      handleModuleRename(module.id, newTitle)
                    }
                    className="flex-1 text-[13px] font-medium"
                  />

                  {/* Lesson count badge */}
                  <span
                    className={cn(
                      'shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums transition-all duration-200',
                      isModuleSelected
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted/60 text-muted-foreground',
                    )}
                  >
                    {lessonCount}
                  </span>

                  {/* Delete button with confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 opacity-0 group-hover/mod:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        title="Delete module"
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
                        <AlertDialogAction
                          onClick={() => confirmDeleteModule(module.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Lessons */}
                {isExpanded && (
                  <div className="ms-5 mt-0.5 border-s-2 border-border/30 ps-1.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {(module.lessons ?? []).map((lesson) => {
                      const isSelected =
                        selectedModuleId === module.id &&
                        selectedLessonId === lesson.id;
                      const blockCount = lesson.blocks?.length ?? 0;

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'group/lesson flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-200 cursor-pointer',
                            isSelected
                              ? 'bg-primary/8 text-primary font-medium border border-primary/15'
                              : 'hover:bg-muted/50 text-foreground/75 border border-transparent',
                          )}
                          onClick={() =>
                            handleLessonClick(module.id, lesson.id)
                          }
                        >
                          {/* Lesson icon */}
                          <div className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all duration-200',
                            isSelected
                              ? 'text-primary'
                              : 'text-muted-foreground/60',
                          )}>
                            <FileText className="h-3.5 w-3.5" />
                          </div>

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
                            <span className={cn(
                              'shrink-0 text-[10px] tabular-nums transition-colors',
                              isSelected ? 'text-primary/60' : 'text-muted-foreground/50',
                            )}>
                              {blockCount}
                            </span>
                          )}

                          {/* Selected dot indicator */}
                          {isSelected && (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/30" />
                          )}

                          {/* Delete with confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-all duration-200 opacity-0 group-hover/lesson:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete lesson"
                              >
                                <X className="h-3 w-3" />
                              </button>
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
                                <AlertDialogAction
                                  onClick={() => confirmDeleteLesson(module.id, lesson.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      );
                    })}

                    {/* Add Lesson */}
                    <button
                      onClick={() => handleAddLesson(module.id)}
                      className="mt-0.5 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/70 transition-all duration-200 hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10"
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

      {/* Footer stats */}
      {modules.length > 0 && (
        <div className="border-t border-border/40 px-4 py-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{modules.length} {modules.length === 1 ? 'module' : 'modules'}</span>
            <span>
              {modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0)} lessons
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
