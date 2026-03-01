'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FillInBlankBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface FillInBlankRendererProps {
  block: FillInBlankBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

interface BlankResult {
  blankId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswers: string[];
}

export function FillInBlankRenderer({
  block,
  progress,
  onComplete,
}: FillInBlankRendererProps) {
  const initialAnswers: Record<string, string> = progress?.completed
    ? ((progress.response_data as Record<string, unknown>)?.answers as Record<string, string>) ?? {}
    : {};

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [results, setResults] = useState<BlankResult[]>([]);

  // Parse text_with_blanks into segments of text and blank placeholders
  const segments = useMemo(() => {
    const regex = /___([a-zA-Z0-9_]+)___/g;
    const parts: { type: 'text' | 'blank'; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(block.data.text_with_blanks)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: block.data.text_with_blanks.slice(lastIndex, match.index),
        });
      }
      // Add the blank placeholder
      parts.push({
        type: 'blank',
        value: match[1], // The blank id (e.g., "blank_1")
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last blank
    if (lastIndex < block.data.text_with_blanks.length) {
      parts.push({
        type: 'text',
        value: block.data.text_with_blanks.slice(lastIndex),
      });
    }

    return parts;
  }, [block.data.text_with_blanks]);

  const handleInputChange = (blankId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    const blankResults: BlankResult[] = block.data.blanks.map((blank) => {
      const userAnswer = (answers[blank.id] ?? '').trim();
      const isCorrect = blank.correct_answers.some((correctAnswer) => {
        if (blank.case_sensitive) {
          return userAnswer === correctAnswer.trim();
        }
        return userAnswer.toLowerCase() === correctAnswer.trim().toLowerCase();
      });

      return {
        blankId: blank.id,
        userAnswer,
        isCorrect,
        correctAnswers: blank.correct_answers,
      };
    });

    const correctCount = blankResults.filter((r) => r.isCorrect).length;
    const totalBlanks = block.data.blanks.length;
    const score =
      totalBlanks > 0
        ? (correctCount / totalBlanks) * block.data.points
        : 0;

    setResults(blankResults);
    setSubmitted(true);

    onComplete(score, {
      answers,
      results: blankResults.map((r) => ({
        blank_id: r.blankId,
        user_answer: r.userAnswer,
        is_correct: r.isCorrect,
      })),
      correct_count: correctCount,
      total_blanks: totalBlanks,
    });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults([]);
  };

  const getBlankResult = (blankId: string): BlankResult | undefined => {
    return results.find((r) => r.blankId === blankId);
  };

  const allCorrect =
    submitted && results.length > 0 && results.every((r) => r.isCorrect);
  const allFilled = block.data.blanks.every(
    (blank) => (answers[blank.id] ?? '').trim().length > 0
  );

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Text with inline inputs */}
      <div className="text-lg leading-relaxed flex flex-wrap items-baseline gap-y-2">
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return (
              <span key={index} className="whitespace-pre-wrap">
                {segment.value}
              </span>
            );
          }

          const blankId = segment.value;
          const result = getBlankResult(blankId);

          return (
            <span key={index} className="inline-flex flex-col mx-1">
              <Input
                value={answers[blankId] ?? ''}
                onChange={(e) => handleInputChange(blankId, e.target.value)}
                disabled={submitted}
                placeholder="..."
                className={cn(
                  'inline-block w-40 text-center h-8 text-base',
                  submitted && result?.isCorrect &&
                    'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-300',
                  submitted && result && !result.isCorrect &&
                    'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300'
                )}
              />
              {submitted && result && !result.isCorrect && (
                <span className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {result.correctAnswers.join(' / ')}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Result & explanation */}
      {submitted && (
        <div
          className={cn(
            'p-3 rounded-lg text-sm',
            allCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
          )}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {allCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correct!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Incorrect &mdash;{' '}
                {results.filter((r) => r.isCorrect).length} of{' '}
                {results.length} blanks correct
              </>
            )}
          </div>
          {block.data.explanation && <p>{block.data.explanation}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!allFilled}>
            Submit Answer
          </Button>
        )}
        {submitted && !allCorrect && (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
