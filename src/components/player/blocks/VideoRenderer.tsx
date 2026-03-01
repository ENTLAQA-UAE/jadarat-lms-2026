'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { VideoBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface VideoRendererProps {
  block: VideoBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

const COMPLETION_THRESHOLDS: Record<string, number> = {
  watch_75: 0.75,
  watch_90: 0.9,
  watch_100: 0.98, // 98% to allow for rounding
};

export function VideoRenderer({
  block,
  progress,
  onComplete,
}: VideoRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [maxWatchedRatio, setMaxWatchedRatio] = useState(0);
  const completedRef = useRef(progress?.completed ?? false);

  const threshold =
    COMPLETION_THRESHOLDS[block.data.completion_criteria] ?? 0.75;

  const bunnyStreamHost =
    process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST || 'iframe.mediadelivery.net';

  const embedUrl = `https://${bunnyStreamHost}/embed/${block.data.bunny_library_id}/${block.data.bunny_video_id}?autoplay=${block.data.autoplay}&preload=true&responsive=true`;

  // Listen for Bunny player postMessage events for progress tracking
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (completedRef.current) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Bunny player sends timeupdate events
        if (data.event === 'timeupdate' && data.currentTime && block.data.duration_seconds > 0) {
          const ratio = data.currentTime / block.data.duration_seconds;
          setMaxWatchedRatio((prev) => {
            const newMax = Math.max(prev, ratio);
            if (newMax >= threshold && !completedRef.current) {
              completedRef.current = true;
              onComplete();
            }
            return newMax;
          });
        }

        // Also handle ended event
        if (data.event === 'ended' || data.event === 'video_ended') {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [block.data.duration_seconds, threshold, onComplete]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <div className="space-y-2">
      {block.data.title && (
        <h3 className="font-medium text-lg">{block.data.title}</h3>
      )}

      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {block.data.description && (
        <p className="text-sm text-muted-foreground">{block.data.description}</p>
      )}

      {/* Watch progress indicator */}
      {!completedRef.current && maxWatchedRatio > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(maxWatchedRatio * 100, 100)}%` }}
            />
          </div>
          <span>{Math.round(maxWatchedRatio * 100)}%</span>
        </div>
      )}
    </div>
  );
}
