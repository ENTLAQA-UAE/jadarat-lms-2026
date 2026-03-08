'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LayoutGrid, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashcardBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface FlashcardRendererProps {
  block: FlashcardBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

type LayoutMode = 'stack' | 'grid';

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
  const [flippedCards, setFlippedCards] = useState<Set<string>>(() => new Set());
  const [viewedCards, setViewedCards] = useState<Set<string>>(() => new Set());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stack');

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

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
    markViewed(cardId);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  // Keyboard navigation for stack mode
  const handleStackKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (currentCard) toggleFlip(currentCard.id);
          break;
      }
    },
    [cards.length, currentCard]
  );

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
      className="space-y-4"
      style={{
        fontFamily: 'var(--player-font)',
      }}
    >
      {/* Mode toggle (only show if > 1 card) */}
      {cards.length > 1 && (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant={layoutMode === 'stack' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            style={layoutMode === 'stack' ? { backgroundColor: 'var(--player-primary)' } : undefined}
            onClick={() => setLayoutMode('stack')}
            aria-label="Stack view"
            aria-pressed={layoutMode === 'stack'}
          >
            <Layers className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={layoutMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            style={layoutMode === 'grid' ? { backgroundColor: 'var(--player-primary)' } : undefined}
            onClick={() => setLayoutMode('grid')}
            aria-label="Grid view"
            aria-pressed={layoutMode === 'grid'}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {layoutMode === 'stack' ? (
        /* -- STACK MODE -- */
        <>
          {/* Card container with flip animation */}
          <div
            className="relative mx-auto w-full max-w-lg cursor-pointer"
            style={{ perspective: '1200px' }}
            onClick={() => currentCard && toggleFlip(currentCard.id)}
            role="group"
            aria-roledescription="carousel"
            aria-label={`Flashcard ${currentIndex + 1} of ${cards.length}`}
            tabIndex={0}
            onKeyDown={handleStackKeyDown}
          >
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {`Card ${currentIndex + 1} of ${cards.length}. ${flippedCards.has(currentCard?.id ?? '') ? 'Showing back side.' : 'Showing front side.'}`}
            </div>
            <motion.div
              className="relative w-full min-h-[260px]"
              style={{
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: flippedCards.has(currentCard?.id ?? '') ? 180 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              {/* Front face */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-card p-8 text-center shadow-sm"
                style={{
                  backfaceVisibility: 'hidden',
                  borderRadius: 'var(--player-radius)',
                  borderColor: 'color-mix(in srgb, var(--player-primary) 20%, transparent)',
                }}
                aria-hidden={flippedCards.has(currentCard?.id ?? '')}
              >
                {currentCard?.image_front && (
                  <img
                    src={currentCard.image_front}
                    alt=""
                    className="mb-4 max-h-[120px] rounded-lg object-contain"
                  />
                )}
                <p className="text-lg font-semibold leading-snug" style={{ color: 'var(--player-text)' }}>
                  {currentCard?.front}
                </p>
                <p className="mt-4 text-xs text-muted-foreground/60">
                  Click or press Space to flip
                </p>
              </div>

              {/* Back face */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 p-8 text-center shadow-sm"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 'var(--player-radius)',
                  backgroundColor: 'color-mix(in srgb, var(--player-primary) 5%, var(--player-bg, white))',
                  borderColor: 'var(--player-primary)',
                }}
                aria-hidden={!flippedCards.has(currentCard?.id ?? '')}
              >
                {currentCard?.image_back && (
                  <img
                    src={currentCard.image_back}
                    alt=""
                    className="mb-4 max-h-[120px] rounded-lg object-contain"
                  />
                )}
                <p className="text-lg font-semibold leading-snug" style={{ color: 'var(--player-text)' }}>
                  {currentCard?.back}
                </p>
                <p className="mt-4 text-xs text-muted-foreground/60">
                  Click or press Space to flip back
                </p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              disabled={currentIndex === 0}
              aria-label="Previous card"
              style={{ borderRadius: 'var(--player-radius)' }}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>

            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {currentIndex + 1} of {cards.length}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === cards.length - 1}
              aria-label="Next card"
              style={{ borderRadius: 'var(--player-radius)' }}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5" role="tablist" aria-label="Flashcard navigation">
            {cards.map((card, index) => (
              <button
                key={card.id}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to card ${index + 1}${viewedCards.has(card.id) ? ' (viewed)' : ''}`}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: index === currentIndex ? '20px' : '8px',
                  backgroundColor:
                    index === currentIndex
                      ? 'var(--player-primary)'
                      : viewedCards.has(card.id)
                        ? 'color-mix(in srgb, var(--player-primary) 35%, transparent)'
                        : 'hsl(var(--muted-foreground) / 0.15)',
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      ) : (
        /* -- GRID MODE -- */
        <div
          className={cn(
            'grid gap-4',
            cards.length === 1 && 'grid-cols-1 max-w-sm mx-auto',
            cards.length === 2 && 'grid-cols-2',
            cards.length >= 3 && 'grid-cols-2 md:grid-cols-3',
          )}
          role="list"
          aria-label="Flashcards grid"
        >
          {cards.map((card) => {
            const isFlipped = flippedCards.has(card.id);
            return (
              <div
                key={card.id}
                role="listitem"
                className="cursor-pointer"
                style={{ perspective: '1200px' }}
                onClick={() => toggleFlip(card.id)}
                tabIndex={0}
                aria-label={`Flashcard: ${isFlipped ? card.back : card.front}. Press to flip.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFlip(card.id);
                  }
                }}
              >
                <motion.div
                  className="relative w-full min-h-[180px]"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-card p-5 text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      borderRadius: 'var(--player-radius)',
                      borderColor: viewedCards.has(card.id)
                        ? 'color-mix(in srgb, var(--player-primary) 30%, transparent)'
                        : 'hsl(var(--border))',
                    }}
                  >
                    {card.image_front && (
                      <img src={card.image_front} alt="" className="mb-3 max-h-[80px] rounded object-contain" />
                    )}
                    <p className="text-sm font-medium leading-snug">{card.front}</p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 p-5 text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: 'var(--player-radius)',
                      backgroundColor: 'color-mix(in srgb, var(--player-primary) 5%, var(--player-bg, white))',
                      borderColor: 'var(--player-primary)',
                    }}
                  >
                    {card.image_back && (
                      <img src={card.image_back} alt="" className="mb-3 max-h-[80px] rounded object-contain" />
                    )}
                    <p className="text-sm font-medium leading-snug">{card.back}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion progress text */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground/50">
          {viewedCards.size} of {cards.length} cards viewed
        </span>
      </div>
    </div>
  );
}
