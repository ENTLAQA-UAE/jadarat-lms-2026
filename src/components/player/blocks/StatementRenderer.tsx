'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StatementBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface StatementRendererProps {
  block: StatementBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function StatementRenderer({
  block,
  progress,
  onComplete,
  theme,
}: StatementRendererProps) {
  const { data } = block;

  // Auto-complete on mount (statement blocks are passive content)
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const accentColor = data.accent_color || theme.primary_color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-lg transition-all',
        data.style === 'bold' && 'py-10 px-8',
        data.style === 'bordered' && 'border-l-4 py-6 px-8',
        data.style === 'background' && 'py-10 px-8',
        data.style === 'note' &&
          'py-6 px-8 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30'
      )}
      style={{
        fontFamily: 'var(--player-font)',
        borderRadius: 'var(--player-radius)',
        textAlign: data.alignment || 'center',
        ...(data.style === 'bordered'
          ? { borderColor: accentColor }
          : {}),
        ...(data.style === 'background'
          ? { backgroundColor: `${accentColor}12` }
          : {}),
        ...(data.media_url
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${data.media_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#ffffff',
            }
          : {}),
      }}
    >
      <p
        className={cn(
          'leading-relaxed',
          data.style === 'bold' && 'text-2xl md:text-3xl font-bold',
          data.style === 'bordered' && 'text-lg font-medium',
          data.style === 'background' && 'text-xl font-semibold',
          data.style === 'note' && 'text-base italic text-amber-900 dark:text-amber-200'
        )}
        style={{
          color: data.media_url
            ? '#ffffff'
            : data.style === 'note'
              ? undefined
              : 'var(--player-text)',
        }}
      >
        {data.text}
      </p>
    </motion.div>
  );
}
