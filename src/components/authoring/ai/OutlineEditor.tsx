'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { BlockType, type CourseOutline } from '@/types/authoring';

interface OutlineEditorProps {
  outline: CourseOutline;
  onApprove: (outline: CourseOutline) => void;
  onBack: () => void;
}

export function OutlineEditor({
  outline: initialOutline,
  onApprove,
  onBack,
}: OutlineEditorProps) {
  const [outline, setOutline] = useState<CourseOutline>(
    structuredClone(initialOutline)
  );
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

  const updateModuleTitle = (moduleIndex: number, title: string) => {
    setOutline((prev) => {
      const next = structuredClone(prev);
      next.modules[moduleIndex].title = title;
      return next;
    });
  };

  const updateLessonTitle = (
    moduleIndex: number,
    lessonIndex: number,
    title: string
  ) => {
    setOutline((prev) => {
      const next = structuredClone(prev);
      next.modules[moduleIndex].lessons[lessonIndex].title = title;
      return next;
    });
  };

  const addModule = () => {
    setOutline((prev) => {
      const next = structuredClone(prev);
      const newIndex = next.modules.length;
      next.modules.push({
        title: `Module ${newIndex + 1}`,
        description: '',
        order: newIndex,
        lessons: [
          {
            title: 'New Lesson',
            description: '',
            order: 0,
            suggested_blocks: [BlockType.TEXT, BlockType.ACCORDION, BlockType.MULTIPLE_CHOICE],
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
      return next;
    });
  };

  const deleteModule = (moduleIndex: number) => {
    if (outline.modules.length <= 1) return;
    setOutline((prev) => {
      const next = structuredClone(prev);
      next.modules.splice(moduleIndex, 1);
      next.modules.forEach((m, i) => (m.order = i));
      return next;
    });
  };

  const addLesson = (moduleIndex: number) => {
    setOutline((prev) => {
      const next = structuredClone(prev);
      const lessons = next.modules[moduleIndex].lessons;
      lessons.push({
        title: `New Lesson`,
        description: '',
        order: lessons.length,
        suggested_blocks: [BlockType.TEXT, BlockType.ACCORDION, BlockType.MULTIPLE_CHOICE],
        estimated_duration_minutes: 10,
        topics: [],
      });
      return next;
    });
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    if (outline.modules[moduleIndex].lessons.length <= 1) return;
    setOutline((prev) => {
      const next = structuredClone(prev);
      next.modules[moduleIndex].lessons.splice(lessonIndex, 1);
      next.modules[moduleIndex].lessons.forEach((l, i) => (l.order = i));
      return next;
    });
  };

  const moveModule = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= outline.modules.length) return;
    setOutline((prev) => {
      const next = structuredClone(prev);
      const [moved] = next.modules.splice(from, 1);
      next.modules.splice(to, 0, moved);
      next.modules.forEach((m, i) => (m.order = i));
      return next;
    });
  };

  const totalLessons = outline.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Course header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Review Course Outline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={outline.title}
            onChange={(e) =>
              setOutline((prev) => ({ ...prev, title: e.target.value }))
            }
            className="text-lg font-semibold"
          />
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {outline.modules.length} Modules
            </Badge>
            <Badge variant="secondary">{totalLessons} Lessons</Badge>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              ~{outline.estimated_duration_minutes} min
            </Badge>
            <Badge variant="outline">{outline.difficulty}</Badge>
            <Badge variant="outline">
              {outline.language === 'ar' ? 'Arabic' : 'English'}
            </Badge>
          </div>

          {outline.learning_outcomes?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Learning Outcomes:
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {outline.learning_outcomes.map((lo, i) => (
                  <li key={i}>- {lo}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module list */}
      <div className="space-y-3">
        {outline.modules.map((module, mi) => (
          <Card key={mi} className="overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleModule(mi)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              {expandedModules.has(mi) ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <Input
                value={module.title}
                onChange={(e) => updateModuleTitle(mi, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="h-7 text-sm font-medium border-transparent hover:border-input focus:border-input bg-transparent"
              />
              <Badge variant="secondary" className="shrink-0 text-xs">
                {module.lessons.length} lessons
              </Badge>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveModule(mi, -1);
                  }}
                  disabled={mi === 0}
                  aria-label="Move module up"
                >
                  <ChevronRight className="h-3 w-3 -rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveModule(mi, 1);
                  }}
                  disabled={mi === outline.modules.length - 1}
                  aria-label="Move module down"
                >
                  <ChevronRight className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteModule(mi);
                  }}
                  disabled={outline.modules.length <= 1}
                  aria-label="Delete module"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {expandedModules.has(mi) && (
              <CardContent className="pt-3 space-y-2">
                {module.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="flex items-center gap-2 pl-6 py-1 group"
                  >
                    <span className="text-xs text-muted-foreground w-5 shrink-0">
                      {li + 1}.
                    </span>
                    <Input
                      value={lesson.title}
                      onChange={(e) =>
                        updateLessonTitle(mi, li, e.target.value)
                      }
                      className="h-7 text-sm border-transparent hover:border-input focus:border-input"
                    />
                    <span className="text-xs text-muted-foreground shrink-0">
                      ~{lesson.estimated_duration_minutes}m
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive shrink-0"
                      onClick={() => deleteLesson(mi, li)}
                      disabled={module.lessons.length <= 1}
                      aria-label="Delete lesson"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-6 text-xs"
                  onClick={() => addLesson(mi)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Lesson
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        <Button variant="outline" className="w-full" onClick={addModule}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <Button onClick={() => onApprove(outline)}>
          Approve & Generate Content
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
