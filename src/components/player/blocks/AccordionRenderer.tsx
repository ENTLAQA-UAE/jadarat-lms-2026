'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AccordionBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';
import { SafeHTML } from '@/components/shared/SafeHTML';

interface AccordionRendererProps {
  block: AccordionBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function AccordionRenderer({
  block,
  progress,
  onComplete,
  theme,
}: AccordionRendererProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (block.data.start_expanded) {
      return new Set(block.data.items.map((item) => item.id));
    }
    return new Set();
  });
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        if (!block.data.allow_multiple_open) {
          next.clear();
        }
        next.add(itemId);
      }
      return next;
    });

    // Track viewed items
    setViewedItems((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string) => {
      const items = block.data.items;
      const currentIndex = items.findIndex((i) => i.id === itemId);
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== null) {
        buttonRefs.current.get(items[nextIndex].id)?.focus();
      }
    },
    [block.data.items]
  );

  // Complete when all items have been viewed
  useEffect(() => {
    if (
      !progress?.completed &&
      viewedItems.size >= block.data.items.length &&
      block.data.items.length > 0
    ) {
      onComplete();
    }
  }, [viewedItems.size, block.data.items.length, progress?.completed, onComplete]);

  return (
    <div
      className="border rounded-lg divide-y overflow-hidden"
      role="region"
      aria-label="Accordion"
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      {block.data.items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                ref={(el) => {
                  if (el) buttonRefs.current.set(item.id, el);
                }}
                id={`accordion-header-${block.id}-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${block.id}-${item.id}`}
                className="w-full flex items-center gap-2 justify-between p-4 text-start hover:bg-accent/50 transition-colors"
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                style={{ color: isOpen ? 'var(--player-primary)' : undefined }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.icon && (
                    <span className="text-base shrink-0">{item.icon}</span>
                  )}
                  <span className="font-medium truncate">{item.title}</span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="shrink-0 rtl:-scale-x-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  role="region"
                  id={`accordion-panel-${block.id}-${item.id}`}
                  aria-labelledby={`accordion-header-${block.id}-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <SafeHTML
                    html={item.content}
                    className="p-4 pt-0 prose prose-sm max-w-none dark:prose-invert"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
