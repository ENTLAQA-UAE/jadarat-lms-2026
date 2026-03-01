'use client';

import { useState, useEffect } from 'react';
import { History, RotateCcw, Loader2, CheckCircle2, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/utils/supabase/client';
import { useEditorStore } from '@/stores/editor.store';
import type { CourseContent } from '@/types/authoring';

// ============================================================
// TYPES
// ============================================================

interface ContentVersion {
  id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  created_by: string | null;
}

// ============================================================
// PROPS
// ============================================================

interface VersionHistoryProps {
  courseId: number;
}

// ============================================================
// HELPERS
// ============================================================

function getStatusBadge(status: ContentVersion['status']) {
  switch (status) {
    case 'draft':
      return (
        <Badge variant="outline" className="border-yellow-400 text-yellow-600">
          Draft
        </Badge>
      );
    case 'published':
      return (
        <Badge variant="outline" className="border-green-400 text-green-600">
          Published
        </Badge>
      );
    case 'archived':
      return (
        <Badge variant="outline" className="border-muted text-muted-foreground">
          Archived
        </Badge>
      );
  }
}

function formatDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// VERSION HISTORY COMPONENT
// ============================================================

export function VersionHistory({ courseId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<ContentVersion | null>(null);

  // Fetch versions on mount
  useEffect(() => {
    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchVersions = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('course_content')
      .select(
        'id, version, status, created_at, updated_at, published_at, created_by',
      )
      .eq('course_id', courseId)
      .order('version', { ascending: false });

    if (error) {
      console.error('Failed to fetch versions:', error);
      toast.error('Failed to load version history');
    } else {
      setVersions((data as ContentVersion[]) ?? []);
    }

    setLoading(false);
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;
    setRestoring(selectedVersion.id);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('course_content')
        .select('content')
        .eq('id', selectedVersion.id)
        .single();

      if (error || !data) {
        toast.error('Failed to load version content');
        return;
      }

      // Load the restored content into the editor store
      useEditorStore.getState().loadContent(
        courseId,
        data.content as CourseContent,
        selectedVersion.id,
        selectedVersion.version,
      );

      toast.success(`Restored to version ${selectedVersion.version}`);
      setConfirmDialogOpen(false);
      setSelectedVersion(null);
    } catch {
      toast.error('Failed to restore version');
    } finally {
      setRestoring(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!loading && versions.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No versions found. Save your course to create the first version.
          </p>
        )}

        {/* Version list */}
        {!loading && versions.length > 0 && (
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {versions.map((ver) => {
              const isDraft = ver.status === 'draft';

              return (
                <div
                  key={ver.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                    isDraft
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  {/* Version number badge */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    v{ver.version}
                  </div>

                  {/* Version details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(ver.status)}
                      {ver.status === 'published' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      )}
                      {isDraft && (
                        <span className="text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Created {formatDate(ver.created_at)}
                      {ver.published_at && (
                        <span>
                          {' '}
                          &middot; Published {formatFullDate(ver.published_at)}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Restore button for archived versions */}
                  {ver.status === 'archived' && (
                    <Dialog
                      open={
                        confirmDialogOpen && selectedVersion?.id === ver.id
                      }
                      onOpenChange={setConfirmDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 gap-1.5"
                          onClick={() => {
                            setSelectedVersion(ver);
                            setConfirmDialogOpen(true);
                          }}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>
                          Restore Version {ver.version}?
                        </DialogTitle>
                        <DialogDescription>
                          This will load version {ver.version} (from{' '}
                          {formatFullDate(ver.created_at)}) into the editor. Your
                          current unsaved changes will be replaced. You can undo
                          this action.
                        </DialogDescription>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setConfirmDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleRestore}
                            disabled={restoring === ver.id}
                          >
                            {restoring === ver.id ? (
                              <Loader2 className="me-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Archive className="me-2 h-4 w-4" />
                            )}
                            Restore
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
