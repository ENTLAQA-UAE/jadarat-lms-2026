'use client';

import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClipboardCheck, Library, Plus, Trash2, FileQuestion } from 'lucide-react';
import type { QuizLessonSettings, QuestionBankRef } from '@/types/authoring';

interface QuizSettingsPanelProps {
  settings: QuizLessonSettings;
  onChange: (settings: Partial<QuizLessonSettings>) => void;
}

interface QuestionBankOption {
  id: string;
  name: string;
  question_count: number;
  category?: string;
}

export const DEFAULT_QUIZ_SETTINGS: QuizLessonSettings = {
  passing_score: 70,
  max_attempts: 0,
  time_limit_minutes: 0,
  randomize_questions: false,
  show_results: true,
  show_correct_answers: true,
  question_pool_size: 0,
};

export function QuizSettingsPanel({ settings, onChange }: QuizSettingsPanelProps) {
  const [availableBanks, setAvailableBanks] = useState<QuestionBankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [drawCount, setDrawCount] = useState(5);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const bankRefs = settings.question_bank_refs ?? [];

  const fetchBanks = useCallback(async () => {
    setBanksLoading(true);
    try {
      const res = await fetch('/api/question-banks');
      const data = await res.json();
      if (data.banks) setAvailableBanks(data.banks);
    } catch {
      // Silently handle
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleAddBankRef = () => {
    if (!selectedBankId) return;
    const bank = availableBanks.find((b) => b.id === selectedBankId);
    if (!bank) return;

    // Don't add duplicate
    if (bankRefs.some((ref) => ref.bank_id === selectedBankId)) return;

    const newRef: QuestionBankRef = {
      bank_id: bank.id,
      bank_name: bank.name,
      draw_count: drawCount,
      difficulty_filter: difficultyFilter !== 'all' ? difficultyFilter as 'easy' | 'medium' | 'hard' : undefined,
    };

    onChange({
      question_bank_refs: [...bankRefs, newRef],
    });

    setSelectedBankId('');
    setDrawCount(5);
    setDifficultyFilter('all');
    setAddBankOpen(false);
  };

  const handleRemoveBankRef = (bankId: string) => {
    onChange({
      question_bank_refs: bankRefs.filter((ref) => ref.bank_id !== bankId),
    });
  };

  const handleUpdateDrawCount = (bankId: string, count: number) => {
    onChange({
      question_bank_refs: bankRefs.map((ref) =>
        ref.bank_id === bankId ? { ...ref, draw_count: count } : ref
      ),
    });
  };

  // Banks not yet added
  const unlinkedBanks = availableBanks.filter(
    (b) => !bankRefs.some((ref) => ref.bank_id === b.id)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ClipboardCheck className="h-4 w-4" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Passing Score */}
          <div className="space-y-1">
            <Label htmlFor="quiz-passing-score" className="text-xs">
              Passing Score (%)
            </Label>
            <Input
              id="quiz-passing-score"
              type="number"
              min={0}
              max={100}
              value={settings.passing_score}
              onChange={(e) => onChange({ passing_score: Number(e.target.value) })}
            />
            <p className="text-[10px] text-muted-foreground">
              Minimum percentage to pass. 0 = no passing requirement.
            </p>
          </div>

          {/* Max Attempts */}
          <div className="space-y-1">
            <Label htmlFor="quiz-max-attempts" className="text-xs">
              Max Attempts
            </Label>
            <Input
              id="quiz-max-attempts"
              type="number"
              min={0}
              value={settings.max_attempts}
              onChange={(e) => onChange({ max_attempts: Number(e.target.value) })}
            />
            <p className="text-[10px] text-muted-foreground">
              0 = unlimited attempts.
            </p>
          </div>

          {/* Time Limit */}
          <div className="space-y-1">
            <Label htmlFor="quiz-time-limit" className="text-xs">
              Time Limit (minutes)
            </Label>
            <Input
              id="quiz-time-limit"
              type="number"
              min={0}
              value={settings.time_limit_minutes}
              onChange={(e) => onChange({ time_limit_minutes: Number(e.target.value) })}
            />
            <p className="text-[10px] text-muted-foreground">
              0 = no time limit.
            </p>
          </div>

          {/* Question Pool */}
          <div className="space-y-1">
            <Label htmlFor="quiz-pool-size" className="text-xs">
              Question Pool Size
            </Label>
            <Input
              id="quiz-pool-size"
              type="number"
              min={0}
              value={settings.question_pool_size}
              onChange={(e) => onChange({ question_pool_size: Number(e.target.value) })}
            />
            <p className="text-[10px] text-muted-foreground">
              0 = use all questions. Set a number to draw randomly from inline questions.
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiz-randomize" className="cursor-pointer text-xs">
                Randomize question order
              </Label>
              <Switch
                id="quiz-randomize"
                checked={settings.randomize_questions}
                onCheckedChange={(checked) => onChange({ randomize_questions: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quiz-show-results" className="cursor-pointer text-xs">
                Show results after submission
              </Label>
              <Switch
                id="quiz-show-results"
                checked={settings.show_results}
                onCheckedChange={(checked) => onChange({ show_results: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quiz-show-answers" className="cursor-pointer text-xs">
                Show correct answers in results
              </Label>
              <Switch
                id="quiz-show-answers"
                checked={settings.show_correct_answers}
                onCheckedChange={(checked) => onChange({ show_correct_answers: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Bank Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <Library className="h-4 w-4" />
              Question Banks
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-7"
              onClick={() => setAddBankOpen(true)}
              disabled={unlinkedBanks.length === 0}
            >
              <Plus className="h-3 w-3" />
              Link Bank
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bankRefs.length === 0 ? (
            <div className="text-center py-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No question banks linked. Link a bank to draw random questions into this quiz.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bankRefs.map((ref) => (
                <div
                  key={ref.bank_id}
                  className="flex items-center gap-2 rounded-lg border p-2.5"
                >
                  <Library className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{ref.bank_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {ref.difficulty_filter && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                          {ref.difficulty_filter}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Label className="text-[10px] text-muted-foreground">Draw</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ref.draw_count}
                      onChange={(e) =>
                        handleUpdateDrawCount(ref.bank_id, Number(e.target.value) || 1)
                      }
                      className="w-14 h-7 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleRemoveBankRef(ref.bank_id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-2">
                Bank questions are drawn randomly each time a learner starts the quiz.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Bank Dialog */}
      <Dialog open={addBankOpen} onOpenChange={setAddBankOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Question Bank</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Select Bank</Label>
              {banksLoading ? (
                <p className="text-xs text-muted-foreground">Loading banks...</p>
              ) : unlinkedBanks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  All available banks are already linked.
                </p>
              ) : (
                <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a question bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedBanks.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} ({b.question_count} questions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Draw Count</Label>
                <Input
                  type="number"
                  min={1}
                  value={drawCount}
                  onChange={(e) => setDrawCount(Number(e.target.value) || 1)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Number of random questions to draw.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Difficulty Filter</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy Only</SelectItem>
                    <SelectItem value="medium">Medium Only</SelectItem>
                    <SelectItem value="hard">Hard Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBankOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBankRef} disabled={!selectedBankId}>
              Link Bank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
