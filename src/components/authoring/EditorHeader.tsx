'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor.store';
import { cn } from '@/lib/utils';

// ============================================================
// PROPS
// ============================================================

interface EditorHeaderProps {
  courseTitle: string;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
}

// ============================================================
// EDITOR HEADER COMPONENT
// ============================================================

export function EditorHeader({
  courseTitle,
  onSave,
  onPublish,
}: EditorHeaderProps) {
  const router = useRouter();

  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const isPublishing = useEditorStore((s) => s.isPublishing);
  const previewMode = useEditorStore((s) => s.previewMode);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const togglePreview = useEditorStore((s) => s.togglePreview);

  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);

  const handleBack = () => {
    router.push('/dashboard/courses');
  };

  const handleSave = async () => {
    if (isSaving || isSaveLoading) return;
    setIsSaveLoading(true);
    try {
      await onSave();
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handlePublish = async () => {
    if (isPublishing || isPublishLoading) return;
    setIsPublishLoading(true);
    try {
      await onPublish();
    } finally {
      setIsPublishLoading(false);
    }
  };

  const savingInProgress = isSaving || isSaveLoading;
  const publishingInProgress = isPublishing || isPublishLoading;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      {/* Left section: Back + Title + Dirty indicator */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Course title */}
        <h1 className="max-w-[200px] truncate text-sm font-semibold text-foreground sm:max-w-[300px]">
          {courseTitle}
        </h1>

        {/* Unsaved changes indicator */}
        {isDirty && (
          <div className="flex items-center gap-1.5 text-xs text-orange-500">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            <span className="hidden sm:inline">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Right section: Undo/Redo + Preview + Save + Publish */}
      <div className="flex items-center gap-1.5">
        {/* Undo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo"
          className="h-8 w-8"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        {/* Redo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo"
          className="h-8 w-8"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* Preview toggle */}
        <Button
          variant={previewMode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={togglePreview}
          className="gap-1.5"
          title={previewMode ? 'Exit preview' : 'Preview'}
        >
          {previewMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* Save button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={savingInProgress}
          className="gap-1.5"
        >
          {savingInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {savingInProgress ? 'Saving...' : 'Save'}
          </span>
        </Button>

        {/* Publish button */}
        <Button
          variant="success"
          size="sm"
          onClick={handlePublish}
          disabled={publishingInProgress || !isDirty || savingInProgress}
          className="gap-1.5"
        >
          {publishingInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {publishingInProgress ? 'Publishing...' : 'Publish'}
          </span>
        </Button>
      </div>
    </header>
  );
}
