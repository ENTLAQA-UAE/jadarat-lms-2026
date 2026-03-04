'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor.store';
import { saveContent, publishContent, loadCourseWithContent } from '@/action/authoring/content';
import { EditorHeader } from '@/components/authoring/EditorHeader';
import { ModuleSidebar } from '@/components/authoring/ModuleSidebar';
import { EditorCanvas, createDefaultBlock } from '@/components/authoring/EditorCanvas';
import { BlockLibrarySidebar } from '@/components/authoring/BlockLibrarySidebar';
import { AICourseWizard } from '@/components/authoring/ai/AICourseWizard';
import { BlockType } from '@/types/authoring';

export default function BuildCoursePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCourseId = searchParams.get('courseId');
  const courseId = rawCourseId && rawCourseId !== 'null' && !isNaN(Number(rawCourseId)) ? rawCourseId : null;
  const mode = searchParams.get('mode'); // 'ai' for AI wizard
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIWizard, setShowAIWizard] = useState(mode === 'ai');

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
      if (!course) {
        setError('Course not found');
        setLoading(false);
        return;
      }
      setCourseTitle(course.title || '');

      // Initialize editor store with course content
      const rawContent = course.content || {};
      const content = {
        modules: Array.isArray(rawContent.modules) ? rawContent.modules : [],
        settings: rawContent.settings || {
          theme: {
            primary_color: '#1a73e8',
            secondary_color: '#f59e0b',
            background_color: '#ffffff',
            text_color: '#1f2937',
            font_family: 'cairo',
            border_radius: 'medium' as const,
            cover_style: 'gradient' as const,
            navigation_style: 'sidebar' as const,
            lesson_header_style: 'full_width_banner' as const,
            dark_mode: false,
          },
          navigation: 'sequential' as const,
          show_progress_bar: true,
          show_lesson_list: true,
          completion_criteria: 'all_blocks' as const,
          language: 'ar' as const,
          direction: 'rtl' as const,
          sidebar_default_open: true,
          allow_search: true,
          allow_mark_complete: false,
          show_lesson_count: true,
          quiz_settings: {
            allow_retries: true,
            max_retries: 0,
            randomize_questions: false,
            shuffle_answers: true,
            require_passing_to_continue: false,
          },
          block_entrance_animations: true,
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

  // ── Warn before closing with unsaved changes ──────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (useEditorStore.getState().isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ── Auto-save (debounced, every 30 seconds while dirty) ───
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = store.isDirty;

  useEffect(() => {
    if (!isDirty || !courseId) return;

    // Clear any existing timer
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

    autoSaveRef.current = setTimeout(async () => {
      const state = useEditorStore.getState();
      if (!state.isDirty || state.isSaving) return;

      state.setSaving(true);
      const { error: saveError } = await saveContent(parseInt(courseId), state.content);
      state.setSaving(false);

      if (!saveError) {
        state.setDirty(false);
      }
    }, 30_000); // 30 second debounce

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [isDirty, courseId]);

  // ── Keyboard shortcuts (Ctrl+S to save) ───────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Ref to avoid stale closure in keyboard handler
  const handleSaveRef = useRef<(() => Promise<string | null>) | null>(null);

  const handleSave = useCallback(async (): Promise<string | null> => {
    if (!courseId) return null;
    store.setSaving(true);

    const { contentId, error: saveError } = await saveContent(
      parseInt(courseId),
      store.content
    );

    store.setSaving(false);

    if (saveError) {
      toast.error('Save failed', { description: saveError });
      return null;
    }

    store.setDirty(false);
    toast.success('Saved', { description: 'Course content saved successfully.' });
    return contentId ?? null;
  }, [courseId, store]);

  // Keep ref in sync for keyboard shortcut handler
  handleSaveRef.current = handleSave;

  const handlePublish = useCallback(async () => {
    if (!courseId) return;

    // If no contentId yet, save first and use the returned value
    let activeContentId = store.contentId;
    if (!activeContentId) {
      activeContentId = await handleSave();
      if (!activeContentId) {
        toast.error('Error', { description: 'Please save the course first.' });
        return;
      }
    } else if (store.isDirty) {
      // Auto-save before publish if there are unsaved changes
      const savedId = await handleSave();
      if (!savedId) return; // save failed
      activeContentId = savedId;
    }

    store.setPublishing(true);

    const { error: publishError } = await publishContent(
      parseInt(courseId),
      activeContentId
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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/15">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1.5">No course ID</h2>
          <p className="text-sm text-muted-foreground mb-6">A valid course ID is required to open the editor.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/courses')}
            className="gap-2 rounded-lg"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to courses
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading course editor</p>
          <p className="text-xs text-muted-foreground mt-1">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/15">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1.5">Failed to load course</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/courses')}
              className="gap-2 rounded-lg"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to courses
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.reload()}
              className="rounded-lg"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // AI Wizard mode
  if (showAIWizard && courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
        <AICourseWizard
          courseId={parseInt(courseId)}
          onComplete={() => {
            setShowAIWizard(false);
            store.setDirty(true);
          }}
          onCancel={() => router.push('/dashboard/courses')}
        />
      </div>
    );
  }

  const handleBlockLibraryInsert = useCallback(
    (type: BlockType) => {
      if (!store.selectedModuleId || !store.selectedLessonId) return;
      const block = createDefaultBlock(type);
      store.addBlock(store.selectedModuleId, store.selectedLessonId, block);
    },
    [store],
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <EditorHeader
        courseTitle={courseTitle}
        onSave={handleSave}
        onPublish={handlePublish}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Structure sidebar */}
        {store.sidebarOpen && !store.blockLibraryOpen && <ModuleSidebar />}

        {/* Block Library sidebar (Rise-style) */}
        {store.blockLibraryOpen && (
          <BlockLibrarySidebar onInsertBlock={handleBlockLibraryInsert} />
        )}

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/10 to-muted/30">
          <EditorCanvas />
        </main>
      </div>
    </div>
  );
}
