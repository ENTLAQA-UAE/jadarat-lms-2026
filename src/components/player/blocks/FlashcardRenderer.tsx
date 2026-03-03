'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashcardBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface FlashcardRendererProps {
  block: FlashcardBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function FlashcardRenderer({
  block,
  progress,
  onComplete,
  theme,
}: FlashcardRendererProps) {
  const cards = useMemo(() => {
    if (block.data.shuffle) {
      return [...block.data.cards].sort(() => Math.random() - 0.5);
    }
    return block.data.cards;
  }, [block.data.cards, block.data.shuffle]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<string>>(() => new Set());

  const currentCard = cards[currentIndex];

  const markViewed = useCallback(
    (cardId: string) => {
      setViewedCards((prev) => {
        if (prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.add(cardId);
        return next;
      });
    },
    []
  );

  const handleFlip = () => {
    setFlipped((prev) => !prev);
    if (currentCard) {
      markViewed(currentCard.id);
    }
  };

  const handlePrevious = () => {
    setFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  // Auto-complete when all cards have been flipped/viewed
  useEffect(() => {
    if (
      !progress?.completed &&
      viewedCards.size >= cards.length &&
      cards.length > 0
    ) {
      onComplete();
    }
  }, [viewedCards.size, cards.length, progress?.completed, onComplete]);

  if (cards.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        No flashcards available.
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg p-6 space-y-4"
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      {/* Card container with flip animation */}
      <div
        className="relative mx-auto w-full max-w-lg cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <div
          className={cn(
            'relative w-full min-h-[240px] transition-transform duration-500'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {currentCard.image_front && (
              <img
                src={currentCard.image_front}
                alt=""
                className="mb-3 max-h-[100px] rounded object-contain"
              />
            )}
            <p className="text-lg font-medium">{currentCard.front}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Click to flip
            </p>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {currentCard.image_back && (
              <img
                src={currentCard.image_back}
                alt=""
                className="mb-3 max-h-[100px] rounded object-contain"
              />
            )}
            <p className="text-lg font-medium">{currentCard.back}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Click to flip back
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{
              backgroundColor:
                index === currentIndex
                  ? 'var(--player-primary)'
                  : viewedCards.has(card.id)
                    ? 'color-mix(in srgb, var(--player-primary) 40%, transparent)'
                    : 'hsl(var(--muted-foreground) / 0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
