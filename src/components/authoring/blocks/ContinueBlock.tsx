'use client';

import { type ContinueBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface ContinueBlockEditorProps {
  block: ContinueBlock;
  onChange: (data: Partial<ContinueBlock['data']>) => void;
}

const COMPLETION_TYPES = [
  {
    value: 'none' as const,
    label: 'None',
    description: 'Always enabled — learner can click to continue at any time.',
  },
  {
    value: 'above' as const,
    label: 'Complete Block Above',
    description: 'Requires the block directly above this one to be completed.',
  },
  {
    value: 'all_above' as const,
    label: 'Complete All Above',
    description: 'Requires all blocks above this one to be completed.',
  },
];

export function ContinueBlockEditor({
  block,
  onChange,
}: ContinueBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ArrowDown className="h-4 w-4" />
          Continue Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-8 py-3 text-sm font-medium',
              'bg-primary text-primary-foreground'
            )}
          >
            {data.label || 'Continue'}
          </div>
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor={`continue-label-${block.id}`}>Button Label</Label>
          <Input
            id={`continue-label-${block.id}`}
            value={data.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Continue"
          />
        </div>

        {/* Completion type */}
        <div className="space-y-2">
          <Label>Completion Requirement</Label>
          <div className="space-y-2">
            {COMPLETION_TYPES.map((ct) => (
              <button
                key={ct.value}
                type="button"
                onClick={() =>
                  onChange({ completion_type: ct.value })
                }
                className={cn(
                  'w-full flex flex-col gap-0.5 rounded-lg border p-3 text-start transition-all',
                  data.completion_type === ct.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:bg-muted'
                )}
              >
                <span className="text-sm font-medium">{ct.label}</span>
                <span className="text-xs text-muted-foreground">
                  {ct.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
