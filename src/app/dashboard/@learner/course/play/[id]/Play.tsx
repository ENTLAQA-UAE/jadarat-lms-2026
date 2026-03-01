'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CoursePlayer } from '@/components/player/CoursePlayer';
import type { CourseContent } from '@/types/authoring';
import type { BlockProgress } from '@/components/player/CoursePlayer';
import { Loader2 } from 'lucide-react';

/**
 * Course Player Page
 *
 * Routes learners to the correct player based on course type:
 * - SCORM courses -> redirect to /dashboard/course/scorm-player/{slug}
 * - Native courses -> render CoursePlayer with block-based content
 */

interface CourseData {
  id: number;
  title: string;
  authoring_type: string;
  is_scorm: boolean;
  slug: string;
  content: CourseContent | null;
}

export default function CourseViewer({ params }: { params: { id: string } }) {
  const router = useRouter();
  const {
    courses,
    user: { id: userId, name },
  } = useAppSelector((state) => state.user);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [initialProgress, setInitialProgress] = useState<BlockProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCourse = courses.find((e) => e.slug === params.id);

  // Route SCORM courses to the SCORM player immediately
  useEffect(() => {
    if (selectedCourse?.isscorm) {
      router.replace(`/dashboard/course/scorm-player/${selectedCourse.slug}`);
    }
  }, [selectedCourse, router]);

  // Load native course content
  useEffect(() => {
    if (selectedCourse?.isscorm) return;
    if (!selectedCourse?.course_id || !userId) return;

    const load = async () => {
      const supabase = createClient();

      // Get course with content
      const { data } = await supabase.rpc('get_course_with_content', {
        p_course_id: selectedCourse.course_id,
      });
      const course = Array.isArray(data) ? data[0] : data;

      if (!course) {
        setLoading(false);
        return;
      }

      setCourseData(course as CourseData);

      // Load block progress for native courses
      if (course.authoring_type === 'native' && course.content) {
        const { data: progressData } = await supabase.rpc(
          'get_learner_course_progress',
          {
            p_user_id: userId,
            p_course_id: course.id,
          }
        );
        setInitialProgress(
          (progressData || []).map((p: Record<string, unknown>) => ({
            block_id: p.block_id as string,
            completed: p.completed as boolean,
            score: (p.score as number) ?? null,
            response_data: (p.response_data as Record<string, unknown>) ?? null,
          }))
        );
      }

      setLoading(false);
    };

    load();
  }, [selectedCourse, userId]);

  // If SCORM, show loading while redirecting
  if (selectedCourse?.isscorm) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No content available
  if (!courseData?.content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">No Content</h2>
          <p className="text-muted-foreground">
            This course has no content yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Native course player
  return (
    <div className="h-screen w-full">
      <CoursePlayer
        courseId={courseData.id}
        content={courseData.content}
        userId={userId!}
        userName={name || ''}
        courseName={courseData.title}
        initialProgress={initialProgress}
      />
    </div>
  );
}
