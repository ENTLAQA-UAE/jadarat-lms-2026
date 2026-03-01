'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HotspotBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

// ─── Explore Mode ────────────────────────────────────────────────────────────

interface HotspotExploreRendererProps {
  block: HotspotBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

function HotspotExploreRenderer({
  block,
  progress,
  onComplete,
}: HotspotExploreRendererProps) {
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [viewedRegions, setViewedRegions] = useState<Set<string>>(new Set());

  const handleRegionClick = (regionId: string) => {
    setActiveRegionId((prev) => (prev === regionId ? null : regionId));
    setViewedRegions((prev) => {
      const next = new Set(prev);
      next.add(regionId);
      return next;
    });
  };

  // Auto-complete: if no regions, complete immediately; otherwise after at least 1 viewed
  useEffect(() => {
    if (progress?.completed) return;

    if (block.data.regions.length === 0) {
      onComplete();
    } else if (viewedRegions.size > 0) {
      onComplete();
    }
  }, [
    viewedRegions.size,
    block.data.regions.length,
    progress?.completed,
    onComplete,
  ]);

  if (!block.data.image) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg bg-muted border border-dashed">
        <p className="text-sm text-muted-foreground">
          No image configured for this hotspot.
        </p>
      </div>
    );
  }

  return (
    <div className="relative select-none">
      <div className="relative overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.data.image}
          alt="Hotspot"
          className="w-full object-contain"
          loading="lazy"
        />

        {/* Region overlays */}
        {block.data.regions.map((region) => {
          const isActive = activeRegionId === region.id;
          const isViewed = viewedRegions.has(region.id);

          if (region.shape === 'circle') {
            const [x, y, radius] = region.coords;
            return (
              <div
                key={region.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                {/* Invisible clickable circle */}
                <button
                  type="button"
                  onClick={() => handleRegionClick(region.id)}
                  className={cn(
                    'rounded-full border-2 transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'border-primary bg-primary/20 scale-110'
                      : isViewed
                        ? 'border-primary/40 bg-primary/10 hover:bg-primary/20'
                        : 'border-transparent bg-transparent hover:bg-primary/10 hover:border-primary/30'
                  )}
                  style={{
                    width: `${radius * 2}vw`,
                    height: `${radius * 2}vw`,
                    maxWidth: `${radius * 2}%`,
                    maxHeight: `${radius * 2}%`,
                    minWidth: '24px',
                    minHeight: '24px',
                  }}
                  title={region.label}
                />

                {/* Tooltip */}
                {isActive && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56">
                    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-xl">
                      <div className="font-medium text-sm mb-1">
                        {region.label}
                      </div>
                      {region.content && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {region.content}
                        </p>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="h-2 w-2 rotate-45 border-b border-r bg-popover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            // rect
            const [x1, y1, x2, y2] = region.coords;
            return (
              <div
                key={region.id}
                className="absolute"
                style={{
                  left: `${x1}%`,
                  top: `${y1}%`,
                  width: `${x2 - x1}%`,
                  height: `${y2 - y1}%`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRegionClick(region.id)}
                  className={cn(
                    'w-full h-full border-2 transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'border-primary bg-primary/20'
                      : isViewed
                        ? 'border-primary/40 bg-primary/10 hover:bg-primary/20'
                        : 'border-transparent bg-transparent hover:bg-primary/10 hover:border-primary/30'
                  )}
                  title={region.label}
                />

                {/* Tooltip */}
                {isActive && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56">
                    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-xl">
                      <div className="font-medium text-sm mb-1">
                        {region.label}
                      </div>
                      {region.content && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {region.content}
                        </p>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="h-2 w-2 rotate-45 border-b border-r bg-popover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

// ─── Quiz Mode ───────────────────────────────────────────────────────────────

interface HotspotQuizRendererProps {
  block: HotspotBlock;
  progress?: BlockProgress;
  onComplete: (score: number, data: Record<string, unknown>) => void;
  theme: CourseTheme;
}

function HotspotQuizRenderer({
  block,
  progress,
  onComplete,
}: HotspotQuizRendererProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const points = 1; // Default 1 point

  const correctRegions = block.data.regions.filter((r) => r.is_correct);

  // Restore state from progress if already completed
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(() => {
    if (progress?.completed && progress.response_data) {
      const saved = (progress.response_data as Record<string, unknown>)
        ?.selected_regions as string[] | undefined;
      if (saved) return new Set(saved);
    }
    return new Set();
  });
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [clickFeedback, setClickFeedback] = useState<
    { x: number; y: number; correct: boolean }[]
  >([]);

  /** Check whether a point (percentage coords) falls inside a region */
  const isPointInRegion = useCallback(
    (
      px: number,
      py: number,
      region: HotspotBlock['data']['regions'][number]
    ): boolean => {
      if (region.shape === 'circle') {
        const [cx, cy, r] = region.coords;
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= r * r;
      } else {
        const [x1, y1, x2, y2] = region.coords;
        return px >= x1 && px <= x2 && py >= y1 && py <= y2;
      }
    },
    []
  );

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (submitted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if the click hits any correct region
    let hitCorrect = false;
    for (const region of block.data.regions) {
      if (isPointInRegion(px, py, region) && region.is_correct) {
        hitCorrect = true;
        setSelectedRegions((prev) => {
          const next = new Set(prev);
          next.add(region.id);
          return next;
        });
      }
    }

    // Show visual feedback at click position
    setClickFeedback((prev) => [...prev, { x: px, y: py, correct: hitCorrect }]);
  };

  const handleSubmit = () => {
    const correctHits = correctRegions.filter((r) =>
      selectedRegions.has(r.id)
    ).length;
    const totalCorrect = correctRegions.length;
    const earnedScore =
      totalCorrect > 0
        ? Math.round((correctHits / totalCorrect) * points * 100) / 100
        : points;

    setSubmitted(true);

    onComplete(earnedScore, {
      selected_regions: Array.from(selectedRegions),
      correct_hits: correctHits,
      total_correct: totalCorrect,
      is_correct: correctHits === totalCorrect,
    });
  };

  const handleRetry = () => {
    setSelectedRegions(new Set());
    setSubmitted(false);
    setClickFeedback([]);
  };

  const correctHits = correctRegions.filter((r) =>
    selectedRegions.has(r.id)
  ).length;
  const isAllCorrect = submitted && correctHits === correctRegions.length;

  if (!block.data.image) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg bg-muted border border-dashed">
        <p className="text-sm text-muted-foreground">
          No image configured for this hotspot.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Instruction */}
      <h3 className="font-medium text-lg">Click on the correct area(s)</h3>

      {/* Image with clickable overlay */}
      <div
        ref={imageRef}
        className={cn(
          'relative overflow-hidden rounded-lg',
          !submitted && 'cursor-crosshair'
        )}
        onClick={handleImageClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.data.image}
          alt="Hotspot quiz"
          className="w-full object-contain"
          loading="lazy"
        />

        {/* Click feedback dots */}
        {clickFeedback.map((fb, i) => (
          <div
            key={i}
            className={cn(
              'absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md',
              fb.correct ? 'bg-green-500' : 'bg-red-500'
            )}
            style={{ left: `${fb.x}%`, top: `${fb.y}%` }}
          />
        ))}

        {/* After submit: reveal all regions with correct/incorrect coloring */}
        {submitted &&
          block.data.regions.map((region) => {
            const isCorrect = region.is_correct;
            const wasSelected = selectedRegions.has(region.id);

            if (region.shape === 'circle') {
              const [x, y, radius] = region.coords;
              return (
                <div
                  key={region.id}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
                    isCorrect
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-red-500 bg-red-500/20'
                  )}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${radius * 2}%`,
                    height: `${radius * 2}%`,
                    minWidth: '20px',
                    minHeight: '20px',
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {isCorrect ? (
                      <CheckCircle2
                        className={cn(
                          'w-5 h-5',
                          wasSelected ? 'text-green-600' : 'text-green-400'
                        )}
                      />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              );
            } else {
              const [x1, y1, x2, y2] = region.coords;
              return (
                <div
                  key={region.id}
                  className={cn(
                    'absolute border-2 flex items-center justify-center',
                    isCorrect
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-red-500 bg-red-500/20'
                  )}
                  style={{
                    left: `${x1}%`,
                    top: `${y1}%`,
                    width: `${x2 - x1}%`,
                    height: `${y2 - y1}%`,
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle2
                      className={cn(
                        'w-5 h-5',
                        wasSelected ? 'text-green-600' : 'text-green-400'
                      )}
                    />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              );
            }
          })}
      </div>

      {/* Status indicator */}
      {!submitted && selectedRegions.size > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedRegions.size} region{selectedRegions.size !== 1 ? 's' : ''}{' '}
          selected. Click more areas or submit your answer.
        </p>
      )}

      {/* Result */}
      {submitted && (
        <div
          className={cn(
            'p-3 rounded-lg text-sm',
            isAllCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            {isAllCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correct! You found all the
                right areas.
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> You found {correctHits} of{' '}
                {correctRegions.length} correct area
                {correctRegions.length !== 1 ? 's' : ''}.
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button onClick={handleSubmit} disabled={selectedRegions.size === 0}>
            Submit Answer
          </Button>
        )}
        {submitted && !isAllCorrect && (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Renderer (delegates to explore or quiz) ────────────────────────────

interface HotspotRendererProps {
  block: HotspotBlock;
  progress?: BlockProgress;
  onComplete: ((score: number, data: Record<string, unknown>) => void) | (() => void);
  theme: CourseTheme;
}

export function HotspotRenderer({
  block,
  progress,
  onComplete,
  theme,
}: HotspotRendererProps) {
  if (block.data.mode === 'quiz') {
    return (
      <HotspotQuizRenderer
        block={block}
        progress={progress}
        onComplete={onComplete as (score: number, data: Record<string, unknown>) => void}
        theme={theme}
      />
    );
  }

  return (
    <HotspotExploreRenderer
      block={block}
      progress={progress}
      onComplete={onComplete as () => void}
      theme={theme}
    />
  );
}
