'use client';

import { useEffect } from 'react';
import type { QuoteBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface QuoteRendererProps {
  block: QuoteBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function QuoteRenderer({
  block,
  progress,
  onComplete,
  theme,
}: QuoteRendererProps) {
  // Quotes are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { text, attribution, style } = block.data;

  if (style === 'large') {
    return (
      <blockquote className="text-center py-6">
        <div className="text-4xl leading-none mb-4" style={{ color: 'var(--player-primary)' }}>
          &ldquo;
        </div>
        <p
          className="text-2xl font-medium italic"
          style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}
        >
          {text}
        </p>
        <div className="text-4xl leading-none mt-4" style={{ color: 'var(--player-primary)' }}>
          &rdquo;
        </div>
        {attribution && (
          <footer className="mt-4 text-sm text-muted-foreground">
            &mdash; {attribution}
          </footer>
        )}
      </blockquote>
    );
  }

  if (style === 'highlight') {
    return (
      <blockquote
        className="rounded-lg p-6"
        style={{ backgroundColor: 'color-mix(in srgb, var(--player-primary) 10%, transparent)' }}
      >
        <p
          className="text-base"
          style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}
        >
          {text}
        </p>
        {attribution && (
          <footer className="mt-3 text-sm text-muted-foreground">
            &mdash; {attribution}
          </footer>
        )}
      </blockquote>
    );
  }

  // Default style
  return (
    <blockquote
      className="py-4 ps-4"
      style={{ borderInlineStart: '4px solid var(--player-primary)' }}
    >
      <p
        className="text-base italic"
        style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}
      >
        {text}
      </p>
      {attribution && (
        <footer className="mt-2 text-sm text-muted-foreground">
          &mdash; {attribution}
        </footer>
      )}
    </blockquote>
  );
}
