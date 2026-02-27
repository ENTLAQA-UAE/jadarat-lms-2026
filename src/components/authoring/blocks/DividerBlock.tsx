'use client';

import { type DividerBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus } from 'lucide-react';

interface DividerBlockEditorProps {
  block: DividerBlock;
  onChange: (data: Partial<DividerBlock['data']>) => void;
}

export function DividerBlockEditor({
  block,
  onChange,
}: DividerBlockEditorProps) {
  const { data } = block;

  const styles: { value: DividerBlock['data']['style']; label: string }[] = [
    { value: 'line', label: 'Line' },
    { value: 'dots', label: 'Dots' },
    { value: 'space', label: 'Space' },
  ];

  const spacings: {
    value: DividerBlock['data']['spacing'];
    label: string;
    description: string;
  }[] = [
    { value: 'small', label: 'Small', description: '16px' },
    { value: 'medium', label: 'Medium', description: '32px' },
    { value: 'large', label: 'Large', description: '48px' },
  ];

  const spacingMap = {
    small: 'py-2',
    medium: 'py-4',
    large: 'py-6',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Minus className="h-4 w-4" />
          Divider Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Style selector */}
        <div className="space-y-2">
          <Label>Style</Label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ style: value })}
                className={`flex h-16 flex-col items-center justify-center rounded-lg border-2 transition-colors ${
                  data.style === value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/50'
                }`}
              >
                {/* Visual preview for each style */}
                <div className="mb-1 flex w-full items-center justify-center px-3">
                  {value === 'line' && (
                    <div className="h-[1px] w-full bg-current" />
                  )}
                  {value === 'dots' && (
                    <div className="flex gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-current" />
                      <div className="h-1 w-1 rounded-full bg-current" />
                      <div className="h-1 w-1 rounded-full bg-current" />
                    </div>
                  )}
                  {value === 'space' && (
                    <div className="flex flex-col gap-0.5">
                      <div className="h-[1px] w-8 bg-current opacity-20" />
                      <div className="h-2" />
                      <div className="h-[1px] w-8 bg-current opacity-20" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacing selector */}
        <div className="space-y-2">
          <Label>Spacing</Label>
          <div className="grid grid-cols-3 gap-2">
            {spacings.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ spacing: value })}
                className={`flex flex-col items-center justify-center rounded-lg border-2 px-3 py-2 transition-colors ${
                  data.spacing === value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/50'
                }`}
              >
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-2 border-t border-border pt-4">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="text-xs text-muted-foreground">Content above</div>
            <div className={spacingMap[data.spacing]}>
              {data.style === 'line' && (
                <hr className="border-t border-border" />
              )}
              {data.style === 'dots' && (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                </div>
              )}
              {data.style === 'space' && <div className="h-0" />}
            </div>
            <div className="text-xs text-muted-foreground">Content below</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
