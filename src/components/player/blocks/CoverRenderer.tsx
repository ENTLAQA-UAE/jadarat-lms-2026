'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
  small: 'min-h-[240px]',
  medium: 'min-h-[400px]',
  large: 'min-h-[560px]',
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

  const hasImage = !!block.data.background_image;

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden flex flex-col justify-end p-8 md:p-12',
        HEIGHT_MAP[block.data.height],
        alignClass
      )}
      style={{
        backgroundImage: hasImage
          ? `url(${block.data.background_image})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--player-radius)',
      }}
    >
      {/* Gradient overlay for better text readability */}
      {hasImage ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${block.data.overlay_color} 0%, ${block.data.overlay_color}99 40%, transparent 100%)`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, var(--player-primary), color-mix(in srgb, var(--player-primary) 60%, var(--player-secondary)))`,
          }}
        />
      )}

      {/* Decorative pattern overlay (when no image) */}
      {!hasImage && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      )}

      {/* Logo overlay */}
      {theme.logo_url && (
        <motion.div
          className="absolute top-6 start-6 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <img
            src={theme.logo_url}
            alt="Course logo"
            className="h-10 md:h-12 w-auto object-contain drop-shadow-lg"
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h2
          className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight"
          style={{ fontFamily: 'var(--player-font)' }}
        >
          {block.data.title}
        </h2>
        {block.data.subtitle && (
          <motion.p
            className="text-base md:text-lg text-white/75 mt-3 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {block.data.subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
