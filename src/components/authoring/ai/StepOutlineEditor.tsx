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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { BlockType } from '@/types/authoring';
import type {
  CourseOutline,
  CourseOutlineLesson,
  CourseOutlineModule,
} from '@/types/authoring';
import { cn } from '@/lib/utils';

interface StepOutlineEditorProps {
  outline: CourseOutline;
  onChange: (outline: CourseOutline) => void;
  onNext: () => void;
  onBack: () => void;
}

type Selection =
  | { type: 'module'; moduleIndex: number }
  | { type: 'lesson'; moduleIndex: number; lessonIndex: number };

export function StepOutlineEditor({
  outline,
  onChange,
  onNext,
  onBack,
}: StepOutlineEditorProps) {
  const [selection, setSelection] = useState<Selection>({
    type: 'lesson',
    moduleIndex: 0,
    lessonIndex: 0,
  });
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(outline.modules.map((_, i) => i))
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectModule = (moduleIndex: number) => {
    setSelection({ type: 'module', moduleIndex });
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    setSelection({ type: 'lesson', moduleIndex, lessonIndex });
  };

  const selectedModuleIndex = selection.moduleIndex;
  const selectedLessonIndex =
    selection.type === 'lesson' ? selection.lessonIndex : -1;

  const selectedModule: CourseOutlineModule | null =
    outline.modules[selectedModuleIndex] ?? null;
  const selectedLesson: CourseOutlineLesson | null =
    selection.type === 'lesson'
      ? outline.modules[selectedModuleIndex]?.lessons[selectedLessonIndex] ??
        null
      : null;

  // ── Mutation helpers ─────────────────────────────────────

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

  const updateModuleDescription = (mi: number, description: string) => {
    updateOutline((d) => {
      d.modules[mi].description = description;
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
      setSelection({ type: 'module', moduleIndex: newIndex });
    });
  };

  const deleteModule = (mi: number) => {
    if (outline.modules.length <= 1) return;
    updateOutline((d) => {
      d.modules.splice(mi, 1);
      d.modules.forEach((m, i) => (m.order = i));
    });
    const newMi = Math.max(0, mi - 1);
    setSelection({ type: 'module', moduleIndex: newMi });
  };

  const addBlankLesson = (mi: number) => {
    updateOutline((d) => {
      const lessons = d.modules[mi].lessons;
      const newLi = lessons.length;
      lessons.push({
        title: 'New Lesson',
        description: '',
        order: newLi,
        suggested_blocks: [
          BlockType.TEXT,
          BlockType.ACCORDION,
          BlockType.MULTIPLE_CHOICE,
        ],
        estimated_duration_minutes: 10,
        topics: [],
      });
    });
    setSelection({
      type: 'lesson',
      moduleIndex: mi,
      lessonIndex: outline.modules[mi].lessons.length,
    });
  };

  const addAILesson = async (mi: number) => {
    // For now, add a blank lesson with a placeholder — AI generation will be wired later
    addBlankLesson(mi);
    toast.info('AI lesson generation coming soon', {
      description:
        'For now, a blank lesson was added. You can edit it manually.',
    });
  };

  const deleteLesson = (mi: number, li: number) => {
    if (outline.modules[mi].lessons.length <= 1) return;
    updateOutline((d) => {
      d.modules[mi].lessons.splice(li, 1);
      d.modules[mi].lessons.forEach((l, i) => (l.order = i));
    });
    const newLi = Math.max(0, li - 1);
    setSelection({ type: 'lesson', moduleIndex: mi, lessonIndex: newLi });
  };

  // ── PDF Export ───────────────────────────────────────────

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const content = buildExportContent(outline);
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Open in new window and trigger print (save as PDF)
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast.success('PDF export ready', {
        description: 'Use your browser print dialog to save as PDF.',
      });
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Computed values ──────────────────────────────────────

  const totalLessons = outline.modules.reduce(
    (s, m) => s + m.lessons.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Your course is coming together!
          </h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve organized your content into a course outline. Edit and
            refine it before generating lessons.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportPDF} disabled={isExporting}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit with AI dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Edit with AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Restructure outline (coming soon)
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Add more detail (coming soon)
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Simplify outline (coming soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{outline.modules.length} Modules</Badge>
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
        {/* ── LEFT SIDEBAR — Module/Lesson tree ── */}
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
                <div key={mi} className="group/module">
                  {/* Module header */}
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 border-b cursor-pointer transition-colors',
                      selection.type === 'module' &&
                        selectedModuleIndex === mi
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'bg-muted/30 hover:bg-muted/50'
                    )}
                    onClick={() => {
                      toggleModule(mi);
                      selectModule(mi);
                    }}
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
                      className="h-5 w-5 shrink-0 text-destructive opacity-0 group-hover/module:opacity-100"
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
                          selection.type === 'lesson' &&
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

                      {/* Add lesson options */}
                      <div className="flex items-center border-b">
                        <button
                          type="button"
                          onClick={() => addBlankLesson(mi)}
                          className="flex-1 flex items-center gap-1 px-4 pl-8 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Blank lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => addAILesson(mi)}
                          className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-colors border-s"
                        >
                          <Sparkles className="h-3 w-3" />
                          Add with AI
                        </button>
                      </div>
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

        {/* ── RIGHT PANEL — Selected item details ── */}
        <Card>
          <CardContent className="pt-6">
            {/* Module detail view */}
            {selection.type === 'module' && selectedModule ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Module Details
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        Edit with AI
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Expand module (coming soon)
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Add lessons with AI (coming soon)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Module title */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Module Title
                  </Label>
                  <Input
                    value={selectedModule.title}
                    onChange={(e) =>
                      updateModuleTitle(selectedModuleIndex, e.target.value)
                    }
                    className="text-base font-medium"
                  />
                </div>

                {/* Module description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {(selectedModule.description || '').length}/300
                    </span>
                  </div>
                  <Textarea
                    value={selectedModule.description}
                    onChange={(e) =>
                      updateModuleDescription(
                        selectedModuleIndex,
                        e.target.value
                      )
                    }
                    rows={4}
                    className="resize-none text-sm"
                    placeholder="Brief description of what this module covers..."
                    maxLength={300}
                  />
                </div>

                {/* Module stats */}
                <div className="flex gap-3 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {selectedModule.lessons.length}
                    </span>{' '}
                    lessons
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {selectedModule.lessons.reduce(
                        (s, l) => s + l.estimated_duration_minutes,
                        0
                      )}
                    </span>{' '}
                    min total
                  </div>
                </div>

                {/* Delete module */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive text-xs"
                    onClick={() => deleteModule(selectedModuleIndex)}
                    disabled={outline.modules.length <= 1}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete this module
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Lesson detail view */}
            {selection.type === 'lesson' && selectedLesson ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Lesson Details
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        Edit with AI
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Rewrite description (coming soon)
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Suggest topics (coming soon)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

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
            ) : null}

            {/* Empty state */}
            {!selectedModule && !selectedLesson && (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Select a module or lesson from the outline to edit its details.
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

// ══════════════════════════════════════════════════════════════
// Internal Label component
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// PDF Export — builds an HTML document for browser print-to-PDF
// ══════════════════════════════════════════════════════════════

function buildExportContent(outline: CourseOutline): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modulesHTML = outline.modules
    .map(
      (mod, mi) => `
    <div class="module">
      <h2>Module ${mi + 1}: ${escapeHtml(mod.title)}</h2>
      ${mod.description ? `<p class="desc">${escapeHtml(mod.description)}</p>` : ''}
      ${mod.lessons
        .map(
          (les, li) => `
        <div class="lesson">
          <h3>Lesson ${mi + 1}.${li + 1}: ${escapeHtml(les.title)}</h3>
          ${les.description ? `<p class="desc">${escapeHtml(les.description)}</p>` : ''}
          ${les.estimated_duration_minutes ? `<p class="meta">Duration: ~${les.estimated_duration_minutes} minutes</p>` : ''}
          ${
            les.topics && les.topics.length > 0
              ? `<ul>${les.topics.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
              : ''
          }
        </div>`
        )
        .join('')}
    </div>`
    )
    .join('');

  const objectivesHTML =
    outline.learning_outcomes && outline.learning_outcomes.length > 0
      ? `<div class="section"><h2>Learning Objectives</h2><ol>${outline.learning_outcomes.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ol></div>`
      : '';

  return `<!DOCTYPE html>
<html lang="${outline.language}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(outline.title)} — Course Outline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #111827; }
    h2 { font-size: 18px; margin: 24px 0 8px; color: #1a73e8; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    h3 { font-size: 15px; margin: 16px 0 4px; color: #374151; }
    .meta-header { display: flex; gap: 16px; flex-wrap: wrap; margin: 8px 0 16px; color: #6b7280; font-size: 13px; }
    .meta-header span { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; }
    .desc { color: #4b5563; margin: 4px 0 8px; }
    .meta { color: #6b7280; font-size: 13px; font-style: italic; }
    .module { margin-bottom: 24px; }
    .lesson { margin-left: 20px; margin-bottom: 12px; }
    ul, ol { margin: 8px 0 8px 24px; }
    li { margin-bottom: 2px; }
    .section { margin-bottom: 24px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
    @media print { body { padding: 20px; } .footer { position: fixed; bottom: 20px; left: 0; right: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(outline.title)}</h1>
  ${outline.description ? `<p class="desc">${escapeHtml(outline.description)}</p>` : ''}
  <div class="meta-header">
    <span>Language: ${outline.language === 'ar' ? 'Arabic' : 'English'}</span>
    <span>Difficulty: ${outline.difficulty}</span>
    <span>Duration: ~${outline.estimated_duration_minutes} min</span>
    <span>${outline.modules.length} modules, ${outline.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons</span>
  </div>
  ${objectivesHTML}
  ${modulesHTML}
  <div class="footer">Generated by Jadarat LMS AI &mdash; ${today}</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
