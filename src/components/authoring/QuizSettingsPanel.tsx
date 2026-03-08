'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';
import type { QuizLessonSettings } from '@/types/authoring';

interface QuizSettingsPanelProps {
  settings: QuizLessonSettings;
  onChange: (settings: Partial<QuizLessonSettings>) => void;
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
  return (
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
            0 = use all questions. Set a number to draw randomly from the pool.
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
  );
}
