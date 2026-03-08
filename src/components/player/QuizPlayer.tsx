'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Block, QuizLessonSettings, CourseTheme } from '@/types/authoring';
import { BlockRenderer } from './blocks';
import type { BlockProgress } from './CoursePlayer';

interface QuizPlayerProps {
  blocks: Block[];
  settings: QuizLessonSettings;
  theme: CourseTheme;
  direction: 'rtl' | 'ltr' | 'auto';
  onQuizComplete: (score: number, passed: boolean) => void;
  previousAttempts?: number;
}

interface QuestionResult {
  blockId: string;
  score: number;
  maxScore: number;
  responseData: Record<string, unknown>;
}

const ASSESSMENT_TYPES = new Set([
  'multiple_choice', 'true_false', 'multiple_response',
  'fill_in_blank', 'matching', 'sorting',
]);

export function QuizPlayer({
  blocks,
  settings,
  theme,
  direction,
  onQuizComplete,
  previousAttempts = 0,
}: QuizPlayerProps) {
  const [bankQuestions, setBankQuestions] = useState<Block[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Fetch questions from linked question banks
  useEffect(() => {
    const bankRefs = settings.question_bank_refs;
    if (!bankRefs || bankRefs.length === 0) {
      setBankQuestions([]);
      return;
    }

    let cancelled = false;

    async function fetchBankQuestions() {
      setBankLoading(true);
      setBankError(null);
      try {
        const res = await fetch('/api/question-banks/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bank_refs: bankRefs!.map((ref) => ({
              bank_id: ref.bank_id,
              draw_count: ref.draw_count,
              block_type_filter: ref.block_type_filter || undefined,
              difficulty_filter: ref.difficulty_filter || undefined,
            })),
          }),
        });

        if (!res.ok) throw new Error('Failed to draw questions');

        const data = await res.json();
        if (cancelled) return;

        // Convert bank items to Block format
        const drawnBlocks: Block[] = (data.questions ?? []).map(
          (q: { id: string; block_type: string; block_data: Record<string, unknown>; points: number }) => ({
            id: uuidv4(), // Fresh ID to avoid conflicts with inline blocks
            type: q.block_type,
            order: 0,
            visible: true,
            locked: false,
            data: { ...q.block_data, points: q.points },
            metadata: {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'ai' as const,
              source_bank_item_id: q.id,
            },
          } as Block)
        );

        setBankQuestions(drawnBlocks);
      } catch (err) {
        if (!cancelled) {
          setBankError('Could not load bank questions. Using inline questions only.');
        }
      } finally {
        if (!cancelled) setBankLoading(false);
      }
    }

    fetchBankQuestions();
    return () => { cancelled = true; };
  }, [settings.question_bank_refs]);

  // Combine inline assessment blocks + bank-drawn questions
  const allQuestions = useMemo(() => {
    const inlineQuestions = blocks.filter((b) => ASSESSMENT_TYPES.has(b.type));
    return [...inlineQuestions, ...bankQuestions];
  }, [blocks, bankQuestions]);

  // Apply question pool + randomization
  const questions = useMemo(() => {
    let qs = [...allQuestions];
    if (settings.randomize_questions) {
      qs.sort(() => Math.random() - 0.5);
    }
    if (settings.question_pool_size > 0 && settings.question_pool_size < qs.length) {
      qs = qs.slice(0, settings.question_pool_size);
    }
    return qs;
  }, [allQuestions, settings.randomize_questions, settings.question_pool_size]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Map<string, QuestionResult>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    settings.time_limit_minutes > 0 ? settings.time_limit_minutes * 60 : -1
  );

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted]);

  const handleQuestionComplete = useCallback(
    (blockId: string, score?: number, responseData?: Record<string, unknown>) => {
      if (submitted) return;

      const block = questions.find((q) => q.id === blockId);
      const maxScore = (block?.data as any)?.points ?? 1;

      setResults((prev) => {
        const next = new Map(prev);
        next.set(blockId, {
          blockId,
          score: score ?? 0,
          maxScore,
          responseData: responseData ?? {},
        });
        return next;
      });
    },
    [questions, submitted]
  );

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);

    const totalScore = Array.from(results.values()).reduce((sum, r) => sum + r.score, 0);
    const totalPossible = questions.reduce((sum, q) => sum + ((q.data as any)?.points ?? 1), 0);
    const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const passed = settings.passing_score <= 0 || percentage >= settings.passing_score;

    onQuizComplete(percentage, passed);
  }, [results, questions, settings.passing_score, submitted, onQuizComplete]);

  const allAnswered = results.size >= questions.length;
  const canRetry =
    submitted &&
    (settings.max_attempts === 0 || previousAttempts + 1 < settings.max_attempts);

  // Calculate results for display
  const totalScore = Array.from(results.values()).reduce((sum, r) => sum + r.score, 0);
  const totalPossible = questions.reduce((sum, q) => sum + ((q.data as any)?.points ?? 1), 0);
  const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const passed = settings.passing_score <= 0 || percentage >= settings.passing_score;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Loading state for bank questions
  if (bankLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Loading quiz questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No assessment questions in this quiz. Add Multiple Choice, True/False, Fill in Blank,
        Matching, or Sorting blocks to create quiz questions.
      </div>
    );
  }

  // Results screen
  if (submitted && settings.show_results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Score card */}
        <div
          className={cn(
            'rounded-xl border-2 p-8 text-center',
            passed ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'
          )}
          style={{ borderRadius: 'var(--player-radius)' }}
        >
          <div className="mb-4">
            {passed ? (
              <Trophy className="mx-auto h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Not quite there'}
          </h3>
          <p className="text-4xl font-bold mb-2" style={{ color: passed ? '#22c55e' : '#ef4444' }}>
            {percentage}%
          </p>
          <p className="text-sm text-muted-foreground">
            {totalScore} / {totalPossible} points
            {settings.passing_score > 0 && (
              <> &middot; Passing: {settings.passing_score}%</>
            )}
          </p>
        </div>

        {/* Per-question results */}
        {settings.show_correct_answers && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Question Results</h4>
            {questions.map((question, index) => {
              const result = results.get(question.id);
              const isCorrect = result && result.score >= result.maxScore;
              return (
                <div
                  key={question.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                  <span className="text-sm flex-1">
                    Question {index + 1}: {(question.data as any)?.question || (question.data as any)?.statement || (question.data as any)?.instruction || 'Question'}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {result?.score ?? 0} / {result?.maxScore ?? 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bank questions notice */}
        {bankQuestions.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            This quiz included {bankQuestions.length} question{bankQuestions.length !== 1 ? 's' : ''} drawn from question banks.
          </p>
        )}

        {/* Retry button */}
        {canRetry && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                setResults(new Map());
                setSubmitted(false);
                setCurrentIndex(0);
                if (settings.time_limit_minutes > 0) {
                  setTimeRemaining(settings.time_limit_minutes * 60);
                }
              }}
              className="gap-2"
              style={{ borderRadius: 'var(--player-radius)' }}
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // Quiz in progress
  return (
    <div className="space-y-6">
      {/* Bank error notice */}
      {bankError && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{bankError}</p>
      )}

      {/* Quiz header with timer + progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        {timeRemaining > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={cn(timeRemaining < 60 && 'text-red-500 animate-pulse')}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${((results.size) / questions.length) * 100}%`,
            backgroundColor: 'var(--player-primary)',
          }}
        />
      </div>

      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questions[currentIndex]?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {questions[currentIndex] && (
            <BlockRenderer
              block={questions[currentIndex]}
              onComplete={(score, data) =>
                handleQuestionComplete(questions[currentIndex].id, score, data)
              }
              theme={theme}
              direction={direction}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        >
          Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="gap-1 text-white"
            style={{ backgroundColor: 'var(--player-primary)' }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="text-white"
            style={{ backgroundColor: allAnswered ? 'var(--player-primary)' : undefined }}
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
