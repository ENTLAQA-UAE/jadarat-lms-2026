'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrueFalseBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface TrueFalseRendererProps {
  block: TrueFalseBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

export function TrueFalseRenderer({
  block,
  progress,
  onComplete,
  theme,
}: TrueFalseRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(
    progress?.completed
      ? ((progress.response_data as Record<string, unknown>)?.selected_answer as boolean | null) ?? null
      : null
  );
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    progress?.completed
      ? (progress.score ?? 0) >= block.data.points
      : null
  );

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === block.data.correct_answer;
    const score = correct ? block.data.points : 0;

    setIsCorrect(correct);
    setSubmitted(true);

    onComplete(score, {
      selected_answer: selectedAnswer,
      is_correct: correct,
    });
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const explanation = submitted
    ? selectedAnswer
      ? block.data.explanation_true
      : block.data.explanation_false
    : '';

  return (
    <div
      className="border rounded-lg p-6 space-y-4"
      style={{
        borderRadius: 'var(--player-radius)',
        fontFamily: 'var(--player-font)',
      }}
    >
      {/* Statement */}
      <h3 className="font-medium text-lg" style={{ color: 'var(--player-text)' }}>
        {block.data.statement}
      </h3>

      {/* True / False buttons */}
      <div className="flex gap-3" role="radiogroup" aria-label={block.data.statement}>
        {[true, false].map((value) => {
          const isSelected = selectedAnswer === value;
          const isCorrectAnswer = block.data.correct_answer === value;
          const label = value ? 'True' : 'False';

          return (
            <button
              key={label}
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              className={cn(
                'flex-1 p-4 rounded-lg border-2 text-center font-medium transition-colors',
                !submitted && 'hover:bg-accent/50 cursor-pointer',
                submitted && isCorrectAnswer && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                submitted && isSelected && !isCorrectAnswer && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                submitted && !isSelected && !isCorrectAnswer && 'opacity-60'
              )}
              style={{
                borderRadius: 'var(--player-radius)',
                ...(isSelected && !submitted
                  ? {
                      borderColor: 'var(--player-primary)',
                      backgroundColor: 'color-mix(in srgb, var(--player-primary) 5%, transparent)',
                    }
                  : {}),
              }}
              onClick={() => !submitted && setSelectedAnswer(value)}
            >
              <div className="flex items-center justify-center gap-2">
                {submitted && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {submitted && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                {label}
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
          {explanation && <p>{explanation}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            style={{
              backgroundColor: 'var(--player-primary)',
              borderRadius: 'var(--player-radius)',
            }}
          >
            Submit Answer
          </Button>
        )}
        {submitted && !isCorrect && (
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
