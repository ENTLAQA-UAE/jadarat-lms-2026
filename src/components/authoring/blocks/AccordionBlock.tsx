'use client';

import { type AccordionBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from './TiptapEditor';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface AccordionBlockEditorProps {
  block: AccordionBlock;
  onChange: (data: Partial<AccordionBlock['data']>) => void;
}

const ICON_OPTIONS = [
  { value: '', label: 'None' },
  { value: '📌', label: 'Pin' },
  { value: '💡', label: 'Idea' },
  { value: '⚡', label: 'Lightning' },
  { value: '✅', label: 'Check' },
  { value: '📝', label: 'Note' },
  { value: '🔑', label: 'Key' },
  { value: '⚠️', label: 'Warning' },
  { value: '📖', label: 'Book' },
  { value: '🎯', label: 'Target' },
];

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
      icon: undefined,
    };
    onChange({ items: [...data.items, newItem] });
  };

  const removeItem = (itemId: string) => {
    onChange({ items: data.items.filter((item) => item.id !== itemId) });
  };

  const updateItem = (
    itemId: string,
    field: 'title' | 'content' | 'icon',
    value: string | undefined
  ) => {
    onChange({
      items: data.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.items.length) return;
    const items = [...data.items];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    onChange({ items });
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
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === data.items.length - 1}
                    className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <GripVertical className="h-4 w-4 text-muted-foreground/50" />

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
                {/* Icon + Title row */}
                <div className="flex gap-2">
                  {/* Icon selector */}
                  <select
                    value={item.icon || ''}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        'icon',
                        e.target.value || undefined
                      )
                    }
                    className="h-9 w-14 rounded-md border border-input bg-background px-1 text-center text-base"
                    title="Icon"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value || '—'}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 space-y-1">
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
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Content</Label>
                  <TiptapEditor
                    content={item.content}
                    onChange={(html) => updateItem(item.id, 'content', html)}
                    placeholder="Write accordion item content..."
                    className="min-h-[100px]"
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
