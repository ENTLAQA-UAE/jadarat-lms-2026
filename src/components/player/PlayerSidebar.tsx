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
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CertificateButton from '@/components/shared/CertificateButton';
import type { Module } from '@/types/authoring';
import type { BlockProgress } from './CoursePlayer';

export type LessonStatus = 'completed' | 'current' | 'upcoming' | 'locked';

interface PlayerSidebarProps {
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
  isSequential: boolean;
  isLessonAccessible: (moduleIndex: number, lessonIndex: number) => boolean;
}

export function PlayerSidebar({
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
  isSequential,
  isLessonAccessible,
}: PlayerSidebarProps) {
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

  const getLessonStatus = (
    moduleIndex: number,
    lessonIndex: number
  ): LessonStatus => {
    const isCurrent =
      moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
    if (isCurrent) return 'current';
    if (isLessonComplete(moduleIndex, lessonIndex)) return 'completed';
    if (isSequential && !isLessonAccessible(moduleIndex, lessonIndex))
      return 'locked';
    return 'upcoming';
  };

  const handleLessonClick = (moduleIndex: number, lessonIndex: number) => {
    const status = getLessonStatus(moduleIndex, lessonIndex);
    if (status === 'locked') return;
    onNavigate(moduleIndex, lessonIndex);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--player-font)' }}>
      {/* Header with course name */}
      <div className="p-4 border-b">
        <h2
          className="text-sm font-semibold truncate leading-tight"
          style={{ color: 'var(--player-text)' }}
        >
          {courseName}
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: 'var(--player-primary)',
              }}
            />
          </div>
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: overallProgress === 100 ? 'var(--player-primary)' : undefined }}
          >
            {overallProgress}%
          </span>
        </div>
      </div>

      {/* Module/Lesson tree */}
      <ScrollArea className="flex-1">
        <nav className="p-2" aria-label="Course navigation">
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
                    'w-full flex items-center gap-2 p-2 rounded-md text-sm font-medium text-start transition-colors',
                    'hover:bg-accent/50'
                  )}
                  style={{
                    borderRadius: 'var(--player-radius)',
                    ...(moduleComplete ? { color: 'var(--player-primary)' } : {}),
                  }}
                  onClick={() => toggleModule(moduleIndex)}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  {moduleComplete ? (
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--player-primary)' }}
                    />
                  ) : (
                    <Circle className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{module.title}</span>
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="ms-6 border-s ps-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const status = getLessonStatus(moduleIndex, lessonIndex);
                      const progress = getLessonProgress(moduleIndex, lessonIndex);

                      return (
                        <button
                          key={lesson.id}
                          disabled={status === 'locked'}
                          className={cn(
                            'w-full flex items-center gap-2 p-2 rounded-md text-sm text-start transition-colors',
                            status === 'current' && 'font-medium',
                            status === 'locked' && 'opacity-50 cursor-not-allowed',
                            status !== 'locked' && status !== 'current' && 'hover:bg-accent/50'
                          )}
                          style={{
                            borderRadius: 'var(--player-radius)',
                            ...(status === 'current'
                              ? {
                                  backgroundColor: `${modules ? 'var(--player-primary)' : ''}1a`,
                                  color: 'var(--player-primary)',
                                }
                              : {}),
                            ...(status === 'completed'
                              ? { color: 'var(--player-primary)' }
                              : {}),
                          }}
                          onClick={() => handleLessonClick(moduleIndex, lessonIndex)}
                          aria-current={status === 'current' ? 'step' : undefined}
                        >
                          {/* Status icon */}
                          {status === 'completed' && (
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: 'var(--player-primary)' }}
                            />
                          )}
                          {status === 'current' && (
                            <div
                              className="w-3.5 h-3.5 shrink-0 rounded-full border-2 flex items-center justify-center"
                              style={{ borderColor: 'var(--player-primary)' }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: 'var(--player-primary)' }}
                              />
                            </div>
                          )}
                          {status === 'upcoming' && (
                            <Circle className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          )}
                          {status === 'locked' && (
                            <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          )}

                          <span className="truncate flex-1">{lesson.title}</span>

                          {/* Progress percentage for in-progress lessons */}
                          {status !== 'completed' &&
                            status !== 'locked' &&
                            progress > 0 && (
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
        </nav>
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
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[300px] flex-col bg-card border-e h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 start-4 z-50 md:hidden rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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
          <aside className="fixed inset-y-0 start-0 w-[300px] flex flex-col bg-card z-50 md:hidden shadow-xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
