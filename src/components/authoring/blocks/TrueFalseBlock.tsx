'use client';

import { type TrueFalseBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleLeft } from 'lucide-react';

interface TrueFalseBlockEditorProps {
  block: TrueFalseBlock;
  onChange: (data: Partial<TrueFalseBlock['data']>) => void;
}

export function TrueFalseBlockEditor({
  block,
  onChange,
}: TrueFalseBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ToggleLeft className="h-4 w-4" />
          True / False Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statement */}
        <div className="space-y-2">
          <Label htmlFor={`tf-statement-${block.id}`}>Statement</Label>
          <Textarea
            id={`tf-statement-${block.id}`}
            value={data.statement}
            onChange={(e) => onChange({ statement: e.target.value })}
            placeholder="Enter the statement to evaluate as True or False..."
            className="min-h-[100px]"
          />
        </div>

        {/* Correct answer */}
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <RadioGroup
            value={data.correct_answer ? 'true' : 'false'}
            onValueChange={(value) =>
              onChange({ correct_answer: value === 'true' })
            }
            className="flex gap-4"
          >
            <div
              className={`flex flex-1 items-center gap-3 rounded-lg border p-3 transition-colors ${
                data.correct_answer
                  ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                  : 'border-border bg-muted/20'
              }`}
            >
              <RadioGroupItem value="true" id={`tf-true-${block.id}`} />
              <Label
                htmlFor={`tf-true-${block.id}`}
                className="flex-1 cursor-pointer font-medium"
              >
                True
              </Label>
              {data.correct_answer && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  Correct
                </span>
              )}
            </div>
            <div
              className={`flex flex-1 items-center gap-3 rounded-lg border p-3 transition-colors ${
                !data.correct_answer
                  ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                  : 'border-border bg-muted/20'
              }`}
            >
              <RadioGroupItem value="false" id={`tf-false-${block.id}`} />
              <Label
                htmlFor={`tf-false-${block.id}`}
                className="flex-1 cursor-pointer font-medium"
              >
                False
              </Label>
              {!data.correct_answer && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  Correct
                </span>
              )}
            </div>
          </RadioGroup>
        </div>

        {/* Explanation for True */}
        <div className="space-y-2">
          <Label htmlFor={`tf-exp-true-${block.id}`}>
            Explanation when &quot;True&quot; is selected
          </Label>
          <Textarea
            id={`tf-exp-true-${block.id}`}
            value={data.explanation_true}
            onChange={(e) => onChange({ explanation_true: e.target.value })}
            placeholder="Feedback shown when the learner selects True"
            className="min-h-[80px]"
          />
        </div>

        {/* Explanation for False */}
        <div className="space-y-2">
          <Label htmlFor={`tf-exp-false-${block.id}`}>
            Explanation when &quot;False&quot; is selected
          </Label>
          <Textarea
            id={`tf-exp-false-${block.id}`}
            value={data.explanation_false}
            onChange={(e) => onChange({ explanation_false: e.target.value })}
            placeholder="Feedback shown when the learner selects False"
            className="min-h-[80px]"
          />
        </div>

        {/* Points */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Label htmlFor={`tf-points-${block.id}`}>Points</Label>
          <Input
            id={`tf-points-${block.id}`}
            type="number"
            min={0}
            value={data.points}
            onChange={(e) =>
              onChange({ points: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className="w-20 text-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}
