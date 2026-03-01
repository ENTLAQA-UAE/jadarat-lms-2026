'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultipleResponseBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface MultipleResponseRendererProps {
  block: MultipleResponseBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

export function MultipleResponseRenderer({
  block,
  progress,
  onComplete,
}: MultipleResponseRendererProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(
    new Set(
      ((progress?.response_data as Record<string, unknown>)?.selected_option_ids as string[]) ?? []
    )
  );
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [earnedScore, setEarnedScore] = useState<number | null>(
    progress?.completed ? (progress.score ?? 0) : null
  );

  const correctOptionIds = new Set(
    block.data.options.filter((o) => o.is_correct).map((o) => o.id)
  );
  const totalCorrect = correctOptionIds.size;
  const isFullyCorrect =
    earnedScore !== null && earnedScore >= block.data.points;

  const toggleOption = (optionId: string) => {
    if (submitted) return;

    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        // Enforce max_selections
        if (next.size >= block.data.max_selections) return prev;
        next.add(optionId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedOptionIds.size < block.data.min_selections) return;

    let score: number;

    if (block.data.scoring === 'all_or_nothing') {
      // Full points only if ALL correct options selected and NO incorrect ones
      const allCorrectSelected = Array.from(correctOptionIds).every((id) =>
        selectedOptionIds.has(id)
      );
      const noIncorrectSelected = Array.from(selectedOptionIds).every((id) =>
        correctOptionIds.has(id)
      );
      score = allCorrectSelected && noIncorrectSelected ? block.data.points : 0;
    } else {
      // Partial scoring: points * (correct_selections / total_correct_options)
      const correctSelections = Array.from(selectedOptionIds).filter((id) =>
        correctOptionIds.has(id)
      ).length;
      score = Math.round(
        (block.data.points * correctSelections) / totalCorrect
      );
    }

    setEarnedScore(score);
    setSubmitted(true);

    onComplete(score, {
      selected_option_ids: Array.from(selectedOptionIds),
      is_correct: score >= block.data.points,
    });
  };

  const handleRetry = () => {
    setSelectedOptionIds(new Set());
    setSubmitted(false);
    setEarnedScore(null);
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Question */}
      <h3 className="font-medium text-lg">{block.data.question}</h3>

      {/* Selection hint */}
      <p className="text-sm text-muted-foreground">
        Select between {block.data.min_selections} and{' '}
        {block.data.max_selections} options.
      </p>

      {/* Options */}
      <div className="space-y-2">
        {block.data.options.map((option) => {
          const isSelected = selectedOptionIds.has(option.id);
          const showFeedback = submitted && isSelected;

          return (
            <button
              key={option.id}
              disabled={submitted}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg border text-start transition-colors',
                !submitted && 'hover:bg-accent/50 cursor-pointer',
                isSelected && !submitted && 'border-primary bg-primary/5',
                submitted &&
                  option.is_correct &&
                  'border-green-500 bg-green-50 dark:bg-green-950/20',
                submitted &&
                  isSelected &&
                  !option.is_correct &&
                  'border-red-500 bg-red-50 dark:bg-red-950/20',
                submitted &&
                  !isSelected &&
                  !option.is_correct &&
                  'opacity-60'
              )}
              onClick={() => toggleOption(option.id)}
            >
              {/* Checkbox indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-sm border-2 mt-0.5 shrink-0 flex items-center justify-center',
                  isSelected
                    ? 'border-primary'
                    : 'border-muted-foreground/40',
                  submitted && option.is_correct && 'border-green-500',
                  submitted &&
                    isSelected &&
                    !option.is_correct &&
                    'border-red-500'
                )}
              >
                {isSelected && (
                  <div
                    className={cn(
                      'w-3 h-3 rounded-[1px]',
                      submitted && option.is_correct
                        ? 'bg-green-500'
                        : submitted && !option.is_correct
                          ? 'bg-red-500'
                          : 'bg-primary'
                    )}
                  />
                )}
              </div>

              <div className="flex-1">
                <span>{option.text}</span>
                {showFeedback && option.feedback && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    {option.feedback}
                  </p>
                )}
              </div>

              {submitted && option.is_correct && (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              )}
              {submitted && isSelected && !option.is_correct && (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

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
                <CheckCircle2 className="w-4 h-4" /> Correct!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Incorrect
                {block.data.scoring === 'partial' &&
                  earnedScore !== null &&
                  earnedScore > 0 && (
                    <span className="font-normal">
                      {' '}
                      - {earnedScore}/{block.data.points} points
                    </span>
                  )}
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
            disabled={selectedOptionIds.size < block.data.min_selections}
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
