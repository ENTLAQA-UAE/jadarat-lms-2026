'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  FileText,
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

  // Keep editValue in sync when value changes externally
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
        className="h-6 px-1 py-0 text-xs"
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setIsEditing(true)}
      className={cn('cursor-default truncate select-none', className)}
      title="Double-click to rename"
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

  // Track which modules are expanded/collapsed
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.map((m) => m.id)),
  );

  // Track which item is being hovered for showing delete button
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);

  // Auto-expand newly added modules
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
    <div className="flex h-full w-64 flex-col border-e border-border bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Course Structure
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddModule}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Module
        </Button>
      </div>

      {/* Module Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              No modules yet. Click &quot;Add Module&quot; to get started.
            </div>
          )}

          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const isModuleHovered = hoveredModuleId === module.id;

            return (
              <div key={module.id} className="mb-1">
                {/* Module Row */}
                <div
                  className={cn(
                    'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors',
                    'hover:bg-muted cursor-pointer',
                    selectedModuleId === module.id &&
                      !selectedLessonId &&
                      'bg-primary/10 text-primary',
                  )}
                  onClick={() => toggleModuleExpanded(module.id)}
                  onMouseEnter={() => setHoveredModuleId(module.id)}
                  onMouseLeave={() => setHoveredModuleId(null)}
                >
                  {/* Expand/Collapse chevron */}
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}

                  {/* Folder icon */}
                  <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                  {/* Order number */}
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {module.order + 1}.
                  </span>

                  {/* Module title (inline editable) */}
                  <InlineEdit
                    value={module.title}
                    onSave={(newTitle) =>
                      handleModuleRename(module.id, newTitle)
                    }
                    className="flex-1 text-sm"
                  />

                  {/* Delete button (visible on hover) */}
                  {isModuleHovered && (
                    <button
                      onClick={(e) => handleDeleteModule(e, module.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete module"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Lessons (visible when module is expanded) */}
                {isExpanded && (
                  <div className="ms-4 mt-0.5 border-s border-border ps-2">
                    {module.lessons.map((lesson) => {
                      const isSelected =
                        selectedModuleId === module.id &&
                        selectedLessonId === lesson.id;
                      const isLessonHovered = hoveredLessonId === lesson.id;

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors',
                            'hover:bg-muted cursor-pointer',
                            isSelected && 'bg-primary/10 text-primary',
                          )}
                          onClick={() =>
                            handleLessonClick(module.id, lesson.id)
                          }
                          onMouseEnter={() => setHoveredLessonId(lesson.id)}
                          onMouseLeave={() => setHoveredLessonId(null)}
                        >
                          {/* Lesson icon */}
                          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                          {/* Order number */}
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {lesson.order + 1}.
                          </span>

                          {/* Lesson title (inline editable) */}
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

                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}

                          {/* Delete button (visible on hover) */}
                          {isLessonHovered && (
                            <button
                              onClick={(e) =>
                                handleDeleteLesson(e, module.id, lesson.id)
                              }
                              className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Delete lesson"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Lesson button */}
                    <button
                      onClick={() => handleAddLesson(module.id)}
                      className="mt-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
