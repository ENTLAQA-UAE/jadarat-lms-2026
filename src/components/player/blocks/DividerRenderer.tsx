'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { DividerBlock } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface DividerRendererProps {
  block: DividerBlock;
  progress?: BlockProgress;
  onComplete: () => void;
}

const SPACING_MAP = {
  small: 'py-2',
  medium: 'py-6',
  large: 'py-10',
};

export function DividerRenderer({
  block,
  progress,
  onComplete,
}: DividerRendererProps) {
  // Dividers are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  return (
    <div className={cn(SPACING_MAP[block.data.spacing])}>
      {block.data.style === 'line' && (
        <hr className="border-border" />
      )}
      {block.data.style === 'dots' && (
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      )}
      {block.data.style === 'space' && <div />}
    </div>
  );
}
