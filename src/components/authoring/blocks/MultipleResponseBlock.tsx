'use client';

import { type MultipleResponseBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

interface MultipleResponseBlockEditorProps {
  block: MultipleResponseBlock;
  onChange: (data: Partial<MultipleResponseBlock['data']>) => void;
}

export function MultipleResponseBlockEditor({
  block,
  onChange,
}: MultipleResponseBlockEditorProps) {
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

  const toggleCorrect = (optionId: string, checked: boolean) => {
    onChange({
      options: data.options.map((opt) =>
        opt.id === optionId ? { ...opt, is_correct: checked } : opt
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CheckSquare className="h-4 w-4" />
          Multiple Response Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="space-y-2">
          <Label htmlFor={`mr-question-${block.id}`}>Question</Label>
          <Textarea
            id={`mr-question-${block.id}`}
            value={data.question}
            onChange={(e) => onChange({ question: e.target.value })}
            placeholder="Enter your question here..."
            className="min-h-[80px]"
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-3">
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
                  {/* Checkbox for correct answer */}
                  <div className="mt-2.5">
                    <Checkbox
                      id={`mr-option-check-${option.id}`}
                      checked={option.is_correct}
                      onCheckedChange={(checked) =>
                        toggleCorrect(option.id, checked === true)
                      }
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
                    disabled={data.options.length <= 2}
                    title="Remove option"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
          <Label htmlFor={`mr-explanation-${block.id}`}>Explanation</Label>
          <Textarea
            id={`mr-explanation-${block.id}`}
            value={data.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            placeholder="Explanation shown after answering (e.g. why the correct answers are correct)"
            className="min-h-[80px]"
          />
        </div>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          {/* Min selections */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`mr-min-sel-${block.id}`}>Min selections</Label>
            <Input
              id={`mr-min-sel-${block.id}`}
              type="number"
              min={1}
              max={data.max_selections}
              value={data.min_selections}
              onChange={(e) =>
                onChange({
                  min_selections: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-20 text-center"
            />
          </div>

          {/* Max selections */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`mr-max-sel-${block.id}`}>Max selections</Label>
            <Input
              id={`mr-max-sel-${block.id}`}
              type="number"
              min={data.min_selections}
              max={data.options.length}
              value={data.max_selections}
              onChange={(e) =>
                onChange({
                  max_selections: Math.max(
                    data.min_selections,
                    parseInt(e.target.value) || data.min_selections
                  ),
                })
              }
              className="w-20 text-center"
            />
          </div>

          {/* Scoring */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`mr-scoring-${block.id}`}>Scoring</Label>
            <Select
              value={data.scoring}
              onValueChange={(value: 'all_or_nothing' | 'partial') =>
                onChange({ scoring: value })
              }
            >
              <SelectTrigger
                id={`mr-scoring-${block.id}`}
                className="w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_or_nothing">All or nothing</SelectItem>
                <SelectItem value="partial">Partial credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Points */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`mr-points-${block.id}`}>Points</Label>
            <Input
              id={`mr-points-${block.id}`}
              type="number"
              min={0}
              value={data.points}
              onChange={(e) =>
                onChange({ points: Math.max(0, parseInt(e.target.value) || 0) })
              }
              className="w-20 text-center"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
