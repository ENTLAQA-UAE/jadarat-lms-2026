'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PlayerNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  direction: 'rtl' | 'ltr' | 'auto';
}

export function PlayerNavigation({
  onPrevious,
  onNext,
  isFirstLesson,
  isLastLesson,
  direction,
}: PlayerNavigationProps) {
  const isRTL = direction === 'rtl';
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-between pt-8 border-t mt-12">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstLesson}
        className="gap-2 transition-all duration-200 hover:gap-3"
        style={{ borderRadius: 'var(--player-radius)' }}
      >
        <PrevIcon className="w-4 h-4" />
        Previous
      </Button>

      <Button
        onClick={onNext}
        disabled={isLastLesson}
        className="gap-2 text-white transition-all duration-200 hover:gap-3 hover:brightness-110 shadow-sm"
        style={{
          backgroundColor: 'var(--player-primary)',
          borderRadius: 'var(--player-radius)',
        }}
      >
        {isLastLesson ? 'Complete' : 'Next'}
        {!isLastLesson && <NextIcon className="w-4 h-4" />}
      </Button>
    </div>
  );
}
