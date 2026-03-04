'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerHeaderProps {
  courseName: string;
  moduleTitle: string;
  lessonTitle: string;
  overallProgress: number;
  direction: 'rtl' | 'ltr' | 'auto';
  onClose: () => void;
  logoUrl?: string;
}

export function PlayerHeader({
  courseName,
  moduleTitle,
  lessonTitle,
  overallProgress,
  direction,
  onClose,
  logoUrl,
}: PlayerHeaderProps) {
  return (
    <header
      className="h-14 border-b bg-card/95 backdrop-blur-sm flex items-center shrink-0 z-30"
      style={{ fontFamily: 'var(--player-font)' }}
    >
      {/* Close button */}
      <div className="flex items-center px-3 border-e h-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-muted/60"
          onClick={onClose}
          aria-label="Close course"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Logo (if provided) */}
      {logoUrl && (
        <div className="flex items-center px-3 border-e h-full">
          <img
            src={logoUrl}
            alt=""
            className="h-7 w-auto object-contain"
          />
        </div>
      )}

      {/* Course info */}
      <div className="flex-1 flex items-center gap-3 px-4 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--player-text)' }}>
            {courseName}
          </p>
          <p className="text-xs text-muted-foreground/60 truncate">
            {moduleTitle} — {lessonTitle}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-28 h-1.5 rounded-full bg-muted/60 overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: 'var(--player-primary)',
              }}
            />
          </div>
          <span
            className="text-xs font-semibold whitespace-nowrap tabular-nums"
            style={{ color: 'var(--player-primary)' }}
          >
            {overallProgress}%
          </span>
        </div>
      </div>
    </header>
  );
}
