'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { BlockType } from '@/types/authoring';
import type { CourseOutline, CourseOutlineLesson } from '@/types/authoring';
import { cn } from '@/lib/utils';

interface StepOutlineEditorProps {
  outline: CourseOutline;
  onChange: (outline: CourseOutline) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepOutlineEditor({
  outline,
  onChange,
  onNext,
  onBack,
}: StepOutlineEditorProps) {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(outline.modules.map((_, i) => i))
  );

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    setSelectedModuleIndex(moduleIndex);
    setSelectedLessonIndex(lessonIndex);
  };

  const selectedLesson: CourseOutlineLesson | null =
    outline.modules[selectedModuleIndex]?.lessons[selectedLessonIndex] ?? null;

  // Mutation helpers
  const updateOutline = (mutator: (draft: CourseOutline) => void) => {
    const draft = structuredClone(outline);
    mutator(draft);
    onChange(draft);
  };

  const updateModuleTitle = (mi: number, title: string) => {
    updateOutline((d) => {
      d.modules[mi].title = title;
    });
  };

  const updateLessonField = <K extends keyof CourseOutlineLesson>(
    mi: number,
    li: number,
    field: K,
    value: CourseOutlineLesson[K]
  ) => {
    updateOutline((d) => {
      d.modules[mi].lessons[li][field] = value;
    });
  };

  const updateLessonTopic = (
    mi: number,
    li: number,
    topicIndex: number,
    value: string
  ) => {
    updateOutline((d) => {
      d.modules[mi].lessons[li].topics[topicIndex] = value;
    });
  };

  const addLessonTopic = (mi: number, li: number) => {
    updateOutline((d) => {
      if (!d.modules[mi].lessons[li].topics) {
        d.modules[mi].lessons[li].topics = [];
      }
      d.modules[mi].lessons[li].topics.push('');
    });
  };

  const deleteLessonTopic = (mi: number, li: number, topicIndex: number) => {
    updateOutline((d) => {
      d.modules[mi].lessons[li].topics.splice(topicIndex, 1);
    });
  };

  const addModule = () => {
    updateOutline((d) => {
      const newIndex = d.modules.length;
      d.modules.push({
        title: `Module ${newIndex + 1}`,
        description: '',
        order: newIndex,
        lessons: [
          {
            title: 'New Lesson',
            description: '',
            order: 0,
            suggested_blocks: [
              BlockType.TEXT,
              BlockType.ACCORDION,
              BlockType.MULTIPLE_CHOICE,
            ],
            estimated_duration_minutes: 10,
            topics: [],
          },
        ],
      });
      setExpandedModules((prev) => {
        const next = new Set(prev);
        next.add(newIndex);
        return next;
      });
      setSelectedModuleIndex(newIndex);
      setSelectedLessonIndex(0);
    });
  };

  const deleteModule = (mi: number) => {
    if (outline.modules.length <= 1) return;
    updateOutline((d) => {
      d.modules.splice(mi, 1);
      d.modules.forEach((m, i) => (m.order = i));
    });
    if (selectedModuleIndex >= outline.modules.length - 1) {
      setSelectedModuleIndex(Math.max(0, outline.modules.length - 2));
      setSelectedLessonIndex(0);
    }
  };

  const addLesson = (mi: number) => {
    updateOutline((d) => {
      const lessons = d.modules[mi].lessons;
      lessons.push({
        title: 'New Lesson',
        description: '',
        order: lessons.length,
        suggested_blocks: [
          BlockType.TEXT,
          BlockType.ACCORDION,
          BlockType.MULTIPLE_CHOICE,
        ],
        estimated_duration_minutes: 10,
        topics: [],
      });
    });
  };

  const deleteLesson = (mi: number, li: number) => {
    if (outline.modules[mi].lessons.length <= 1) return;
    updateOutline((d) => {
      d.modules[mi].lessons.splice(li, 1);
      d.modules[mi].lessons.forEach((l, i) => (l.order = i));
    });
    if (
      selectedModuleIndex === mi &&
      selectedLessonIndex >= outline.modules[mi].lessons.length - 1
    ) {
      setSelectedLessonIndex(
        Math.max(0, outline.modules[mi].lessons.length - 2)
      );
    }
  };

  const totalLessons = outline.modules.reduce(
    (s, m) => s + m.lessons.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Your course is coming together!
          </h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve organized your content into a course outline. Edit and
            refine it before generating lessons.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
              Edit with AI
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <Sparkles className="h-4 w-4 mr-2" />
              Restructure outline (coming soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {outline.modules.length} Modules
        </Badge>
        <Badge variant="secondary">{totalLessons} Lessons</Badge>
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />~
          {outline.estimated_duration_minutes} min
        </Badge>
        <Badge variant="outline">{outline.difficulty}</Badge>
        <Badge variant="outline">
          {outline.language === 'ar' ? 'Arabic' : 'English'}
        </Badge>
      </div>

      {/* Split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[400px]">
        {/* LEFT SIDEBAR — Module/Lesson tree */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Outline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[450px] overflow-y-auto">
              {outline.modules.map((mod, mi) => (
                <div key={mi}>
                  {/* Module header */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 bg-muted/30 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleModule(mi)}
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    {expandedModules.has(mi) ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate flex-1">
                      {mod.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 shrink-0"
                    >
                      {mod.lessons.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 text-destructive opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule(mi);
                      }}
                      disabled={outline.modules.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Lessons within module */}
                  {expandedModules.has(mi) && (
                    <div>
                      {mod.lessons.map((les, li) => {
                        const isActive =
                          selectedModuleIndex === mi &&
                          selectedLessonIndex === li;
                        return (
                          <button
                            key={li}
                            type="button"
                            onClick={() => selectLesson(mi, li)}
                            className={cn(
                              'w-full flex items-center gap-2 px-4 pl-8 py-2 text-left text-xs border-b transition-colors',
                              isActive
                                ? 'bg-primary/5 text-primary border-l-2 border-l-primary'
                                : 'hover:bg-muted/30 text-foreground'
                            )}
                          >
                            <span className="truncate flex-1">
                              {les.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {les.estimated_duration_minutes}m
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => addLesson(mi)}
                        className="w-full flex items-center gap-1 px-4 pl-8 py-2 text-xs text-muted-foreground hover:text-primary transition-colors border-b"
                      >
                        <Plus className="h-3 w-3" />
                        Add lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add module */}
              <div className="p-3 space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={addModule}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add module
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT PANEL — Selected lesson details */}
        <Card>
          <CardContent className="pt-6">
            {selectedLesson ? (
              <div className="space-y-5">
                {/* Lesson title */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Lesson Title
                  </Label>
                  <Input
                    value={selectedLesson.title}
                    onChange={(e) =>
                      updateLessonField(
                        selectedModuleIndex,
                        selectedLessonIndex,
                        'title',
                        e.target.value
                      )
                    }
                    className="text-base font-medium"
                  />
                </div>

                {/* Lesson description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {(selectedLesson.description || '').length}/200
                    </span>
                  </div>
                  <Textarea
                    value={selectedLesson.description}
                    onChange={(e) =>
                      updateLessonField(
                        selectedModuleIndex,
                        selectedLessonIndex,
                        'description',
                        e.target.value
                      )
                    }
                    rows={3}
                    className="resize-none text-sm"
                    placeholder="Brief description of what this lesson covers..."
                    maxLength={200}
                  />
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Topics
                  </Label>
                  <div className="space-y-1.5">
                    {(selectedLesson.topics || []).map((topic, ti) => (
                      <div key={ti} className="flex items-center gap-2 group">
                        <span className="text-xs text-muted-foreground shrink-0">
                          &bull;
                        </span>
                        <Input
                          value={topic}
                          onChange={(e) =>
                            updateLessonTopic(
                              selectedModuleIndex,
                              selectedLessonIndex,
                              ti,
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                          placeholder="Key topic..."
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() =>
                            deleteLessonTopic(
                              selectedModuleIndex,
                              selectedLessonIndex,
                              ti
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        addLessonTopic(
                          selectedModuleIndex,
                          selectedLessonIndex
                        )
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add topic
                    </Button>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Estimated Duration (minutes)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={selectedLesson.estimated_duration_minutes}
                    onChange={(e) =>
                      updateLessonField(
                        selectedModuleIndex,
                        selectedLessonIndex,
                        'estimated_duration_minutes',
                        parseInt(e.target.value) || 10
                      )
                    }
                    className="h-9 w-24"
                  />
                </div>

                {/* Delete lesson */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive text-xs"
                    onClick={() =>
                      deleteLesson(selectedModuleIndex, selectedLessonIndex)
                    }
                    disabled={
                      outline.modules[selectedModuleIndex].lessons.length <= 1
                    }
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete this lesson
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Select a lesson from the outline to edit its details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Content options
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Re-exported for the Input label reference
function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-sm font-medium', className)} {...props}>
      {children}
    </label>
  );
}
