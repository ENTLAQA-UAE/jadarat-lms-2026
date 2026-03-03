'use client';

import { type CalloutBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, CheckCircle2, XCircle, MessageSquareWarning } from 'lucide-react';

interface CalloutBlockEditorProps {
  block: CalloutBlock;
  onChange: (data: Partial<CalloutBlock['data']>) => void;
}

const VARIANTS = [
  {
    value: 'info' as const,
    label: 'Info',
    icon: Info,
    color: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200',
    iconColor: 'text-blue-500',
  },
  {
    value: 'warning' as const,
    label: 'Warning',
    icon: AlertTriangle,
    color: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
    iconColor: 'text-amber-500',
  },
  {
    value: 'success' as const,
    label: 'Success',
    icon: CheckCircle2,
    color: 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200',
    iconColor: 'text-green-500',
  },
  {
    value: 'error' as const,
    label: 'Error',
    icon: XCircle,
    color: 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200',
    iconColor: 'text-red-500',
  },
];

export function CalloutBlockEditor({
  block,
  onChange,
}: CalloutBlockEditorProps) {
  const { data } = block;
  const activeVariant = VARIANTS.find((v) => v.value === data.variant) || VARIANTS[0];
  const ActiveIcon = activeVariant.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquareWarning className="h-4 w-4" />
          Callout Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Variant selector */}
        <div className="space-y-2">
          <Label>Type</Label>
          <div className="grid grid-cols-4 gap-2">
            {VARIANTS.map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => onChange({ variant: v.value })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                    data.variant === v.value
                      ? `${v.color} border-2 shadow-sm`
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className={cn('h-4 w-4', data.variant === v.value && v.iconColor)} />
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live preview */}
        <div
          className={cn(
            'flex gap-3 rounded-lg border-l-4 p-4',
            activeVariant.color
          )}
        >
          <ActiveIcon className={cn('h-5 w-5 shrink-0 mt-0.5', activeVariant.iconColor)} />
          <div className="min-w-0">
            <p className="font-semibold text-sm">
              {data.title || 'Callout title'}
            </p>
            {data.content && (
              <div
                className="mt-1 text-sm opacity-90 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: data.content || '<p>Callout content</p>' }}
              />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`callout-title-${block.id}`}>Title</Label>
          <Input
            id={`callout-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g., Important Note"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor={`callout-content-${block.id}`}>Content</Label>
          <Textarea
            id={`callout-content-${block.id}`}
            value={data.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Callout body text (HTML supported)"
            className="min-h-[100px]"
          />
        </div>

        {/* Collapsible toggle */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Label
            htmlFor={`callout-collapsible-${block.id}`}
            className="cursor-pointer"
          >
            Collapsible
          </Label>
          <Switch
            id={`callout-collapsible-${block.id}`}
            checked={data.collapsible}
            onCheckedChange={(checked) =>
              onChange({ collapsible: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
