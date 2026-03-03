'use client';

import { type StatementBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight, MessageSquare } from 'lucide-react';

interface StatementBlockEditorProps {
  block: StatementBlock;
  onChange: (data: Partial<StatementBlock['data']>) => void;
}

const STYLES = [
  {
    value: 'bold' as const,
    label: 'Bold',
    description: 'Large bold text, centered',
  },
  {
    value: 'bordered' as const,
    label: 'Bordered',
    description: 'Left border accent',
  },
  {
    value: 'background' as const,
    label: 'Background',
    description: 'Full color background',
  },
  {
    value: 'note' as const,
    label: 'Note',
    description: 'Callout-style note',
  },
];

const ALIGNMENTS = [
  { value: 'start' as const, icon: AlignLeft, label: 'Start' },
  { value: 'center' as const, icon: AlignCenter, label: 'Center' },
  { value: 'end' as const, icon: AlignRight, label: 'End' },
];

export function StatementBlockEditor({
  block,
  onChange,
}: StatementBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4" />
          Statement Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Style selector */}
        <div className="space-y-2">
          <Label>Style</Label>
          <div className="grid grid-cols-4 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ style: s.value })}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                  data.style === s.value
                    ? 'border-primary bg-primary/10 text-primary border-2 shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div
          className={cn(
            'rounded-lg p-6 transition-all',
            data.style === 'bold' && 'text-center',
            data.style === 'bordered' && 'border-l-4 border-primary bg-muted/30',
            data.style === 'background' && 'bg-primary/10 text-center',
            data.style === 'note' && 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
          )}
          style={{
            textAlign: data.alignment || 'center',
            ...(data.style === 'bordered' && data.accent_color
              ? { borderColor: data.accent_color }
              : {}),
            ...(data.style === 'background' && data.accent_color
              ? { backgroundColor: `${data.accent_color}15` }
              : {}),
          }}
        >
          <p
            className={cn(
              'leading-relaxed',
              data.style === 'bold'
                ? 'text-xl font-bold'
                : data.style === 'note'
                  ? 'text-sm italic'
                  : 'text-base font-medium'
            )}
          >
            {data.text || 'Your statement text here...'}
          </p>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <Label htmlFor={`statement-text-${block.id}`}>Statement Text</Label>
          <Textarea
            id={`statement-text-${block.id}`}
            value={data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Enter a key takeaway, important fact, or emphasis statement..."
            className="min-h-[100px]"
          />
        </div>

        {/* Alignment */}
        <div className="space-y-2">
          <Label>Alignment</Label>
          <div className="flex gap-1">
            {ALIGNMENTS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => onChange({ alignment: a.value })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    data.alignment === a.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        {(data.style === 'bordered' || data.style === 'background') && (
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.accent_color || '#6366f1'}
                onChange={(e) => onChange({ accent_color: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-input"
              />
              <Input
                type="text"
                value={data.accent_color || ''}
                onChange={(e) => onChange({ accent_color: e.target.value })}
                placeholder="#6366f1"
                className="h-8 w-28 font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Media URL */}
        <div className="space-y-2">
          <Label htmlFor={`statement-media-${block.id}`}>
            Background Image URL (optional)
          </Label>
          <Input
            id={`statement-media-${block.id}`}
            value={data.media_url || ''}
            onChange={(e) =>
              onChange({ media_url: e.target.value || undefined })
            }
            placeholder="https://..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
