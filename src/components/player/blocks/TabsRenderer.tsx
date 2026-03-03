'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TabsBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

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
      className={cn('border rounded-lg', isVertical ? 'flex' : '')}
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
          return (
            <button
              key={tab.id}
              className={cn(
                'px-4 py-3 text-sm font-medium text-start whitespace-nowrap transition-colors',
                !isActive && 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                !isVertical && isActive && 'border-b-2 -mb-px',
                isVertical && isActive && 'border-e-2 -me-px'
              )}
              style={
                isActive
                  ? {
                      color: 'var(--player-primary)',
                      borderColor: 'var(--player-primary)',
                      backgroundColor: 'color-mix(in srgb, var(--player-primary) 10%, transparent)',
                    }
                  : undefined
              }
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon && <span className="me-2">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeContent && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: activeContent.content }}
          />
        )}
      </div>
    </div>
  );
}
