'use client';

import { type ButtonBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  SquareMousePointer,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface ButtonBlockEditorProps {
  block: ButtonBlock;
  onChange: (data: Partial<ButtonBlock['data']>) => void;
}

const STYLE_OPTIONS = [
  { value: 'primary' as const, label: 'Primary' },
  { value: 'secondary' as const, label: 'Secondary' },
  { value: 'outline' as const, label: 'Outline' },
  { value: 'ghost' as const, label: 'Ghost' },
];

const ACTION_OPTIONS = [
  { value: 'link' as const, label: 'External Link' },
  { value: 'next_lesson' as const, label: 'Next Lesson' },
  { value: 'previous_lesson' as const, label: 'Previous Lesson' },
  { value: 'scroll_top' as const, label: 'Scroll to Top' },
];

const ALIGNMENTS = [
  { value: 'start' as const, icon: AlignLeft },
  { value: 'center' as const, icon: AlignCenter },
  { value: 'end' as const, icon: AlignRight },
];

export function ButtonBlockEditor({
  block,
  onChange,
}: ButtonBlockEditorProps) {
  const { data } = block;

  const addButton = () => {
    onChange({
      buttons: [
        ...data.buttons,
        {
          id: uuidv4(),
          label: 'Button',
          action: 'link',
          style: 'primary',
        },
      ],
    });
  };

  const removeButton = (id: string) => {
    onChange({
      buttons: data.buttons.filter((b) => b.id !== id),
    });
  };

  const updateButton = (
    id: string,
    field: string,
    value: string | undefined
  ) => {
    onChange({
      buttons: data.buttons.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <SquareMousePointer className="h-4 w-4" />
          Button Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live preview */}
        <div
          className={cn(
            'flex gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4',
            data.layout === 'stacked' && 'flex-col',
            data.alignment === 'center' && 'justify-center items-center',
            data.alignment === 'end' && 'justify-end items-end',
            data.alignment === 'start' && 'justify-start items-start'
          )}
        >
          {data.buttons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                btn.style === 'primary' &&
                  'bg-primary text-primary-foreground',
                btn.style === 'secondary' &&
                  'bg-secondary text-secondary-foreground',
                btn.style === 'outline' &&
                  'border border-primary text-primary',
                btn.style === 'ghost' &&
                  'text-primary hover:bg-primary/10'
              )}
            >
              {btn.icon && <span className="mr-1.5">{btn.icon}</span>}
              {btn.label || 'Button'}
            </button>
          ))}
        </div>

        {/* Button items */}
        <div className="space-y-3">
          {data.buttons.map((btn, index) => (
            <div
              key={btn.id}
              className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Button {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeButton(btn.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.buttons.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={btn.label}
                    onChange={(e) =>
                      updateButton(btn.id, 'label', e.target.value)
                    }
                    placeholder="Button text"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Action</Label>
                  <select
                    value={btn.action}
                    onChange={(e) =>
                      updateButton(btn.id, 'action', e.target.value)
                    }
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {ACTION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {btn.action === 'link' && (
                <div className="space-y-1">
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={btn.url || ''}
                    onChange={(e) =>
                      updateButton(btn.id, 'url', e.target.value || undefined)
                    }
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Style</Label>
                <div className="flex gap-1">
                  {STYLE_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        updateButton(btn.id, 'style', s.value)
                      }
                      className={cn(
                        'flex-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                        btn.style === s.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addButton}
          className="w-full"
          disabled={data.buttons.length >= 4}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Button
        </Button>

        {/* Layout & Alignment */}
        <div className="flex gap-4 border-t border-border pt-4">
          <div className="space-y-1 flex-1">
            <Label className="text-xs">Layout</Label>
            <div className="flex gap-1">
              {(['inline', 'stacked'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onChange({ layout: l })}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                    data.layout === l
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alignment</Label>
            <div className="flex gap-1">
              {ALIGNMENTS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => onChange({ alignment: a.value })}
                    className={cn(
                      'rounded-md border p-1.5 transition-colors',
                      data.alignment === a.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
