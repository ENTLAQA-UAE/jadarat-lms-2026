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
  Zap,
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
      <header className="relative z-30 flex h-14 items-center justify-between bg-slate-900 dark:bg-slate-950 px-4 shadow-lg shadow-slate-900/10">
        {/* Accent gradient line at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-80" />

        {/* Left: Navigation + Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Back */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              Back to courses
            </TooltipContent>
          </Tooltip>

          {/* Vertical divider */}
          <div className="h-5 w-px bg-slate-700 shrink-0 mx-1" />

          {/* Sidebar toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  'h-8 w-8 shrink-0 rounded-lg transition-all duration-200',
                  sidebarOpen
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/10',
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
                  'h-8 w-8 shrink-0 rounded-lg transition-all duration-200',
                  blockLibraryOpen
                    ? 'text-indigo-300 bg-indigo-500/20 ring-1 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10',
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
              {blockLibraryOpen ? 'Close blocks' : 'Block library'}
            </TooltipContent>
          </Tooltip>

          {/* Vertical divider */}
          <div className="h-5 w-px bg-slate-700 shrink-0 mx-1" />

          {/* Course title + brand icon */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white max-w-[140px] sm:max-w-[260px] leading-tight">
                {courseTitle || 'Untitled Course'}
              </h1>
            </div>
          </div>

          {/* Save status */}
          <div className="shrink-0 ms-2">
            {savingInProgress ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving</span>
              </span>
            ) : showSavedFeedback ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-400 animate-in fade-in duration-300">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Center: Undo/Redo */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-0.5 rounded-lg bg-white/[0.06] border border-white/[0.08] p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={undoStack.length === 0}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              Undo <kbd className="ml-1.5 rounded-md bg-slate-700 border border-slate-600 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Ctrl+Z</kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={redoStack.length === 0}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              Redo <kbd className="ml-1.5 rounded-md bg-slate-700 border border-slate-600 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Ctrl+Shift+Z</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePreview}
                className={cn(
                  'gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-200',
                  previewMode
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30 hover:bg-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/10',
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

          {/* Save */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={savingInProgress || !isDirty}
            className={cn(
              'gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-200',
              isDirty && !savingInProgress
                ? 'text-white bg-white/10 hover:bg-white/15 ring-1 ring-white/10'
                : 'text-slate-500 hover:text-slate-300 disabled:opacity-30',
            )}
          >
            {savingInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : showSavedFeedback ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
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
            className="gap-1.5 h-8 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25 border-0 transition-all duration-200 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none"
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
