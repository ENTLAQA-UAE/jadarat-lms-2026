'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultipleChoiceBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface MCQRendererProps {
  block: MultipleChoiceBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

export function MCQRenderer({
  block,
  progress,
  onComplete,
  theme,
}: MCQRendererProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    (progress?.response_data as Record<string, unknown>)?.selected_option_id as string | null
  );
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    progress?.completed
      ? (progress.score ?? 0) >= block.data.points
      : null
  );

  const options = useMemo(() => {
    if (block.data.shuffle_options && !submitted) {
      return [...block.data.options].sort(() => Math.random() - 0.5);
    }
    return block.data.options;
  }, [block.data.options, block.data.shuffle_options, submitted]);

  const handleSubmit = () => {
    if (!selectedOptionId) return;

    const selectedOption = block.data.options.find(
      (o) => o.id === selectedOptionId
    );
    const correct = selectedOption?.is_correct ?? false;
    const score = correct ? block.data.points : 0;

    setIsCorrect(correct);
    setSubmitted(true);

    onComplete(score, {
      selected_option_id: selectedOptionId,
      is_correct: correct,
    });
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  return (
    <div
      className="border rounded-lg p-6 space-y-4"
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      {/* Question */}
      <h3 className="font-medium text-lg" style={{ color: 'var(--player-text)' }}>
        {block.data.question}
      </h3>

      {/* Options */}
      <div className="space-y-2" role="radiogroup" aria-label={block.data.question}>
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const showFeedback = submitted && isSelected;

          return (
            <button
              key={option.id}
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg border text-start transition-colors',
                !submitted && 'hover:bg-accent/50 cursor-pointer',
                submitted && option.is_correct && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                submitted && isSelected && !option.is_correct && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                submitted && !isSelected && !option.is_correct && 'opacity-60'
              )}
              style={
                isSelected && !submitted
                  ? {
                      borderColor: 'var(--player-primary)',
                      backgroundColor: 'color-mix(in srgb, var(--player-primary) 5%, transparent)',
                    }
                  : undefined
              }
              onClick={() => !submitted && setSelectedOptionId(option.id)}
            >
              {/* Radio circle */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center',
                  !isSelected && 'border-muted-foreground/40',
                  submitted && option.is_correct && 'border-green-500',
                  submitted && isSelected && !option.is_correct && 'border-red-500'
                )}
                style={
                  isSelected && !submitted
                    ? { borderColor: 'var(--player-primary)' }
                    : undefined
                }
              >
                {isSelected && (
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      submitted && option.is_correct && 'bg-green-500',
                      submitted && !option.is_correct && 'bg-red-500'
                    )}
                    style={
                      !submitted
                        ? { backgroundColor: 'var(--player-primary)' }
                        : undefined
                    }
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
            isCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
          )}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correct!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Incorrect
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
            disabled={!selectedOptionId}
            style={{
              backgroundColor: 'var(--player-primary)',
              borderRadius: 'var(--player-radius)',
            }}
          >
            Submit Answer
          </Button>
        )}
        {submitted && !isCorrect && block.data.allow_retry && (
          <Button
            variant="outline"
            onClick={handleRetry}
            className="gap-2"
            style={{ borderRadius: 'var(--player-radius)' }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
