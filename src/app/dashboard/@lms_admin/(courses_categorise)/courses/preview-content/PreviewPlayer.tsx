'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { loadCourseWithContent } from '@/action/authoring/content';
import { CoursePlayer } from '@/components/player/CoursePlayer';
import type { CourseContent } from '@/types/authoring';

interface PreviewPlayerProps {
  courseId: number;
  userId: string;
  userName: string;
}

export function PreviewPlayer({ courseId, userId, userName }: PreviewPlayerProps) {
  const router = useRouter();
  const [content, setContent] = useState<CourseContent | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error: loadError } = await loadCourseWithContent(courseId);

      if (loadError || !data) {
        setError(loadError || 'Course not found');
        setLoading(false);
        return;
      }

      const course = Array.isArray(data) ? data[0] : data;
      if (!course) {
        setError('Course not found');
        setLoading(false);
        return;
      }

      setCourseTitle(course.title || '');
      setContent(course.content as CourseContent | null);
      setLoading(false);
    };

    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => router.push('/dashboard/courses')}
            className="text-primary underline"
          >
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  if (!content || !content.modules || content.modules.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">No Content</h2>
          <p className="text-muted-foreground">
            This course has no content yet. Build the course first using the editor.
          </p>
          <button
            onClick={() => router.push(`/dashboard/courses/add-course/build-course?courseId=${courseId}`)}
            className="text-primary underline"
          >
            Open Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <CoursePlayer
        courseId={courseId}
        content={content}
        userId={userId}
        userName={userName}
        courseName={courseTitle}
        initialProgress={[]}
      />
    </div>
  );
}
