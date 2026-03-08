'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchingBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface MatchingRendererProps {
  block: MatchingBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

/* ------------------------------------------------------------------ */
/* Draggable left item                                                */
/* ------------------------------------------------------------------ */
function DraggableLeftItem({
  id,
  text,
  disabled,
  isMatched,
  colorClass,
}: {
  id: string;
  text: string;
  disabled: boolean;
  isMatched: boolean;
  colorClass: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `left-${id}`,
    data: { pairId: id },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-pair-id={id}
      data-side="left"
      className={cn(
        'flex items-center gap-2 w-full p-3 rounded-lg border-2 text-start transition-all select-none',
        isDragging && 'opacity-30',
        !disabled && !isMatched && 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 border-border',
        !disabled && isMatched && `cursor-grab ${colorClass}`,
        disabled && 'cursor-default',
      )}
    >
      {!disabled && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
      <span className="flex-1">{text}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Droppable right item                                               */
/* ------------------------------------------------------------------ */
function DroppableRightItem({
  id,
  text,
  disabled,
  isMatched,
  colorClass,
}: {
  id: string;
  text: string;
  disabled: boolean;
  isMatched: boolean;
  colorClass: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `right-${id}`,
    data: { rightPairId: id },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      data-pair-id={id}
      data-side="right"
      className={cn(
        'w-full p-3 rounded-lg border-2 text-start transition-all',
        isOver && !disabled && 'border-primary bg-primary/5 scale-[1.02]',
        !isOver && !isMatched && 'border-border',
        !isOver && isMatched && colorClass,
        disabled && 'cursor-default',
      )}
    >
      <span className="flex-1">{text}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SVG connector lines between matched pairs                          */
/* ------------------------------------------------------------------ */
const CONNECTOR_COLORS = [
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#ec4899', // pink
  '#6366f1', // indigo
  '#f97316', // orange
  '#06b6d4', // cyan
];

function ConnectorLines({
  matches,
  containerRef,
  submitted,
  isPairCorrect,
}: {
  matches: Map<string, string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  submitted: boolean;
  isPairCorrect: (pairId: string) => boolean;
}) {
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; color: string }[]
  >([]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: typeof lines = [];
    let colorIdx = 0;

    matches.forEach((rightPairId, leftPairId) => {
      const leftEl = containerRef.current?.querySelector(
        `[data-pair-id="${leftPairId}"][data-side="left"]`,
      );
      const rightEl = containerRef.current?.querySelector(
        `[data-pair-id="${rightPairId}"][data-side="right"]`,
      );
      if (!leftEl || !rightEl) return;

      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();

      let color: string;
      if (submitted) {
        color = isPairCorrect(leftPairId) ? '#22c55e' : '#ef4444';
      } else {
        color = CONNECTOR_COLORS[colorIdx % CONNECTOR_COLORS.length];
      }

      newLines.push({
        x1: leftRect.right - containerRect.left,
        y1: leftRect.top + leftRect.height / 2 - containerRect.top,
        x2: rightRect.left - containerRect.left,
        y2: rightRect.top + rightRect.height / 2 - containerRect.top,
        color,
      });
      colorIdx++;
    });
    setLines(newLines);
  }, [matches, containerRef, submitted, isPairCorrect]);

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [updateLines]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {lines.map((line, i) => (
        <motion.path
          key={i}
          d={`M ${line.x1} ${line.y1} C ${line.x1 + 30} ${line.y1}, ${line.x2 - 30} ${line.y2}, ${line.x2} ${line.y2}`}
          stroke={line.color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export function MatchingRenderer({
  block,
  progress,
  onComplete,
}: MatchingRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [matches, setMatches] = useState<Map<string, string>>(() => {
    if (progress?.completed && progress.response_data) {
      const savedMatches = (progress.response_data as Record<string, unknown>)
        ?.matches as Record<string, string> | undefined;
      if (savedMatches) return new Map(Object.entries(savedMatches));
    }
    return new Map();
  });
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [score, setScore] = useState<number | null>(
    progress?.completed ? (progress.score ?? null) : null,
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const pairs = block.data.pairs;
  const totalPairs = pairs.length;

  const shuffledRightItems = useMemo(() => {
    const rightItems = pairs.map((pair) => ({
      pairId: pair.id,
      text: pair.right,
    }));
    if (block.data.shuffle) {
      return [...rightItems].sort(() => Math.random() - 0.5);
    }
    return rightItems;
  }, [pairs, block.data.shuffle]);

  const matchColors = [
    'bg-blue-100 border-blue-400 dark:bg-blue-950/30 dark:border-blue-700',
    'bg-purple-100 border-purple-400 dark:bg-purple-950/30 dark:border-purple-700',
    'bg-amber-100 border-amber-400 dark:bg-amber-950/30 dark:border-amber-700',
    'bg-teal-100 border-teal-400 dark:bg-teal-950/30 dark:border-teal-700',
    'bg-pink-100 border-pink-400 dark:bg-pink-950/30 dark:border-pink-700',
    'bg-indigo-100 border-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-700',
    'bg-orange-100 border-orange-400 dark:bg-orange-950/30 dark:border-orange-700',
    'bg-cyan-100 border-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-700',
  ];

  const matchColorMap = useMemo(() => {
    const map = new Map<string, number>();
    let colorIndex = 0;
    for (const pairId of Array.from(matches.keys())) {
      map.set(pairId, colorIndex % matchColors.length);
      colorIndex++;
    }
    return map;
  }, [matches, matchColors.length]);

  const activeItem = activeId
    ? pairs.find((p) => p.id === activeId)
    : null;

  const isPairCorrect = useCallback(
    (pairId: string): boolean => {
      const pair = pairs.find((p) => p.id === pairId);
      if (!pair) return false;
      const matchedRightPairId = matches.get(pairId);
      if (!matchedRightPairId) return false;
      const rightPair = pairs.find((p) => p.id === matchedRightPairId);
      return rightPair?.right === pair.right;
    },
    [pairs, matches],
  );

  const getRightMatchedPairId = (rightPairId: string): string | null => {
    for (const [leftPairId, val] of Array.from(matches.entries())) {
      if (val === rightPairId) return leftPairId;
    }
    return null;
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const pairId = (event.active.data.current as { pairId: string })?.pairId;
    setActiveId(pairId ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      if (submitted) return;

      const { active, over } = event;
      if (!over) return;

      const leftPairId = (active.data.current as { pairId: string })?.pairId;
      const rightPairId = (over.data.current as { rightPairId: string })?.rightPairId;
      if (!leftPairId || !rightPairId) return;

      setMatches((prev) => {
        const next = new Map(prev);
        // Remove any existing match to this right item
        for (const [key, val] of Array.from(next.entries())) {
          if (val === rightPairId) {
            next.delete(key);
            break;
          }
        }
        next.set(leftPairId, rightPairId);
        return next;
      });
    },
    [submitted],
  );

  const handleSubmit = () => {
    if (matches.size !== totalPairs) return;

    let correctCount = 0;
    for (const pair of pairs) {
      const matchedRightPairId = matches.get(pair.id);
      if (matchedRightPairId) {
        const rightPair = pairs.find((p) => p.id === matchedRightPairId);
        if (rightPair?.right === pair.right) correctCount++;
      }
    }

    const earnedScore =
      totalPairs > 0
        ? Math.round((correctCount / totalPairs) * block.data.points)
        : 0;

    setScore(earnedScore);
    setSubmitted(true);

    const matchesObj: Record<string, string> = {};
    for (const [key, val] of Array.from(matches.entries())) {
      matchesObj[key] = val;
    }

    onComplete(earnedScore, {
      matches: matchesObj,
      correct_count: correctCount,
      total_pairs: totalPairs,
    });
  };

  const handleRetry = () => {
    setMatches(new Map());
    setSubmitted(false);
    setScore(null);
  };

  const isFullyCorrect = submitted && score === block.data.points;

  return (
    <div
      className="border rounded-lg p-6 space-y-4"
      style={{ borderRadius: 'var(--player-radius)', fontFamily: 'var(--player-font)' }}
    >
      <h3 className="font-medium text-lg">{block.data.instruction}</h3>

      {!submitted && (
        <p className="text-sm text-muted-foreground">
          Drag items from the left to their matching pair on the right, or use the select buttons for keyboard access.
        </p>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div ref={containerRef} className="relative grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* SVG connector lines */}
          <ConnectorLines
            matches={matches}
            containerRef={containerRef}
            submitted={submitted}
            isPairCorrect={isPairCorrect}
          />

          {/* Left column - Draggable prompts */}
          <div className="space-y-2 relative z-20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Items
            </p>
            {pairs.map((pair) => {
              const isMatched = matches.has(pair.id);
              const colorIndex = matchColorMap.get(pair.id);
              const colorClass =
                isMatched && colorIndex !== undefined ? matchColors[colorIndex] : '';

              if (submitted) {
                const correct = isPairCorrect(pair.id);
                return (
                  <div
                    key={pair.id}
                    data-pair-id={pair.id}
                    data-side="left"
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-start',
                      correct
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-950/20',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1">{pair.left}</span>
                      {correct ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <DraggableLeftItem
                  key={pair.id}
                  id={pair.id}
                  text={pair.left}
                  disabled={submitted}
                  isMatched={isMatched}
                  colorClass={colorClass}
                />
              );
            })}
          </div>

          {/* Right column - Droppable targets */}
          <div className="space-y-2 relative z-20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Matches
            </p>
            {shuffledRightItems.map((item) => {
              const matchedLeftPairId = getRightMatchedPairId(item.pairId);
              const isMatched = matchedLeftPairId !== null;
              const colorIndex =
                matchedLeftPairId !== null
                  ? matchColorMap.get(matchedLeftPairId)
                  : undefined;
              const colorClass =
                isMatched && colorIndex !== undefined ? matchColors[colorIndex] : '';

              if (submitted) {
                const matchedCorrectly =
                  matchedLeftPairId !== null && isPairCorrect(matchedLeftPairId);
                return (
                  <div
                    key={item.pairId}
                    data-pair-id={item.pairId}
                    data-side="right"
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-start',
                      matchedLeftPairId !== null && matchedCorrectly
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : matchedLeftPairId !== null
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'opacity-60',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1">{item.text}</span>
                      {matchedLeftPairId !== null && matchedCorrectly && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      {matchedLeftPairId !== null && !matchedCorrectly && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <DroppableRightItem
                  key={item.pairId}
                  id={item.pairId}
                  text={item.text}
                  disabled={submitted}
                  isMatched={isMatched}
                  colorClass={colorClass}
                />
              );
            })}
          </div>
        </div>

        {/* Drag overlay (ghost card) */}
        <DragOverlay dropAnimation={null}>
          {activeItem && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-primary bg-primary/5 text-sm shadow-lg scale-105">
              <GripVertical className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              {activeItem.left}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Result & explanation */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-3 rounded-lg text-sm',
            isFullyCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300',
          )}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {isFullyCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correct! All pairs matched.
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> {score} / {block.data.points} points
              </>
            )}
          </div>
          {block.data.explanation && <p>{block.data.explanation}</p>}
        </motion.div>
      )}

      {/* Keyboard-accessible matching (alternative to drag) */}
      {!submitted && (
        <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">Keyboard matching</p>
          {pairs.map((pair) => {
            const currentMatch = matches.get(pair.id);
            return (
              <div key={pair.id} className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium min-w-[120px]">{pair.left}</span>
                <select
                  aria-label={`Match for: ${pair.left}`}
                  className="text-sm border rounded px-2 py-1 bg-background"
                  value={currentMatch ?? ''}
                  onChange={(e) => {
                    const rightPairId = e.target.value;
                    if (!rightPairId) {
                      setMatches((prev) => {
                        const next = new Map(prev);
                        next.delete(pair.id);
                        return next;
                      });
                    } else {
                      setMatches((prev) => {
                        const next = new Map(prev);
                        // Remove any existing match to this right item
                        for (const [key, val] of Array.from(next.entries())) {
                          if (val === rightPairId) {
                            next.delete(key);
                            break;
                          }
                        }
                        next.set(pair.id, rightPairId);
                        return next;
                      });
                    }
                  }}
                >
                  <option value="">-- Select match --</option>
                  {shuffledRightItems.map((item) => (
                    <option key={item.pairId} value={item.pairId}>
                      {item.text}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button onClick={handleSubmit} disabled={matches.size !== totalPairs}>
            Submit Answer
          </Button>
        )}
        {submitted && !isFullyCorrect && (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
