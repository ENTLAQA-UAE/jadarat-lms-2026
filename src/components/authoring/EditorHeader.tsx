'use client';

import { useState, useEffect } from 'react';
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
  Check,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEditorStore } from '@/stores/editor.store';
import { cn } from '@/lib/utils';

interface EditorHeaderProps {
  courseTitle: string;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
}

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
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Show "Saved" feedback briefly after a successful save
  useEffect(() => {
    if (showSavedFeedback) {
      const t = setTimeout(() => setShowSavedFeedback(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showSavedFeedback]);

  const handleBack = () => {
    router.push('/dashboard/courses');
  };

  const handleSave = async () => {
    if (isSaving || isSaveLoading) return;
    setIsSaveLoading(true);
    try {
      await onSave();
      setShowSavedFeedback(true);
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
    <TooltipProvider delayDuration={300}>
      <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-4">
        {/* Left: Back + Title + Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Back to courses
            </TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <h1 className="truncate text-sm font-semibold text-foreground max-w-[200px] sm:max-w-[300px]">
            {courseTitle}
          </h1>

          {/* Save status */}
          <div className="shrink-0">
            {savingInProgress ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            ) : showSavedFeedback ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1.5 text-xs text-amber-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={undoStack.length === 0}
                className="h-8 w-8"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Undo <kbd className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">Ctrl+Z</kbd>
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={redoStack.length === 0}
                className="h-8 w-8"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Redo <kbd className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">Ctrl+Shift+Z</kbd>
            </TooltipContent>
          </Tooltip>

          <div className="mx-1.5 h-5 w-px bg-border/60" />

          {/* Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={previewMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={togglePreview}
                className="gap-1.5 h-8"
              >
                {previewMode ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline text-xs">
                  {previewMode ? 'Exit Preview' : 'Preview'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {previewMode ? 'Exit preview mode' : 'Preview as learner'}
            </TooltipContent>
          </Tooltip>

          <div className="mx-1.5 h-5 w-px bg-border/60" />

          {/* Save */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={savingInProgress || !isDirty}
            className="gap-1.5 h-8 text-xs"
          >
            {savingInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {savingInProgress ? 'Saving' : 'Save'}
            </span>
          </Button>

          {/* Publish */}
          <Button
            variant="default"
            size="sm"
            onClick={handlePublish}
            disabled={publishingInProgress || !isDirty || savingInProgress}
            className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {publishingInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {publishingInProgress ? 'Publishing' : 'Publish'}
            </span>
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
}
