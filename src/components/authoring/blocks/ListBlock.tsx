'use client';

import { type ListBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Plus, Trash2, List as ListIcon } from 'lucide-react';

interface ListBlockEditorProps {
  block: ListBlock;
  onChange: (data: Partial<ListBlock['data']>) => void;
}

export function ListBlockEditor({ block, onChange }: ListBlockEditorProps) {
  const { data } = block;

  const addItem = () => {
    const newItem = {
      id: uuidv4(),
      text: '',
      icon: '',
    };
    onChange({ items: [...data.items, newItem] });
  };

  const removeItem = (itemId: string) => {
    onChange({ items: data.items.filter((item) => item.id !== itemId) });
  };

  const updateItem = (
    itemId: string,
    field: 'text' | 'icon',
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
          <ListIcon className="h-4 w-4" />
          List Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* List items */}
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
                    htmlFor={`list-text-${item.id}`}
                    className="text-xs"
                  >
                    Text
                  </Label>
                  <Input
                    id={`list-text-${item.id}`}
                    value={item.text}
                    onChange={(e) =>
                      updateItem(item.id, 'text', e.target.value)
                    }
                    placeholder="Item text"
                  />
                </div>
                {data.style === 'icon' && (
                  <div className="space-y-1">
                    <Label
                      htmlFor={`list-icon-${item.id}`}
                      className="text-xs"
                    >
                      Icon (optional)
                    </Label>
                    <Input
                      id={`list-icon-${item.id}`}
                      value={item.icon ?? ''}
                      onChange={(e) =>
                        updateItem(item.id, 'icon', e.target.value)
                      }
                      placeholder="Emoji or icon character"
                    />
                  </div>
                )}
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

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="space-y-2">
            <Label htmlFor={`list-style-${block.id}`}>Style</Label>
            <select
              id={`list-style-${block.id}`}
              value={data.style}
              onChange={(e) =>
                onChange({
                  style: e.target.value as 'bullet' | 'numbered' | 'icon',
                })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="bullet">Bullet</option>
              <option value="numbered">Numbered</option>
              <option value="icon">Icon</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`list-columns-${block.id}`}>Columns</Label>
            <select
              id={`list-columns-${block.id}`}
              value={data.columns}
              onChange={(e) =>
                onChange({ columns: Number(e.target.value) as 1 | 2 | 3 })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
