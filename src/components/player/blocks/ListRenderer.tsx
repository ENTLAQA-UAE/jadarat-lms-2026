'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
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
}: ListRendererProps) {
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { items, style, columns } = block.data;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleCheck = (itemId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const gridClass = cn(
    'grid gap-3',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-1 sm:grid-cols-2',
    columns === 3 && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  );

  return (
    <div className={gridClass}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start gap-3',
            style === 'checkbox' && 'cursor-pointer select-none',
          )}
          onClick={style === 'checkbox' ? () => toggleCheck(item.id) : undefined}
        >
          {/* Bullet / Number / Icon / Checkbox */}
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
            {style === 'checkbox' && (
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border-2 transition-all',
                  checked.has(item.id)
                    ? 'border-transparent'
                    : 'border-muted-foreground/30',
                )}
                style={{
                  backgroundColor: checked.has(item.id) ? 'var(--player-primary)' : 'transparent',
                }}
              >
                {checked.has(item.id) && <Check className="h-3 w-3 text-white" />}
              </span>
            )}
          </span>

          {/* Item text */}
          <span
            className={cn(
              'text-sm leading-relaxed transition-all',
              style === 'checkbox' && checked.has(item.id) && 'line-through opacity-60',
            )}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
