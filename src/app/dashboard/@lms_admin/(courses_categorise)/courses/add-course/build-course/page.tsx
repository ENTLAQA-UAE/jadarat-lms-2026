'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editor.store';
import { saveContent, publishContent, loadCourseWithContent } from '@/action/authoring/content';
import { EditorHeader } from '@/components/authoring/EditorHeader';
import { ModuleSidebar } from '@/components/authoring/ModuleSidebar';
import { EditorCanvas } from '@/components/authoring/EditorCanvas';

export default function BuildCoursePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const store = useEditorStore();

  // Load course data on mount
  useEffect(() => {
    if (!courseId) return;

    const load = async () => {
      setLoading(true);
      const { data, error: loadError } = await loadCourseWithContent(parseInt(courseId));

      if (loadError || !data) {
        setError(loadError || 'Course not found');
        setLoading(false);
        return;
      }

      const course = Array.isArray(data) ? data[0] : data;
      setCourseTitle(course.title || '');

      // Initialize editor store with course content
      const content = course.content || {
        modules: [],
        settings: {
          theme: {
            primary_color: '#1a73e8',
            secondary_color: '#f59e0b',
            background_color: '#ffffff',
            text_color: '#1f2937',
            font_family: 'cairo',
            border_radius: 'medium' as const,
            cover_style: 'gradient' as const,
          },
          navigation: 'sequential' as const,
          show_progress_bar: true,
          show_lesson_list: true,
          completion_criteria: 'all_blocks' as const,
          language: 'ar' as const,
          direction: 'rtl' as const,
        },
      };

      store.loadContent(
        parseInt(courseId),
        content,
        course.content_id || null,
        course.content_version || 1
      );

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Clean up editor on unmount
  useEffect(() => {
    return () => {
      store.resetEditor();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(async () => {
    if (!courseId) return;
    store.setSaving(true);

    const { contentId, error: saveError } = await saveContent(
      parseInt(courseId),
      store.content
    );

    store.setSaving(false);

    if (saveError) {
      toast.error('Save failed', { description: saveError });
      return;
    }

    store.setDirty(false);
    toast.success('Saved', { description: 'Course content saved successfully.' });
  }, [courseId, store]);

  const handlePublish = useCallback(async () => {
    if (!courseId || !store.contentId) {
      // Save first if no contentId
      await handleSave();
      if (!store.contentId) {
        toast.error('Error', { description: 'Please save the course first.' });
        return;
      }
    }

    store.setPublishing(true);

    const { error: publishError } = await publishContent(
      parseInt(courseId!),
      store.contentId!
    );

    store.setPublishing(false);

    if (publishError) {
      toast.error('Publish failed', { description: publishError });
      return;
    }

    store.setDirty(false);
    toast.success('Published', { description: 'Course is now live for learners.' });
  }, [courseId, store, handleSave]);

  if (!courseId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No course ID provided.</p>
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorHeader
        courseTitle={courseTitle}
        onSave={handleSave}
        onPublish={handlePublish}
      />

      <div className="flex flex-1 overflow-hidden">
        {store.sidebarOpen && <ModuleSidebar />}

        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <EditorCanvas />
        </main>
      </div>
    </div>
  );
}
