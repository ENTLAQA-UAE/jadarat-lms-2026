'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AudioBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface AudioRendererProps {
  block: AudioBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function AudioRenderer({
  block,
  progress,
  onComplete,
}: AudioRendererProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  // Audio content blocks are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      {/* Title */}
      {block.data.title && (
        <h3 className="font-medium text-lg">{block.data.title}</h3>
      )}

      {/* HTML5 Audio Player */}
      <audio
        controls
        src={block.data.src}
        className="w-full"
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>

      {/* Collapsible Transcript */}
      {block.data.show_transcript && block.data.transcript && (
        <div className="rounded-md border border-border">
          <button
            type="button"
            onClick={() => setTranscriptOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Transcript</span>
            {transcriptOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {transcriptOpen && (
            <div className="border-t border-border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
              {block.data.transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
