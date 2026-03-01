'use client';

import { type FlashcardBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Plus, Trash2, Layers } from 'lucide-react';

interface FlashcardBlockEditorProps {
  block: FlashcardBlock;
  onChange: (data: Partial<FlashcardBlock['data']>) => void;
}

export function FlashcardBlockEditor({
  block,
  onChange,
}: FlashcardBlockEditorProps) {
  const { data } = block;

  const addCard = () => {
    const newCard = {
      id: uuidv4(),
      front: '',
      back: '',
    };
    onChange({ cards: [...data.cards, newCard] });
  };

  const removeCard = (cardId: string) => {
    onChange({ cards: data.cards.filter((card) => card.id !== cardId) });
  };

  const updateCard = (
    cardId: string,
    field: 'front' | 'back' | 'image_front' | 'image_back',
    value: string
  ) => {
    onChange({
      cards: data.cards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4" />
          Flashcard Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Flashcard items */}
        <div className="space-y-3">
          {data.cards.map((card, index) => (
            <div
              key={card.id}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                {/* Drag handle (visual only) */}
                <div
                  className="flex cursor-grab items-center text-muted-foreground"
                  title="Drag to reorder (coming soon)"
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-muted-foreground">
                  Card {index + 1}
                </span>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCard(card.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.cards.length <= 1}
                  title="Remove card"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`flashcard-front-${card.id}`}
                    className="text-xs"
                  >
                    Front Text
                  </Label>
                  <Textarea
                    id={`flashcard-front-${card.id}`}
                    value={card.front}
                    onChange={(e) =>
                      updateCard(card.id, 'front', e.target.value)
                    }
                    placeholder="Front side of the card"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`flashcard-image-front-${card.id}`}
                    className="text-xs"
                  >
                    Front Image URL (optional)
                  </Label>
                  <Input
                    id={`flashcard-image-front-${card.id}`}
                    value={card.image_front ?? ''}
                    onChange={(e) =>
                      updateCard(card.id, 'image_front', e.target.value)
                    }
                    placeholder="https://example.com/image.png"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`flashcard-back-${card.id}`}
                    className="text-xs"
                  >
                    Back Text
                  </Label>
                  <Textarea
                    id={`flashcard-back-${card.id}`}
                    value={card.back}
                    onChange={(e) =>
                      updateCard(card.id, 'back', e.target.value)
                    }
                    placeholder="Back side of the card"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`flashcard-image-back-${card.id}`}
                    className="text-xs"
                  >
                    Back Image URL (optional)
                  </Label>
                  <Input
                    id={`flashcard-image-back-${card.id}`}
                    value={card.image_back ?? ''}
                    onChange={(e) =>
                      updateCard(card.id, 'image_back', e.target.value)
                    }
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add card button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addCard}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`flashcard-shuffle-${block.id}`}
              className="cursor-pointer"
            >
              Shuffle cards
            </Label>
            <Switch
              id={`flashcard-shuffle-${block.id}`}
              checked={data.shuffle}
              onCheckedChange={(checked) => onChange({ shuffle: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
