'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerHeaderProps {
  courseName: string;
  moduleTitle: string;
  lessonTitle: string;
  overallProgress: number;
  direction: 'rtl' | 'ltr' | 'auto';
  onClose: () => void;
}

export function PlayerHeader({
  courseName,
  moduleTitle,
  lessonTitle,
  overallProgress,
  direction,
  onClose,
}: PlayerHeaderProps) {
  return (
    <header
      className="h-14 border-b bg-card flex items-center shrink-0 z-30"
      style={{ fontFamily: 'var(--player-font)' }}
    >
      {/* Close button */}
      <div className="flex items-center px-3 border-e h-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label="Close course"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Course info */}
      <div className="flex-1 flex items-center gap-3 px-4 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--player-text)' }}>
            {courseName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {moduleTitle} — {lessonTitle}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 px-4">
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {overallProgress}%
        </span>
        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden hidden sm:block">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out'
            )}
            style={{
              width: `${overallProgress}%`,
              backgroundColor: 'var(--player-primary)',
            }}
          />
        </div>
      </div>
    </header>
  );
}
