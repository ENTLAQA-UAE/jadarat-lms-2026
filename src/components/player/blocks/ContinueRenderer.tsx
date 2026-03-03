'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContinueBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ContinueRendererProps {
  block: ContinueBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
  /** Whether all requirements above have been met */
  isUnlocked: boolean;
}

export function ContinueRenderer({
  block,
  progress,
  onComplete,
  theme,
  isUnlocked,
}: ContinueRendererProps) {
  const { data } = block;
  const [clicked, setClicked] = useState(progress?.completed ?? false);

  // If completion_type is 'none', always unlocked
  const effectiveUnlocked =
    data.completion_type === 'none' ? true : isUnlocked;

  const handleClick = () => {
    if (!effectiveUnlocked || clicked) return;
    setClicked(true);
    onComplete();
  };

  if (clicked) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5 }}
        className="flex justify-center py-4"
      >
        <div
          className="inline-flex items-center gap-2 rounded-md px-8 py-3 text-sm font-medium opacity-60"
          style={{
            backgroundColor: 'var(--player-primary)',
            color: '#ffffff',
            borderRadius: 'var(--player-radius)',
            fontFamily: 'var(--player-font)',
          }}
        >
          {data.label || 'Continue'}
          <ArrowDown className="h-4 w-4" />
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex justify-center py-6"
      style={{ fontFamily: 'var(--player-font)' }}
    >
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={!effectiveUnlocked}
        whileHover={effectiveUnlocked ? { scale: 1.02 } : {}}
        whileTap={effectiveUnlocked ? { scale: 0.98 } : {}}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-8 py-3 text-sm font-semibold transition-all',
          effectiveUnlocked
            ? 'text-white shadow-md hover:shadow-lg cursor-pointer'
            : 'opacity-50 cursor-not-allowed text-white'
        )}
        style={{
          backgroundColor: 'var(--player-primary)',
          borderRadius: 'var(--player-radius)',
        }}
      >
        {!effectiveUnlocked && <Lock className="h-4 w-4" />}
        {data.label || 'Continue'}
        {effectiveUnlocked && <ArrowDown className="h-4 w-4" />}
      </motion.button>

      {!effectiveUnlocked && (
        <p className="absolute mt-14 text-xs text-muted-foreground">
          Complete the content above to continue
        </p>
      )}
    </div>
  );
}
