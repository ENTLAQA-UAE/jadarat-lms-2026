'use client';

import { useEffect } from 'react';
import type { EmbedBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface EmbedRendererProps {
  block: EmbedBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

const ASPECT_PADDING: Record<string, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '1:1': '100%',
};

function getEmbedUrl(url: string, provider: EmbedBlock['data']['provider']): string {
  if (provider === 'youtube') {
    // Transform watch?v=VIDEO_ID to embed/VIDEO_ID
    return url.replace(/watch\?v=/, 'embed/');
  }

  if (provider === 'vimeo') {
    // Extract the video ID and build the player URL
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  // google_slides and custom: use URL as-is
  return url;
}

export function EmbedRenderer({
  block,
  progress,
  onComplete,
}: EmbedRendererProps) {
  // Embeds are auto-completed on mount
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { url, provider, aspect_ratio, allow_fullscreen } = block.data;
  const embedUrl = getEmbedUrl(url, provider);
  const paddingBottom = ASPECT_PADDING[aspect_ratio] ?? '56.25%';

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen={allow_fullscreen || undefined}
          loading="lazy"
          title="Embedded content"
        />
      </div>
    </div>
  );
}
