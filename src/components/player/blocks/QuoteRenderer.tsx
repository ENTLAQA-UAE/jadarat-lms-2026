'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { QuoteBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface QuoteRendererProps {
  block: QuoteBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function QuoteRenderer({
  block,
  progress,
  onComplete,
}: QuoteRendererProps) {
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { text, attribution, style } = block.data;

  // Build quotes array — use new multi-quote field if available, otherwise single quote
  const quotes =
    block.data.quotes && block.data.quotes.length > 0
      ? block.data.quotes
      : [{ id: 'single', text, attribution: attribution || '' }];

  const isCarousel = block.data.carousel && quotes.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (!isCarousel) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCarousel, quotes.length]);

  const goTo = useCallback(
    (idx: number) => setCurrentIndex(idx),
    [],
  );

  const currentQuote = quotes[currentIndex];

  const renderQuote = (q: { text: string; attribution?: string }, key?: string) => {
    if (style === 'large') {
      return (
        <blockquote key={key} className="text-center py-6">
          <div className="text-4xl leading-none mb-4" style={{ color: 'var(--player-primary)' }}>&ldquo;</div>
          <p className="text-2xl font-medium italic" style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}>{q.text}</p>
          <div className="text-4xl leading-none mt-4" style={{ color: 'var(--player-primary)' }}>&rdquo;</div>
          {q.attribution && <footer className="mt-4 text-sm text-muted-foreground">&mdash; {q.attribution}</footer>}
        </blockquote>
      );
    }

    if (style === 'highlight') {
      return (
        <blockquote key={key} className="rounded-lg p-6" style={{ backgroundColor: 'color-mix(in srgb, var(--player-primary) 10%, transparent)' }}>
          <p className="text-base" style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}>{q.text}</p>
          {q.attribution && <footer className="mt-3 text-sm text-muted-foreground">&mdash; {q.attribution}</footer>}
        </blockquote>
      );
    }

    // Default style
    return (
      <blockquote key={key} className="py-4 ps-4" style={{ borderInlineStart: '4px solid var(--player-primary)' }}>
        <p className="text-base italic" style={{ color: 'var(--player-text)', fontFamily: 'var(--player-font)' }}>{q.text}</p>
        {q.attribution && <footer className="mt-2 text-sm text-muted-foreground">&mdash; {q.attribution}</footer>}
      </blockquote>
    );
  };

  // Non-carousel: render single quote
  if (!isCarousel) {
    return renderQuote(currentQuote);
  }

  // Carousel mode
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {renderQuote(currentQuote)}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length)}
          className="h-8 w-8 flex items-center justify-center rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="h-2 w-2 rounded-full transition-all"
              style={{
                backgroundColor: idx === currentIndex ? 'var(--player-primary)' : 'var(--player-primary)',
                opacity: idx === currentIndex ? 1 : 0.25,
                transform: idx === currentIndex ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % quotes.length)}
          className="h-8 w-8 flex items-center justify-center rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
