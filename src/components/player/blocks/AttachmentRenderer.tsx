'use client';

import { useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AttachmentBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface AttachmentRendererProps {
  block: AttachmentBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  if (mimeType.includes('image')) return '🖼️';
  return '📎';
}

function getFileExtension(fileName: string): string {
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

export function AttachmentRenderer({
  block,
  progress,
  onComplete,
  theme,
}: AttachmentRendererProps) {
  // Auto-complete on render (viewing the attachment is enough)
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { data } = block;

  if (!data.file_url) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        No file attached.
      </div>
    );
  }

  return (
    <div
      className="border rounded-xl overflow-hidden"
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      <div className="flex items-center gap-4 p-5">
        {/* File icon */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--player-primary) 10%, transparent)',
          }}
        >
          {getFileIcon(data.file_type)}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-0.5 truncate" style={{ color: 'var(--player-text)' }}>
            {data.title || data.file_name}
          </h4>
          {data.description && (
            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
              {data.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground/60">
            {getFileExtension(data.file_name)} &middot; {formatFileSize(data.file_size)}
          </p>
        </div>

        {/* Download button */}
        <a
          href={data.file_url}
          download={data.file_name}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="sm"
            className="gap-2 text-white shrink-0"
            style={{
              backgroundColor: 'var(--player-primary)',
              borderRadius: 'var(--player-radius)',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </a>
      </div>
    </div>
  );
}
