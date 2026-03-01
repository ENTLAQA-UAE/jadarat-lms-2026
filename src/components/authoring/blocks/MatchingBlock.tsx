'use client';

import { type MatchingBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';

interface MatchingBlockEditorProps {
  block: MatchingBlock;
  onChange: (data: Partial<MatchingBlock['data']>) => void;
}

export function MatchingBlockEditor({
  block,
  onChange,
}: MatchingBlockEditorProps) {
  const { data } = block;

  const addPair = () => {
    const newPair = {
      id: uuidv4(),
      left: '',
      right: '',
    };
    onChange({ pairs: [...data.pairs, newPair] });
  };

  const removePair = (pairId: string) => {
    onChange({ pairs: data.pairs.filter((pair) => pair.id !== pairId) });
  };

  const updatePair = (
    pairId: string,
    field: 'left' | 'right',
    value: string
  ) => {
    onChange({
      pairs: data.pairs.map((pair) =>
        pair.id === pairId ? { ...pair, [field]: value } : pair
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ArrowLeftRight className="h-4 w-4" />
          Matching Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instruction */}
        <div className="space-y-2">
          <Label htmlFor={`matching-instruction-${block.id}`}>
            Instruction
          </Label>
          <Textarea
            id={`matching-instruction-${block.id}`}
            value={data.instruction}
            onChange={(e) => onChange({ instruction: e.target.value })}
            placeholder="Enter instructions for the matching activity..."
            className="min-h-[80px]"
          />
        </div>

        {/* Pairs */}
        <div className="space-y-2">
          <Label>Pairs</Label>
          <div className="space-y-3">
            {data.pairs.map((pair, index) => (
              <div
                key={pair.id}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pair {index + 1}
                  </span>

                  <div className="flex-1" />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePair(pair.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={data.pairs.length <= 2}
                    title="Remove pair"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor={`matching-left-${pair.id}`}
                      className="text-xs"
                    >
                      Prompt (Left)
                    </Label>
                    <Input
                      id={`matching-left-${pair.id}`}
                      value={pair.left}
                      onChange={(e) =>
                        updatePair(pair.id, 'left', e.target.value)
                      }
                      placeholder="Question / prompt"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`matching-right-${pair.id}`}
                      className="text-xs"
                    >
                      Answer (Right)
                    </Label>
                    <Input
                      id={`matching-right-${pair.id}`}
                      value={pair.right}
                      onChange={(e) =>
                        updatePair(pair.id, 'right', e.target.value)
                      }
                      placeholder="Correct match / answer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addPair}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Pair
          </Button>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label htmlFor={`matching-explanation-${block.id}`}>
            Explanation
          </Label>
          <Textarea
            id={`matching-explanation-${block.id}`}
            value={data.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            placeholder="Explanation shown after answering (e.g. why the correct matches are correct)"
            className="min-h-[80px]"
          />
        </div>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          {/* Points */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`matching-points-${block.id}`}>Points</Label>
            <Input
              id={`matching-points-${block.id}`}
              type="number"
              min={0}
              value={data.points}
              onChange={(e) =>
                onChange({ points: Math.max(0, parseInt(e.target.value) || 0) })
              }
              className="w-20 text-center"
            />
          </div>

          {/* Shuffle toggle */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`matching-shuffle-${block.id}`}
              className="cursor-pointer"
            >
              Shuffle answers
            </Label>
            <Switch
              id={`matching-shuffle-${block.id}`}
              checked={data.shuffle}
              onCheckedChange={(checked) => onChange({ shuffle: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
