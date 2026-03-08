'use client';

import { useEffect } from 'react';
import type { TextBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';
import { SafeHTML } from '@/components/shared/SafeHTML';

interface TextRendererProps {
  block: TextBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
  direction: 'rtl' | 'ltr' | 'auto';
}

export function TextRenderer({
  block,
  progress,
  onComplete,
  theme,
  direction,
}: TextRendererProps) {
  // Text blocks are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const textDirection = block.data.direction === 'auto' ? direction : block.data.direction;

  return (
    <div
      dir={textDirection}
      style={{
        textAlign: block.data.alignment,
        fontFamily: 'var(--player-font)',
        color: 'var(--player-text)',
      }}
    >
      <SafeHTML
        html={block.data.content}
        className="prose prose-sm sm:prose max-w-none dark:prose-invert"
      />
    </div>
  );
}
