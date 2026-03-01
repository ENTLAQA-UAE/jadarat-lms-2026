'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { TableBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface TableRendererProps {
  block: TableBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function TableRenderer({
  block,
  progress,
  onComplete,
  theme,
}: TableRendererProps) {
  const { headers, rows, has_header_row, striped, caption } = block.data;

  // Auto-complete on mount
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption && (
          <caption
            className="mb-2 text-sm text-muted-foreground"
            style={{ captionSide: 'bottom' }}
          >
            {caption}
          </caption>
        )}
        {has_header_row && (
          <thead>
            <tr
              className="border-b-2 border-border"
              style={{ backgroundColor: `${theme.primary_color}1A` }}
            >
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wider"
                  style={{ color: theme.text_color }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'border-b border-border transition-colors hover:bg-muted/30',
                striped && rowIndex % 2 === 0 && 'bg-muted/50'
              )}
            >
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2.5 text-sm"
                  style={{ color: theme.text_color }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
