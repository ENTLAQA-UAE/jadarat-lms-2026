'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ProgressSidebar } from './ProgressSidebar';
import { LessonRenderer } from './LessonRenderer';
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
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [blockProgress, setBlockProgress] = useState<Map<string, BlockProgress>>(
    () => new Map(initialProgress.map((p) => [p.block_id, p]))
  );
  const [showCertificate, setShowCertificate] = useState(false);

  const currentModule = content.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

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
      setCurrentModuleIndex(moduleIndex);
      setCurrentLessonIndex(lessonIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
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
    <div className="flex h-full" dir={content.settings.direction}>
      <ProgressSidebar
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
      />

      <main className="flex-1 overflow-y-auto bg-background">
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
  );
}
