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
        <div className="text-4xl leading-none mb-4" style={{ color: theme.primary_color }}>
          &ldquo;
        </div>
        <p
          className="text-2xl font-medium italic"
          style={{ color: theme.text_color, fontFamily: theme.font_family }}
        >
          {text}
        </p>
        <div className="text-4xl leading-none mt-4" style={{ color: theme.primary_color }}>
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
        style={{ backgroundColor: `${theme.primary_color}1A` }}
      >
        <p
          className="text-base"
          style={{ color: theme.text_color, fontFamily: theme.font_family }}
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
      style={{ borderInlineStart: `4px solid ${theme.primary_color}` }}
    >
      <p
        className="text-base italic"
        style={{ color: theme.text_color, fontFamily: theme.font_family }}
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
