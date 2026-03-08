'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TabsBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';
import { SafeHTML } from '@/components/shared/SafeHTML';

interface TabsRendererProps {
  block: TabsBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function TabsRenderer({
  block,
  progress,
  onComplete,
  theme,
}: TabsRendererProps) {
  const [activeTab, setActiveTab] = useState(block.data.tabs[0]?.id ?? '');
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(
    () => new Set(block.data.tabs[0] ? [block.data.tabs[0].id] : [])
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setViewedTabs((prev) => {
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  };

  // Complete when all tabs have been viewed
  useEffect(() => {
    if (
      !progress?.completed &&
      viewedTabs.size >= block.data.tabs.length &&
      block.data.tabs.length > 0
    ) {
      onComplete();
    }
  }, [viewedTabs.size, block.data.tabs.length, progress?.completed, onComplete]);

  const activeContent = block.data.tabs.find((t) => t.id === activeTab);
  const isVertical = block.data.style === 'vertical';

  return (
    <div
      className={cn('border rounded-lg overflow-hidden', isVertical ? 'flex' : '')}
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      {/* Tab headers */}
      <div
        className={cn(
          isVertical
            ? 'flex flex-col border-e min-w-[180px]'
            : 'flex border-b overflow-x-auto'
        )}
      >
        {block.data.tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isViewed = viewedTabs.has(tab.id);
          return (
            <button
              key={tab.id}
              className={cn(
                'relative px-4 py-3 text-sm font-medium text-start whitespace-nowrap transition-all duration-200',
                !isActive && 'text-muted-foreground hover:text-foreground hover:bg-accent/30',
              )}
              style={
                isActive
                  ? {
                      color: 'var(--player-primary)',
                      backgroundColor: 'color-mix(in srgb, var(--player-primary) 8%, transparent)',
                    }
                  : undefined
              }
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon && <span className="me-2">{tab.icon}</span>}
              {tab.label}
              {/* Viewed indicator dot */}
              {isViewed && !isActive && (
                <span
                  className="absolute top-2 end-2 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--player-primary) 40%, transparent)' }}
                />
              )}
              {/* Active underline/border */}
              {isActive && !isVertical && (
                <motion.div
                  layoutId={`tab-indicator-${block.id}`}
                  className="absolute bottom-0 inset-x-0 h-0.5"
                  style={{ backgroundColor: 'var(--player-primary)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {isActive && isVertical && (
                <motion.div
                  layoutId={`tab-indicator-${block.id}`}
                  className="absolute inset-y-0 end-0 w-0.5"
                  style={{ backgroundColor: 'var(--player-primary)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content with animation */}
      <div className="p-5 min-h-[100px]">
        <AnimatePresence mode="wait">
          {activeContent && (
            <motion.div
              key={activeContent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <SafeHTML
                html={activeContent.content}
                className="prose prose-sm max-w-none dark:prose-invert"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
