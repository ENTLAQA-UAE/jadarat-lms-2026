'use client';

import { type AccordionBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Plus, Trash2, ChevronsUpDown } from 'lucide-react';

interface AccordionBlockEditorProps {
  block: AccordionBlock;
  onChange: (data: Partial<AccordionBlock['data']>) => void;
}

export function AccordionBlockEditor({
  block,
  onChange,
}: AccordionBlockEditorProps) {
  const { data } = block;

  const addItem = () => {
    const newItem = {
      id: uuidv4(),
      title: '',
      content: '',
    };
    onChange({ items: [...data.items, newItem] });
  };

  const removeItem = (itemId: string) => {
    onChange({ items: data.items.filter((item) => item.id !== itemId) });
  };

  const updateItem = (
    itemId: string,
    field: 'title' | 'content',
    value: string
  ) => {
    onChange({
      items: data.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ChevronsUpDown className="h-4 w-4" />
          Accordion Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accordion items */}
        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div
              key={item.id}
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
                  Item {index + 1}
                </span>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.items.length <= 1}
                  title="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`accordion-title-${item.id}`}
                    className="text-xs"
                  >
                    Title
                  </Label>
                  <Input
                    id={`accordion-title-${item.id}`}
                    value={item.title}
                    onChange={(e) =>
                      updateItem(item.id, 'title', e.target.value)
                    }
                    placeholder="Accordion item title"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`accordion-content-${item.id}`}
                    className="text-xs"
                  >
                    Content
                  </Label>
                  <Textarea
                    id={`accordion-content-${item.id}`}
                    value={item.content}
                    onChange={(e) =>
                      updateItem(item.id, 'content', e.target.value)
                    }
                    placeholder="Accordion item content"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>

        {/* Toggles */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`accordion-multiple-${block.id}`}
              className="cursor-pointer"
            >
              Allow multiple open
            </Label>
            <Switch
              id={`accordion-multiple-${block.id}`}
              checked={data.allow_multiple_open}
              onCheckedChange={(checked) =>
                onChange({ allow_multiple_open: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`accordion-expanded-${block.id}`}
              className="cursor-pointer"
            >
              Start expanded
            </Label>
            <Switch
              id={`accordion-expanded-${block.id}`}
              checked={data.start_expanded}
              onCheckedChange={(checked) =>
                onChange({ start_expanded: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
