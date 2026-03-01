'use client';

import { type SortingBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Plus, Trash2 } from 'lucide-react';

interface SortingBlockEditorProps {
  block: SortingBlock;
  onChange: (data: Partial<SortingBlock['data']>) => void;
}

export function SortingBlockEditor({
  block,
  onChange,
}: SortingBlockEditorProps) {
  const { data } = block;

  // ── Category helpers ──────────────────────────────────────

  const addCategory = () => {
    const newCategory = {
      id: uuidv4(),
      name: '',
    };
    onChange({ categories: [...data.categories, newCategory] });
  };

  const removeCategory = (categoryId: string) => {
    // Also clear any items that referenced this category
    const updatedItems = data.items.map((item) =>
      item.correct_category_id === categoryId
        ? { ...item, correct_category_id: '' }
        : item
    );
    onChange({
      categories: data.categories.filter((cat) => cat.id !== categoryId),
      items: updatedItems,
    });
  };

  const updateCategoryName = (categoryId: string, name: string) => {
    onChange({
      categories: data.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, name } : cat
      ),
    });
  };

  // ── Item helpers ──────────────────────────────────────────

  const addItem = () => {
    const newItem = {
      id: uuidv4(),
      text: '',
      correct_category_id: '',
    };
    onChange({ items: [...data.items, newItem] });
  };

  const removeItem = (itemId: string) => {
    onChange({ items: data.items.filter((item) => item.id !== itemId) });
  };

  const updateItem = (
    itemId: string,
    field: 'text' | 'correct_category_id',
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
          <ArrowUpDown className="h-4 w-4" />
          Sorting Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instruction */}
        <div className="space-y-2">
          <Label htmlFor={`sorting-instruction-${block.id}`}>
            Instruction
          </Label>
          <Textarea
            id={`sorting-instruction-${block.id}`}
            value={data.instruction}
            onChange={(e) => onChange({ instruction: e.target.value })}
            placeholder="Enter sorting instruction (e.g. Sort these items into the correct categories)"
            className="min-h-[80px]"
          />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label>Categories</Label>
          <div className="space-y-3">
            {data.categories.map((category, index) => (
              <div
                key={category.id}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Category {index + 1}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(category.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={data.categories.length <= 2}
                    title="Remove category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  <Label
                    htmlFor={`sorting-cat-name-${category.id}`}
                    className="text-xs"
                  >
                    Name
                  </Label>
                  <Input
                    id={`sorting-cat-name-${category.id}`}
                    value={category.name}
                    onChange={(e) =>
                      updateCategoryName(category.id, e.target.value)
                    }
                    placeholder="Category name"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addCategory}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <Label>Items</Label>
          <div className="space-y-3">
            {data.items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={data.items.length <= 2}
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor={`sorting-item-text-${item.id}`}
                      className="text-xs"
                    >
                      Text
                    </Label>
                    <Input
                      id={`sorting-item-text-${item.id}`}
                      value={item.text}
                      onChange={(e) =>
                        updateItem(item.id, 'text', e.target.value)
                      }
                      placeholder="Item text"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`sorting-item-cat-${item.id}`}
                      className="text-xs"
                    >
                      Correct Category
                    </Label>
                    <Select
                      value={item.correct_category_id}
                      onValueChange={(value) =>
                        updateItem(item.id, 'correct_category_id', value)
                      }
                    >
                      <SelectTrigger id={`sorting-item-cat-${item.id}`}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name || '(unnamed)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label htmlFor={`sorting-explanation-${block.id}`}>Explanation</Label>
          <Textarea
            id={`sorting-explanation-${block.id}`}
            value={data.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            placeholder="Explanation shown after answering (e.g. why items belong to each category)"
            className="min-h-[80px]"
          />
        </div>

        {/* Points */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`sorting-points-${block.id}`}>Points</Label>
            <Input
              id={`sorting-points-${block.id}`}
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
