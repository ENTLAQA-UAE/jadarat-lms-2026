'use client';

import { type MultipleChoiceBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CircleDot, Plus, Trash2 } from 'lucide-react';

interface MultipleChoiceBlockEditorProps {
  block: MultipleChoiceBlock;
  onChange: (data: Partial<MultipleChoiceBlock['data']>) => void;
}

export function MultipleChoiceBlockEditor({
  block,
  onChange,
}: MultipleChoiceBlockEditorProps) {
  const { data } = block;

  const addOption = () => {
    const newOption = {
      id: uuidv4(),
      text: '',
      is_correct: false,
      feedback: '',
    };
    onChange({ options: [...data.options, newOption] });
  };

  const removeOption = (optionId: string) => {
    onChange({
      options: data.options.filter((opt) => opt.id !== optionId),
    });
  };

  const updateOption = (
    optionId: string,
    field: 'text' | 'feedback',
    value: string
  ) => {
    onChange({
      options: data.options.map((opt) =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      ),
    });
  };

  const setCorrectAnswer = (optionId: string) => {
    onChange({
      options: data.options.map((opt) => ({
        ...opt,
        is_correct: opt.id === optionId,
      })),
    });
  };

  const correctOptionId =
    data.options.find((opt) => opt.is_correct)?.id ?? '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CircleDot className="h-4 w-4" />
          Multiple Choice Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="space-y-2">
          <Label htmlFor={`mcq-question-${block.id}`}>Question</Label>
          <Textarea
            id={`mcq-question-${block.id}`}
            value={data.question}
            onChange={(e) => onChange({ question: e.target.value })}
            placeholder="Enter your question here..."
            className="min-h-[80px]"
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label>Options</Label>
          <RadioGroup
            value={correctOptionId}
            onValueChange={setCorrectAnswer}
            className="space-y-3"
          >
            {data.options.map((option, index) => (
              <div
                key={option.id}
                className={`rounded-lg border p-3 transition-colors ${
                  option.is_correct
                    ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio for correct answer */}
                  <div className="mt-2.5">
                    <RadioGroupItem
                      value={option.id}
                      id={`mcq-option-radio-${option.id}`}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Option label */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Option {String.fromCharCode(65 + index)}
                      </span>
                      {option.is_correct && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                          Correct
                        </span>
                      )}
                    </div>

                    {/* Option text */}
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateOption(option.id, 'text', e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)} text`}
                    />

                    {/* Feedback */}
                    <Input
                      value={option.feedback ?? ''}
                      onChange={(e) =>
                        updateOption(option.id, 'feedback', e.target.value)
                      }
                      placeholder="Feedback when selected (optional)"
                      className="text-xs"
                    />
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                    className="mt-1 h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={data.options.length < 2}
                    title="Remove option"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </RadioGroup>

          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label htmlFor={`mcq-explanation-${block.id}`}>Explanation</Label>
          <Textarea
            id={`mcq-explanation-${block.id}`}
            value={data.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            placeholder="Explanation shown after answering (e.g. why the correct answer is correct)"
            className="min-h-[80px]"
          />
        </div>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          {/* Points */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`mcq-points-${block.id}`}>Points</Label>
            <Input
              id={`mcq-points-${block.id}`}
              type="number"
              min={0}
              value={data.points}
              onChange={(e) =>
                onChange({ points: Math.max(0, parseInt(e.target.value) || 0) })
              }
              className="w-20 text-center"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`mcq-retry-${block.id}`}
              className="cursor-pointer"
            >
              Allow retry
            </Label>
            <Switch
              id={`mcq-retry-${block.id}`}
              checked={data.allow_retry}
              onCheckedChange={(checked) =>
                onChange({ allow_retry: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`mcq-shuffle-${block.id}`}
              className="cursor-pointer"
            >
              Shuffle options
            </Label>
            <Switch
              id={`mcq-shuffle-${block.id}`}
              checked={data.shuffle_options}
              onCheckedChange={(checked) =>
                onChange({ shuffle_options: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
