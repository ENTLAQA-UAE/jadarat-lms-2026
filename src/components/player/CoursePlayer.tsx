'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PlayerHeader } from './PlayerHeader';
import { PlayerSidebar } from './PlayerSidebar';
import { LessonRenderer } from './LessonRenderer';
import { getThemeCSSVars } from './theme-utils';
import type { CourseContent, Block } from '@/types/authoring';

export interface BlockProgress {
  block_id: string;
  completed: boolean;
  score: number | null;
  response_data: Record<string, unknown> | null;
}

interface CoursePlayerProps {
  courseId: number;
  content: CourseContent;
  userId: string;
  userName: string;
  courseName: string;
  initialProgress: BlockProgress[];
}

export function CoursePlayer({
  courseId,
  content,
  userId,
  userName,
  courseName,
  initialProgress,
}: CoursePlayerProps) {
  const router = useRouter();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [blockProgress, setBlockProgress] = useState<Map<string, BlockProgress>>(
    () => new Map(initialProgress.map((p) => [p.block_id, p]))
  );
  const [showCertificate, setShowCertificate] = useState(false);

  const currentModule = content.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  const isSequential = content.settings.navigation === 'sequential';

  // Calculate overall progress
  const totalBlocks = content.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.blocks.length, 0),
    0
  );
  const completedBlocks = Array.from(blockProgress.values()).filter(
    (p) => p.completed
  ).length;
  const overallProgress =
    totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // Detect 100% completion
  useEffect(() => {
    if (overallProgress === 100 && !showCertificate) {
      setShowCertificate(true);
    }
  }, [overallProgress, showCertificate]);

  // Check if a specific lesson is complete
  const isLessonComplete = useCallback(
    (moduleIndex: number, lessonIndex: number): boolean => {
      const lesson = content.modules[moduleIndex]?.lessons[lessonIndex];
      if (!lesson || lesson.blocks.length === 0) return true;
      return lesson.blocks.every(
        (block) => blockProgress.get(block.id)?.completed
      );
    },
    [content.modules, blockProgress]
  );

  // Sequential navigation: a lesson is accessible if free mode or if all
  // previous lessons in order are complete.
  const isLessonAccessible = useCallback(
    (moduleIndex: number, lessonIndex: number): boolean => {
      if (!isSequential) return true;

      // First lesson is always accessible
      if (moduleIndex === 0 && lessonIndex === 0) return true;

      // Check all lessons before this one
      for (let mi = 0; mi <= moduleIndex; mi++) {
        const mod = content.modules[mi];
        const maxLi = mi < moduleIndex ? mod.lessons.length : lessonIndex;
        for (let li = 0; li < maxLi; li++) {
          if (!isLessonComplete(mi, li)) return false;
        }
      }
      return true;
    },
    [isSequential, content.modules, isLessonComplete]
  );

  const handleBlockComplete = useCallback(
    async (
      block: Block,
      moduleId: string,
      lessonId: string,
      score?: number,
      responseData?: Record<string, unknown>
    ) => {
      // Update local state
      setBlockProgress((prev) => {
        const next = new Map(prev);
        next.set(block.id, {
          block_id: block.id,
          completed: true,
          score: score ?? null,
          response_data: responseData ?? null,
        });
        return next;
      });

      // Persist to database
      const supabase = createClient();
      await supabase.rpc('update_block_progress', {
        p_user_id: userId,
        p_course_id: courseId,
        p_module_id: moduleId,
        p_lesson_id: lessonId,
        p_block_id: block.id,
        p_block_type: block.type,
        p_completed: true,
        p_score: score ?? null,
        p_response_data: responseData ?? null,
        p_time_spent: 0,
      });
    },
    [courseId, userId]
  );

  const navigateToLesson = useCallback(
    (moduleIndex: number, lessonIndex: number) => {
      // Enforce sequential navigation
      if (isSequential && !isLessonAccessible(moduleIndex, lessonIndex)) return;

      setCurrentModuleIndex(moduleIndex);
      setCurrentLessonIndex(lessonIndex);
      // Scroll the main content area to top
      document
        .getElementById('player-content')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [isSequential, isLessonAccessible]
  );

  const goToNextLesson = useCallback(() => {
    if (!currentModule) return;
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      navigateToLesson(currentModuleIndex, currentLessonIndex + 1);
    } else if (currentModuleIndex < content.modules.length - 1) {
      navigateToLesson(currentModuleIndex + 1, 0);
    }
  }, [
    currentModule,
    currentModuleIndex,
    currentLessonIndex,
    content.modules.length,
    navigateToLesson,
  ]);

  const goToPreviousLesson = useCallback(() => {
    if (currentLessonIndex > 0) {
      navigateToLesson(currentModuleIndex, currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = content.modules[currentModuleIndex - 1];
      navigateToLesson(currentModuleIndex - 1, prevModule.lessons.length - 1);
    }
  }, [currentModuleIndex, currentLessonIndex, content.modules, navigateToLesson]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No content available
      </div>
    );
  }

  const isFirstLesson = currentModuleIndex === 0 && currentLessonIndex === 0;
  const isLastLesson =
    currentModuleIndex === content.modules.length - 1 &&
    currentLessonIndex === currentModule.lessons.length - 1;

  return (
    <div
      className="flex flex-col h-screen"
      dir={content.settings.direction}
      style={getThemeCSSVars(content.settings.theme)}
    >
      {/* Top header bar */}
      <PlayerHeader
        courseName={courseName}
        moduleTitle={currentModule.title}
        lessonTitle={currentLesson.title}
        overallProgress={overallProgress}
        direction={content.settings.direction}
        onClose={handleClose}
      />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <PlayerSidebar
          modules={content.modules}
          currentModuleIndex={currentModuleIndex}
          currentLessonIndex={currentLessonIndex}
          blockProgress={blockProgress}
          overallProgress={overallProgress}
          onNavigate={navigateToLesson}
          courseId={courseId}
          userId={userId}
          courseName={courseName}
          userName={userName}
          showCertificate={showCertificate}
          isSequential={isSequential}
          isLessonAccessible={isLessonAccessible}
        />

        <main
          id="player-content"
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: 'var(--player-bg)' }}
        >
          <div className="max-w-3xl mx-auto p-6">
            <LessonRenderer
              lesson={currentLesson}
              moduleId={currentModule.id}
              blockProgress={blockProgress}
              onBlockComplete={(block, score, responseData) =>
                handleBlockComplete(
                  block,
                  currentModule.id,
                  currentLesson.id,
                  score,
                  responseData
                )
              }
              onNextLesson={goToNextLesson}
              onPreviousLesson={goToPreviousLesson}
              isFirstLesson={isFirstLesson}
              isLastLesson={isLastLesson}
              theme={content.settings.theme}
              direction={content.settings.direction}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
