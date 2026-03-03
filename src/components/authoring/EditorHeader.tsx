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
  Rocket,
  Loader2,
  Check,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
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
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const togglePreview = useEditorStore((s) => s.togglePreview);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);

  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    if (showSavedFeedback) {
      const t = setTimeout(() => setShowSavedFeedback(false), 2500);
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
    <TooltipProvider delayDuration={200}>
      <header className="relative z-30 flex h-[52px] items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-3">
        {/* Subtle gradient line at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Left: Navigation + Title + Status */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Back button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              Back to courses
            </TooltipContent>
          </Tooltip>

          {/* Sidebar toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              {sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            </TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/50 shrink-0 mx-0.5" />

          {/* Course title with sparkle icon */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <h1 className="truncate text-sm font-semibold text-foreground max-w-[160px] sm:max-w-[280px] leading-tight">
              {courseTitle || 'Untitled Course'}
            </h1>
          </div>

          {/* Save status indicator */}
          <div className="shrink-0 ms-1">
            {savingInProgress ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            ) : showSavedFeedback ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Center: Undo/Redo */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-0.5 rounded-lg border border-border/40 bg-muted/30 p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={undoStack.length === 0}
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all duration-200"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              Undo <kbd className="ml-1.5 rounded-md bg-muted border border-border/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Ctrl+Z</kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={redoStack.length === 0}
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all duration-200"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              Redo <kbd className="ml-1.5 rounded-md bg-muted border border-border/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Ctrl+Shift+Z</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right: Preview + Save + Publish */}
        <div className="flex items-center gap-1.5">
          {/* Preview toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={previewMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={togglePreview}
                className={cn(
                  'gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-200',
                  previewMode
                    ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
              >
                {previewMode ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {previewMode ? 'Exit Preview' : 'Preview'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              {previewMode ? 'Exit preview mode' : 'Preview as learner'}
            </TooltipContent>
          </Tooltip>

          <div className="mx-0.5 h-4 w-px bg-border/40" />

          {/* Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={savingInProgress || !isDirty}
            className={cn(
              'gap-1.5 h-8 rounded-lg text-xs font-medium border-border/50 transition-all duration-200',
              isDirty && !savingInProgress
                ? 'border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50'
                : '',
            )}
          >
            {savingInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : showSavedFeedback ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {savingInProgress ? 'Saving' : showSavedFeedback ? 'Saved' : 'Save'}
            </span>
          </Button>

          {/* Publish button */}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishingInProgress || !isDirty || savingInProgress}
            className="gap-1.5 h-8 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {publishingInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Rocket className="h-3.5 w-3.5" />
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
