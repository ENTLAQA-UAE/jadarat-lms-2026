'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccordionBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

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
      className="border rounded-lg divide-y"
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      {block.data.items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id}>
            <button
              className="w-full flex items-center justify-between p-4 text-start hover:bg-accent/50 transition-colors"
              onClick={() => toggleItem(item.id)}
              style={{ color: isOpen ? 'var(--player-primary)' : undefined }}
            >
              <span className="font-medium">{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 shrink-0 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen && (
              <div
                className="p-4 pt-0 prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
