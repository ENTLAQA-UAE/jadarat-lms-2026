'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { CoverBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface CoverRendererProps {
  block: CoverBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

const HEIGHT_MAP = {
  small: 'h-[200px]',
  medium: 'h-[400px]',
  large: 'h-[600px]',
};

export function CoverRenderer({
  block,
  progress,
  onComplete,
  theme,
}: CoverRendererProps) {
  // Covers are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const alignClass =
    block.data.text_alignment === 'center'
      ? 'items-center text-center'
      : block.data.text_alignment === 'end'
        ? 'items-end text-end'
        : 'items-start text-start';

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden flex flex-col justify-center p-8',
        HEIGHT_MAP[block.data.height],
        alignClass
      )}
      style={{
        backgroundImage: block.data.background_image
          ? `url(${block.data.background_image})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: block.data.overlay_color }}
      />

      {/* Content */}
      <div className="relative z-10">
        <h2
          className="text-3xl font-bold text-white"
          style={{ fontFamily: 'var(--player-font)' }}
        >
          {block.data.title}
        </h2>
        {block.data.subtitle && (
          <p className="text-lg text-white/80 mt-2">{block.data.subtitle}</p>
        )}
      </div>
    </div>
  );
}
