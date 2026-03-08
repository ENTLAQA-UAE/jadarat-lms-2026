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
  LayoutGrid,
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
  onSave: () => Promise<string | null | void>;
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
  const blockLibraryOpen = useEditorStore((s) => s.blockLibraryOpen);
  const toggleBlockLibrary = useEditorStore((s) => s.toggleBlockLibrary);

  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);

  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState<string | null>(null);

  // Update relative time label every 30s
  useEffect(() => {
    if (!lastSavedAt) {
      setLastSavedLabel(null);
      return;
    }
    const updateLabel = () => {
      const diff = Math.floor((Date.now() - new Date(lastSavedAt).getTime()) / 1000);
      if (diff < 10) setLastSavedLabel('just now');
      else if (diff < 60) setLastSavedLabel(`${diff}s ago`);
      else if (diff < 3600) setLastSavedLabel(`${Math.floor(diff / 60)}m ago`);
      else setLastSavedLabel(`${Math.floor(diff / 3600)}h ago`);
    };
    updateLabel();
    const interval = setInterval(updateLabel, 30_000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

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
      setLastSavedAt(new Date().toISOString());
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
      <header className="relative z-40 flex h-[52px] items-center justify-between px-3 glass-toolbar border-b border-black/[0.06] dark:border-white/[0.06]">
        {/* Left: Navigation + Title */}
        <div className="flex items-center gap-1 min-w-0">
          {/* Back */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              Back to courses
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="h-4 w-px bg-border/60 shrink-0 mx-0.5" />

          {/* Sidebar toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  'h-8 w-8 shrink-0 rounded-lg transition-all duration-150',
                  sidebarOpen
                    ? 'text-primary bg-primary/8 hover:bg-primary/12'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                )}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              {sidebarOpen ? 'Hide structure' : 'Show structure'}
            </TooltipContent>
          </Tooltip>

          {/* Block Library toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBlockLibrary}
                className={cn(
                  'h-8 w-8 shrink-0 rounded-lg transition-all duration-150',
                  blockLibraryOpen
                    ? 'text-primary bg-primary/8 hover:bg-primary/12'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              {blockLibraryOpen ? 'Close blocks' : 'Block library'}
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="h-4 w-px bg-border/60 shrink-0 mx-0.5" />

          {/* Course title + brand icon */}
          <div className="flex items-center gap-2 min-w-0 ms-1">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md gradient-vivid">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <h1 className="truncate text-[13px] font-semibold text-foreground max-w-[140px] sm:max-w-[260px] leading-tight tracking-tight">
              {courseTitle || 'Untitled Course'}
            </h1>
          </div>

          {/* Save status pill */}
          <div className="shrink-0 ms-2">
            {savingInProgress ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving</span>
              </span>
            ) : showSavedFeedback ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success animate-in fade-in duration-300">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            ) : lastSavedLabel ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/50">
                <span className="hidden sm:inline">Saved {lastSavedLabel}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Center: Undo/Redo */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={undoStack.length === 0}
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.08] disabled:opacity-20 transition-all duration-150"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              Undo <kbd className="ms-1.5 rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Ctrl+Z</kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={redoStack.length === 0}
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.08] disabled:opacity-20 transition-all duration-150"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              Redo <kbd className="ms-1.5 rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Ctrl+Shift+Z</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePreview}
                className={cn(
                  'gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-150',
                  previewMode
                    ? 'bg-primary/8 text-primary hover:bg-primary/12'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
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

          {/* Separator */}
          <div className="h-4 w-px bg-border/60 shrink-0" />

          {/* Save */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={savingInProgress || !isDirty}
            className={cn(
              'gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-150',
              isDirty && !savingInProgress
                ? 'text-foreground bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                : 'text-muted-foreground/50 disabled:opacity-30',
            )}
          >
            {savingInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : showSavedFeedback ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {savingInProgress ? 'Saving' : showSavedFeedback ? 'Saved' : 'Save'}
            </span>
          </Button>

          {/* Publish */}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishingInProgress || savingInProgress}
            className="gap-1.5 h-8 rounded-lg text-xs font-semibold gradient-vivid text-white shadow-md shadow-primary/20 border-0 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:brightness-110 disabled:opacity-40 disabled:shadow-none disabled:brightness-100"
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
