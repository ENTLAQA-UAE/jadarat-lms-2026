'use client';

import { type FillInBlankBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextCursorInput, Plus, Trash2, X } from 'lucide-react';

interface FillInBlankBlockEditorProps {
  block: FillInBlankBlock;
  onChange: (data: Partial<FillInBlankBlock['data']>) => void;
}

export function FillInBlankBlockEditor({
  block,
  onChange,
}: FillInBlankBlockEditorProps) {
  const { data } = block;

  const getNextBlankId = () => {
    const existingNumbers = data.blanks.map((b) => {
      const match = b.id.match(/^blank_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `blank_${maxNumber + 1}`;
  };

  const addBlank = () => {
    const newId = getNextBlankId();
    const newBlank = {
      id: newId,
      correct_answers: [''],
      case_sensitive: false,
    };
    const placeholder = `___${newId}___`;
    onChange({
      blanks: [...data.blanks, newBlank],
      text_with_blanks: data.text_with_blanks
        ? `${data.text_with_blanks} ${placeholder}`
        : placeholder,
    });
  };

  const removeBlank = (blankId: string) => {
    onChange({
      blanks: data.blanks.filter((b) => b.id !== blankId),
      text_with_blanks: data.text_with_blanks.replace(
        new RegExp(`\\s*___${blankId}___`, 'g'),
        ''
      ),
    });
  };

  const updateBlankAnswers = (blankId: string, answers: string[]) => {
    onChange({
      blanks: data.blanks.map((b) =>
        b.id === blankId ? { ...b, correct_answers: answers } : b
      ),
    });
  };

  const addAnswer = (blankId: string) => {
    onChange({
      blanks: data.blanks.map((b) =>
        b.id === blankId
          ? { ...b, correct_answers: [...b.correct_answers, ''] }
          : b
      ),
    });
  };

  const removeAnswer = (blankId: string, answerIndex: number) => {
    onChange({
      blanks: data.blanks.map((b) =>
        b.id === blankId
          ? {
              ...b,
              correct_answers: b.correct_answers.filter(
                (_, i) => i !== answerIndex
              ),
            }
          : b
      ),
    });
  };

  const updateAnswer = (
    blankId: string,
    answerIndex: number,
    value: string
  ) => {
    onChange({
      blanks: data.blanks.map((b) =>
        b.id === blankId
          ? {
              ...b,
              correct_answers: b.correct_answers.map((a, i) =>
                i === answerIndex ? value : a
              ),
            }
          : b
      ),
    });
  };

  const toggleCaseSensitive = (blankId: string, checked: boolean) => {
    onChange({
      blanks: data.blanks.map((b) =>
        b.id === blankId ? { ...b, case_sensitive: checked } : b
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TextCursorInput className="h-4 w-4" />
          Fill in the Blank Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text with blanks */}
        <div className="space-y-2">
          <Label htmlFor={`fib-text-${block.id}`}>Text with Blanks</Label>
          <Textarea
            id={`fib-text-${block.id}`}
            value={data.text_with_blanks}
            onChange={(e) => onChange({ text_with_blanks: e.target.value })}
            placeholder="Enter text with blank placeholders..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Use ___blank_1___, ___blank_2___ etc. as placeholders
          </p>
        </div>

        {/* Blanks */}
        <div className="space-y-2">
          <Label>Blanks</Label>
          <div className="space-y-3">
            {data.blanks.map((blank) => (
              <div
                key={blank.id}
                className="rounded-lg border border-border p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  {/* Blank ID display (read-only) */}
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {`___${blank.id}___`}
                  </span>

                  {/* Remove blank button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlank(blank.id)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    title="Remove blank"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Correct answers */}
                <div className="space-y-2">
                  <Label className="text-xs">Correct Answers</Label>
                  {blank.correct_answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center gap-2">
                      <Input
                        value={answer}
                        onChange={(e) =>
                          updateAnswer(blank.id, answerIndex, e.target.value)
                        }
                        placeholder={`Answer ${answerIndex + 1}`}
                        className="flex-1"
                      />
                      {blank.correct_answers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnswer(blank.id, answerIndex)}
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          title="Remove answer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addAnswer(blank.id)}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Answer
                  </Button>
                </div>

                {/* Case sensitive toggle */}
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`fib-case-${block.id}-${blank.id}`}
                    className="cursor-pointer text-xs"
                  >
                    Case sensitive
                  </Label>
                  <Switch
                    id={`fib-case-${block.id}-${blank.id}`}
                    checked={blank.case_sensitive}
                    onCheckedChange={(checked) =>
                      toggleCaseSensitive(blank.id, checked)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addBlank}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Blank
          </Button>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label htmlFor={`fib-explanation-${block.id}`}>Explanation</Label>
          <Textarea
            id={`fib-explanation-${block.id}`}
            value={data.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            placeholder="Explanation shown after answering (e.g. why the correct answers are correct)"
            className="min-h-[80px]"
          />
        </div>

        {/* Points */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Label htmlFor={`fib-points-${block.id}`}>Points</Label>
          <Input
            id={`fib-points-${block.id}`}
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
