'use client';

import { useState } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CalloutBlock, CourseTheme } from '@/types/authoring';
import { SafeHTML } from '@/components/shared/SafeHTML';

interface CalloutRendererProps {
  block: CalloutBlock;
  theme: CourseTheme;
}

const VARIANT_STYLES = {
  info: {
    icon: Info,
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500',
  },
  success: {
    icon: CheckCircle2,
    border: 'border-green-300 dark:border-green-700',
    bg: 'bg-green-50 dark:bg-green-950/50',
    text: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50 dark:bg-red-950/50',
    text: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500',
  },
} as const;

export function CalloutRenderer({ block, theme }: CalloutRendererProps) {
  const [isOpen, setIsOpen] = useState(!block.data.collapsible);
  const style = VARIANT_STYLES[block.data.variant] || VARIANT_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4',
        style.border,
        style.bg,
        style.text
      )}
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      <button
        type="button"
        className={cn(
          'w-full flex items-center gap-3 p-4 text-start',
          block.data.collapsible && 'cursor-pointer hover:opacity-80'
        )}
        onClick={() => block.data.collapsible && setIsOpen((o) => !o)}
        disabled={!block.data.collapsible}
      >
        {block.data.icon ? (
          <span className="text-lg shrink-0">{block.data.icon}</span>
        ) : (
          <Icon className={cn('h-5 w-5 shrink-0', style.iconColor)} />
        )}
        <span className="font-semibold text-sm flex-1">{block.data.title}</span>
        {block.data.collapsible && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && block.data.content && (
          <motion.div
            initial={block.data.collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <SafeHTML
              html={block.data.content}
              className="px-4 pb-4 pl-12 prose prose-sm max-w-none dark:prose-invert opacity-90"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
