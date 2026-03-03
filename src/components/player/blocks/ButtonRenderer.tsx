'use client';

import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ButtonBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ButtonRendererProps {
  block: ButtonBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  onNextLesson?: () => void;
  onPreviousLesson?: () => void;
  theme: CourseTheme;
}

export function ButtonRenderer({
  block,
  progress,
  onComplete,
  onNextLesson,
  onPreviousLesson,
  theme,
}: ButtonRendererProps) {
  const { data } = block;

  // Auto-complete on mount (buttons are passive content)
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const handleClick = (btn: ButtonBlock['data']['buttons'][number]) => {
    switch (btn.action) {
      case 'link':
        if (btn.url) {
          window.open(btn.url, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'next_lesson':
        onNextLesson?.();
        break;
      case 'previous_lesson':
        onPreviousLesson?.();
        break;
      case 'scroll_top':
        document
          .getElementById('player-content')
          ?.scrollTo({ top: 0, behavior: 'smooth' });
        break;
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 py-2',
        data.layout === 'stacked' && 'flex-col',
        data.alignment === 'center' && 'justify-center items-center',
        data.alignment === 'end' && 'justify-end items-end',
        data.alignment === 'start' && 'justify-start items-start'
      )}
      style={{ fontFamily: 'var(--player-font)' }}
    >
      {data.buttons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          onClick={() => handleClick(btn)}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]',
            btn.style === 'primary' && 'text-white',
            btn.style === 'secondary' && 'text-white',
            btn.style === 'outline' && 'border-2',
            btn.style === 'ghost' && 'hover:bg-black/5 dark:hover:bg-white/10'
          )}
          style={{
            borderRadius: 'var(--player-radius)',
            ...(btn.style === 'primary'
              ? { backgroundColor: 'var(--player-primary)' }
              : {}),
            ...(btn.style === 'secondary'
              ? { backgroundColor: 'var(--player-secondary)' }
              : {}),
            ...(btn.style === 'outline'
              ? {
                  borderColor: 'var(--player-primary)',
                  color: 'var(--player-primary)',
                }
              : {}),
            ...(btn.style === 'ghost'
              ? { color: 'var(--player-primary)' }
              : {}),
          }}
        >
          {btn.icon && <span>{btn.icon}</span>}
          {btn.label}
          {btn.action === 'link' && (
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          )}
        </button>
      ))}
    </div>
  );
}
