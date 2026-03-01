'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CertificateButton from '@/components/shared/CertificateButton';
import type { Module } from '@/types/authoring';
import type { BlockProgress } from './CoursePlayer';

interface ProgressSidebarProps {
  modules: Module[];
  currentModuleIndex: number;
  currentLessonIndex: number;
  blockProgress: Map<string, BlockProgress>;
  overallProgress: number;
  onNavigate: (moduleIndex: number, lessonIndex: number) => void;
  courseId: number;
  userId: string;
  courseName: string;
  userName: string;
  showCertificate: boolean;
}

export function ProgressSidebar({
  modules,
  currentModuleIndex,
  currentLessonIndex,
  blockProgress,
  overallProgress,
  onNavigate,
  courseId,
  userId,
  courseName,
  userName,
  showCertificate,
}: ProgressSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    () => new Set([currentModuleIndex])
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const isLessonComplete = (moduleIndex: number, lessonIndex: number) => {
    const lesson = modules[moduleIndex]?.lessons[lessonIndex];
    if (!lesson || lesson.blocks.length === 0) return false;
    return lesson.blocks.every((block) => blockProgress.get(block.id)?.completed);
  };

  const getLessonProgress = (moduleIndex: number, lessonIndex: number) => {
    const lesson = modules[moduleIndex]?.lessons[lessonIndex];
    if (!lesson || lesson.blocks.length === 0) return 0;
    const completed = lesson.blocks.filter(
      (block) => blockProgress.get(block.id)?.completed
    ).length;
    return Math.round((completed / lesson.blocks.length) * 100);
  };

  const sidebarContent = (
    <>
      {/* Back button */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Overall progress */}
      <div className="p-4 border-b">
        <div className="text-xs text-muted-foreground mb-1">Overall Progress</div>
        <div className="flex items-center gap-2">
          <Progress value={overallProgress} className="flex-1" />
          <span className="text-sm font-medium">{overallProgress}%</span>
        </div>
      </div>

      {/* Module/Lesson tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(moduleIndex);
            const moduleComplete = module.lessons.every((_, lessonIndex) =>
              isLessonComplete(moduleIndex, lessonIndex)
            );

            return (
              <div key={module.id} className="mb-1">
                {/* Module header */}
                <button
                  className={cn(
                    'w-full flex items-center gap-2 p-2 rounded-md text-sm font-medium text-start hover:bg-accent/50 transition-colors',
                    moduleComplete && 'text-green-600'
                  )}
                  onClick={() => toggleModule(moduleIndex)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  {moduleComplete ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{module.title}</span>
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="ms-6 border-s ps-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCurrent =
                        moduleIndex === currentModuleIndex &&
                        lessonIndex === currentLessonIndex;
                      const complete = isLessonComplete(moduleIndex, lessonIndex);
                      const progress = getLessonProgress(moduleIndex, lessonIndex);

                      return (
                        <button
                          key={lesson.id}
                          className={cn(
                            'w-full flex items-center gap-2 p-2 rounded-md text-sm text-start transition-colors',
                            isCurrent
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-accent/50',
                            complete && !isCurrent && 'text-green-600'
                          )}
                          onClick={() => {
                            onNavigate(moduleIndex, lessonIndex);
                            setMobileOpen(false);
                          }}
                        >
                          {complete ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate flex-1">{lesson.title}</span>
                          {!complete && progress > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {progress}%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Certificate section */}
      {showCertificate && (
        <div className="p-4 border-t space-y-2">
          <CertificateButton
            selectedCourse={{
              id: courseId,
              learnerId: userId,
              courseName,
              learnerName: userName,
            }}
            variant="download"
            disabled={false}
          />
          <CertificateButton
            selectedCourse={{
              id: courseId,
              learnerId: userId,
              courseName,
              learnerName: userName,
            }}
            variant="share"
            disabled={false}
          />
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[300px] flex-col bg-muted border-e h-full">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 start-4 z-50 md:hidden rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 start-0 w-[300px] flex flex-col bg-muted z-50 md:hidden shadow-xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
