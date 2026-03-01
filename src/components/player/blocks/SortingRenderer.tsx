'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortingBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface SortingRendererProps {
  block: SortingBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

export function SortingRenderer({
  block,
  progress,
  onComplete,
}: SortingRendererProps) {
  // Restore assignments from progress if already completed
  const initialAssignments = (): Map<string, string> => {
    if (progress?.completed && progress.response_data) {
      const saved = (progress.response_data as Record<string, unknown>)
        ?.assignments as Record<string, string> | undefined;
      if (saved) {
        return new Map(Object.entries(saved));
      }
    }
    return new Map();
  };

  const [assignments, setAssignments] = useState<Map<string, string>>(
    initialAssignments
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [score, setScore] = useState<number | null>(
    progress?.completed ? (progress.score ?? null) : null
  );

  const isAllCorrect = score !== null && score >= block.data.points;

  // Get items that are not yet assigned to any category
  const unsortedItems = block.data.items.filter(
    (item) => !assignments.has(item.id)
  );

  // Get items assigned to a specific category
  const getItemsForCategory = (categoryId: string) =>
    block.data.items.filter(
      (item) => assignments.get(item.id) === categoryId
    );

  const handleItemClick = (itemId: string) => {
    if (submitted) return;

    if (selectedItemId === itemId) {
      // Deselect if clicking the same item
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (submitted || !selectedItemId) return;

    const newAssignments = new Map(assignments);
    newAssignments.set(selectedItemId, categoryId);
    setAssignments(newAssignments);
    setSelectedItemId(null);
  };

  const handleUnassign = (itemId: string) => {
    if (submitted) return;

    const newAssignments = new Map(assignments);
    newAssignments.delete(itemId);
    setAssignments(newAssignments);
    setSelectedItemId(null);
  };

  const handleSubmit = () => {
    if (assignments.size !== block.data.items.length) return;

    let correctCount = 0;
    block.data.items.forEach((item) => {
      if (assignments.get(item.id) === item.correct_category_id) {
        correctCount++;
      }
    });

    const earnedScore = Math.round(
      (correctCount / block.data.items.length) * block.data.points
    );

    setScore(earnedScore);
    setSubmitted(true);

    // Build a plain object from the map for serialisation
    const assignmentsObj: Record<string, string> = {};
    assignments.forEach((categoryId, itemId) => {
      assignmentsObj[itemId] = categoryId;
    });

    onComplete(earnedScore, {
      assignments: assignmentsObj,
      correct_count: correctCount,
      total_count: block.data.items.length,
      is_correct: correctCount === block.data.items.length,
    });
  };

  const handleRetry = () => {
    setAssignments(new Map());
    setSelectedItemId(null);
    setSubmitted(false);
    setScore(null);
  };

  const allAssigned = assignments.size === block.data.items.length;

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Instruction */}
      <h3 className="font-medium text-lg">{block.data.instruction}</h3>

      {/* Unsorted items */}
      {unsortedItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Unsorted Items
          </p>
          <div className="flex flex-wrap gap-2">
            {unsortedItems.map((item) => (
              <button
                key={item.id}
                disabled={submitted}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm transition-colors',
                  !submitted && 'cursor-pointer hover:bg-accent/50',
                  selectedItemId === item.id &&
                    'border-primary bg-primary/10 ring-2 ring-primary/30',
                  selectedItemId !== item.id && 'border-border bg-muted/30'
                )}
                onClick={() => handleItemClick(item.id)}
              >
                {item.text}
              </button>
            ))}
          </div>
          {selectedItemId && !submitted && (
            <p className="text-xs text-muted-foreground">
              Click a category below to assign the selected item.
            </p>
          )}
        </div>
      )}

      {/* Category zones */}
      <div className="grid gap-3 sm:grid-cols-2">
        {block.data.categories.map((category) => {
          const categoryItems = getItemsForCategory(category.id);

          return (
            <button
              key={category.id}
              type="button"
              disabled={submitted || !selectedItemId}
              className={cn(
                'rounded-lg border-2 border-dashed p-4 text-start transition-colors',
                !submitted &&
                  selectedItemId &&
                  'cursor-pointer hover:border-primary hover:bg-primary/5',
                !submitted && !selectedItemId && 'cursor-default',
                submitted && 'cursor-default'
              )}
              onClick={() => handleCategoryClick(category.id)}
            >
              <p className="text-sm font-semibold mb-2">{category.name}</p>
              <div className="flex flex-wrap gap-2 min-h-[36px]">
                {categoryItems.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    {submitted ? 'No items' : 'Drop items here'}
                  </span>
                )}
                {categoryItems.map((item) => {
                  const isCorrectPlacement =
                    item.correct_category_id === category.id;

                  return (
                    <span
                      key={item.id}
                      role="button"
                      tabIndex={submitted ? -1 : 0}
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm',
                        !submitted &&
                          'cursor-pointer hover:bg-destructive/10 hover:border-destructive/40',
                        submitted && isCorrectPlacement &&
                          'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-300',
                        submitted && !isCorrectPlacement &&
                          'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300',
                        !submitted && 'border-border bg-background'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassign(item.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnassign(item.id);
                        }
                      }}
                    >
                      {item.text}
                      {submitted && isCorrectPlacement && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      )}
                      {submitted && !isCorrectPlacement && (
                        <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result & explanation */}
      {submitted && (
        <div
          className={cn(
            'p-3 rounded-lg text-sm',
            isAllCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
          )}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {isAllCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correct!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Incorrect — {score} /{' '}
                {block.data.points} points
              </>
            )}
          </div>
          {block.data.explanation && <p>{block.data.explanation}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!allAssigned}>
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
