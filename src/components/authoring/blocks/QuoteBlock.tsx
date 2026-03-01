'use client';

import { type QuoteBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote as QuoteIcon } from 'lucide-react';

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  onChange: (data: Partial<QuoteBlock['data']>) => void;
}

export function QuoteBlockEditor({ block, onChange }: QuoteBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <QuoteIcon className="h-4 w-4" />
          Quote Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quote text */}
        <div className="space-y-2">
          <Label htmlFor={`quote-text-${block.id}`}>Quote Text</Label>
          <Textarea
            id={`quote-text-${block.id}`}
            value={data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Enter the quote text..."
            className="min-h-[120px] resize-y"
          />
        </div>

        {/* Attribution */}
        <div className="space-y-2">
          <Label htmlFor={`quote-attribution-${block.id}`}>Attribution</Label>
          <Input
            id={`quote-attribution-${block.id}`}
            value={data.attribution}
            onChange={(e) => onChange({ attribution: e.target.value })}
            placeholder="Who said it?"
          />
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label htmlFor={`quote-style-${block.id}`}>Style</Label>
          <select
            id={`quote-style-${block.id}`}
            value={data.style}
            onChange={(e) =>
              onChange({
                style: e.target.value as QuoteBlock['data']['style'],
              })
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="highlight">Highlight</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
