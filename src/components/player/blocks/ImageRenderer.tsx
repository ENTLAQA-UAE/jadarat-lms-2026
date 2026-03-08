'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
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
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // Show placeholder if no image source
  if (!block.data.src) {
    return (
      <figure className={alignClass} style={{ maxWidth: WIDTH_MAP[block.data.width] }}>
        <div className="flex items-center justify-center w-full h-48 rounded-lg bg-muted border border-dashed">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{block.data.alt || 'Image not available'}</p>
          </div>
        </div>
      </figure>
    );
  }

  const img = (
    <figure className={alignClass} style={{ maxWidth: WIDTH_MAP[block.data.width] }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.data.src}
        alt={block.data.alt}
        className="w-full rounded-lg object-cover"
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 300ms ease-in-out',
        }}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
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
