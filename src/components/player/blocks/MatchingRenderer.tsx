'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchingBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface MatchingRendererProps {
  block: MatchingBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

export function MatchingRenderer({
  block,
  progress,
  onComplete,
}: MatchingRendererProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(
    () => {
      if (progress?.completed && progress.response_data) {
        const savedMatches = (progress.response_data as Record<string, unknown>)
          ?.matches as Record<string, string> | undefined;
        if (savedMatches) {
          return new Map(Object.entries(savedMatches));
        }
      }
      return new Map();
    }
  );
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [score, setScore] = useState<number | null>(
    progress?.completed ? (progress.score ?? null) : null
  );

  const pairs = block.data.pairs;
  const totalPairs = pairs.length;

  // Shuffle right-side items on mount if shuffle is true
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

  // Assign a consistent color to each matched pair for visual distinction
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

  // Build a map of pairId -> color index for matched pairs
  const matchColorMap = useMemo(() => {
    const map = new Map<string, number>();
    let colorIndex = 0;
    for (const pairId of Array.from(matches.keys())) {
      map.set(pairId, colorIndex % matchColors.length);
      colorIndex++;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  // Determine which right texts are already matched
  const matchedRightTexts = useMemo(() => {
    return new Set(matches.values());
  }, [matches]);

  const handleLeftClick = (pairId: string) => {
    if (submitted) return;
    // Toggle selection: click again to deselect
    if (selectedLeftId === pairId) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(pairId);
    }
  };

  const handleRightClick = (rightText: string) => {
    if (submitted || !selectedLeftId) return;

    // If this right text is already matched to another left, remove that match first
    const newMatches = new Map(matches);
    for (const [key, val] of Array.from(newMatches.entries())) {
      if (val === rightText) {
        newMatches.delete(key);
        break;
      }
    }

    // Set the match
    newMatches.set(selectedLeftId, rightText);
    setMatches(newMatches);
    setSelectedLeftId(null);
  };

  const handleSubmit = () => {
    if (matches.size !== totalPairs) return;

    let correctCount = 0;
    for (const pair of pairs) {
      const matchedRight = matches.get(pair.id);
      if (matchedRight === pair.right) {
        correctCount++;
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
    setSelectedLeftId(null);
    setMatches(new Map());
    setSubmitted(false);
    setScore(null);
  };

  const isFullyCorrect = submitted && score === block.data.points;

  // Check if a specific pair was matched correctly (for post-submit highlighting)
  const isPairCorrect = (pairId: string): boolean => {
    const pair = pairs.find((p) => p.id === pairId);
    if (!pair) return false;
    return matches.get(pairId) === pair.right;
  };

  // Find which left pairId a right text is matched to
  const getRightMatchedPairId = (rightText: string): string | null => {
    for (const [pairId, val] of Array.from(matches.entries())) {
      if (val === rightText) return pairId;
    }
    return null;
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Instruction */}
      <h3 className="font-medium text-lg">{block.data.instruction}</h3>

      {/* Matching columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left column - Prompts */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Items
          </p>
          {pairs.map((pair) => {
            const isSelected = selectedLeftId === pair.id;
            const isMatched = matches.has(pair.id);
            const colorIndex = matchColorMap.get(pair.id);
            const colorClass =
              isMatched && colorIndex !== undefined
                ? matchColors[colorIndex]
                : '';

            return (
              <button
                key={pair.id}
                disabled={submitted}
                className={cn(
                  'w-full p-3 rounded-lg border-2 text-start transition-colors',
                  !submitted && !isMatched && 'hover:bg-accent/50 cursor-pointer',
                  !submitted && isMatched && 'cursor-pointer',
                  isSelected && 'border-primary bg-primary/5 ring-2 ring-primary/20',
                  !isSelected && !isMatched && !submitted && 'border-border',
                  !submitted && isMatched && !isSelected && colorClass,
                  submitted && isPairCorrect(pair.id) && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  submitted && !isPairCorrect(pair.id) && 'border-red-500 bg-red-50 dark:bg-red-950/20'
                )}
                onClick={() => handleLeftClick(pair.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1">{pair.left}</span>
                  {submitted && isPairCorrect(pair.id) && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {submitted && !isPairCorrect(pair.id) && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right column - Answers (shuffled) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Matches
          </p>
          {shuffledRightItems.map((item) => {
            const matchedPairId = getRightMatchedPairId(item.text);
            const isMatched = matchedPairId !== null;
            const colorIndex =
              matchedPairId !== null
                ? matchColorMap.get(matchedPairId)
                : undefined;
            const colorClass =
              isMatched && colorIndex !== undefined
                ? matchColors[colorIndex]
                : '';
            const isAvailable = !isMatched || selectedLeftId !== null;

            // After submit: highlight based on match correctness
            const matchedCorrectly =
              matchedPairId !== null && isPairCorrect(matchedPairId);

            return (
              <button
                key={item.pairId}
                disabled={submitted || !selectedLeftId}
                className={cn(
                  'w-full p-3 rounded-lg border-2 text-start transition-colors',
                  !submitted && selectedLeftId && 'hover:bg-accent/50 cursor-pointer',
                  !submitted && !selectedLeftId && 'cursor-default',
                  !submitted && !isMatched && 'border-border',
                  !submitted && isMatched && colorClass,
                  submitted && matchedPairId !== null && matchedCorrectly && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  submitted && matchedPairId !== null && !matchedCorrectly && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                  submitted && matchedPairId === null && 'opacity-60'
                )}
                onClick={() => isAvailable && handleRightClick(item.text)}
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1">{item.text}</span>
                  {submitted && matchedPairId !== null && matchedCorrectly && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {submitted && matchedPairId !== null && !matchedCorrectly && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint text when selecting */}
      {!submitted && selectedLeftId && (
        <p className="text-sm text-muted-foreground">
          Now click a match on the right to pair it.
        </p>
      )}

      {/* Result & explanation */}
      {submitted && (
        <div
          className={cn(
            'p-3 rounded-lg text-sm',
            isFullyCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
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
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={matches.size !== totalPairs}
          >
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
