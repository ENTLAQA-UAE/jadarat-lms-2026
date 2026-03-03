'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ListBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ListRendererProps {
  block: ListBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function ListRenderer({
  block,
  progress,
  onComplete,
  theme,
}: ListRendererProps) {
  // List blocks are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { items, style, columns } = block.data;

  const gridClass = cn(
    'grid gap-3',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-1 sm:grid-cols-2',
    columns === 3 && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
  );

  return (
    <div className={gridClass}>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-start gap-3">
          {/* Bullet / Number / Icon */}
          <span
            className="mt-0.5 shrink-0 font-semibold text-sm"
            style={{ color: 'var(--player-primary)' }}
          >
            {style === 'bullet' && (
              <span className="text-lg leading-none">&bull;</span>
            )}
            {style === 'numbered' && <span>{index + 1}.</span>}
            {style === 'icon' && (
              <span className="text-lg leading-none">
                {item.icon || '\u2022'}
              </span>
            )}
          </span>

          {/* Item text */}
          <span className="text-sm leading-relaxed">{item.text}</span>
        </div>
      ))}
    </div>
  );
}
