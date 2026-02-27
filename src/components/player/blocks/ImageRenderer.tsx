'use client';

import { useEffect } from 'react';
import type { ImageBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ImageRendererProps {
  block: ImageBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

const WIDTH_MAP = {
  small: '33%',
  medium: '50%',
  large: '75%',
  full: '100%',
};

export function ImageRenderer({
  block,
  progress,
  onComplete,
}: ImageRendererProps) {
  // Images are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const alignClass =
    block.data.alignment === 'center'
      ? 'mx-auto'
      : block.data.alignment === 'end'
        ? 'ms-auto'
        : '';

  const img = (
    <figure className={alignClass} style={{ maxWidth: WIDTH_MAP[block.data.width] }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.data.src}
        alt={block.data.alt}
        className="w-full rounded-lg object-cover"
        loading="lazy"
      />
      {block.data.caption && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
          {block.data.caption}
        </figcaption>
      )}
    </figure>
  );

  if (block.data.link_url) {
    return (
      <a href={block.data.link_url} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
