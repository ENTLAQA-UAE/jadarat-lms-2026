'use client';

import { type QuoteBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote as QuoteIcon, Plus, Trash2 } from 'lucide-react';

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  onChange: (data: Partial<QuoteBlock['data']>) => void;
}

export function QuoteBlockEditor({ block, onChange }: QuoteBlockEditorProps) {
  const { data } = block;
  const quotes = data.quotes ?? [];
  const isMultiQuote = quotes.length > 0;

  const addQuote = () => {
    const newQuote = { id: uuidv4(), text: '', attribution: '' };
    onChange({ quotes: [...quotes, newQuote] });
  };

  const removeQuote = (quoteId: string) => {
    onChange({ quotes: quotes.filter((q) => q.id !== quoteId) });
  };

  const updateQuote = (quoteId: string, field: 'text' | 'attribution', value: string) => {
    onChange({
      quotes: quotes.map((q) =>
        q.id === quoteId ? { ...q, [field]: value } : q,
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <QuoteIcon className="h-4 w-4" />
          Quote Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Single quote fields (legacy / simple mode) */}
        {!isMultiQuote && (
          <>
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
            <div className="space-y-2">
              <Label htmlFor={`quote-attribution-${block.id}`}>Attribution</Label>
              <Input
                id={`quote-attribution-${block.id}`}
                value={data.attribution}
                onChange={(e) => onChange({ attribution: e.target.value })}
                placeholder="Who said it?"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Convert single quote to multi-quote mode
                const initial = {
                  id: uuidv4(),
                  text: data.text || '',
                  attribution: data.attribution || '',
                };
                onChange({ quotes: [initial] });
              }}
              className="w-full text-xs"
            >
              <Plus className="mr-2 h-3 w-3" />
              Add More Quotes (Carousel Mode)
            </Button>
          </>
        )}

        {/* Multi-quote mode */}
        {isMultiQuote && (
          <>
            <div className="space-y-3">
              {quotes.map((quote, index) => (
                <div
                  key={quote.id}
                  className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Quote {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuote(quote.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={quotes.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Textarea
                    value={quote.text}
                    onChange={(e) => updateQuote(quote.id, 'text', e.target.value)}
                    placeholder="Quote text..."
                    className="min-h-[80px] resize-y"
                  />
                  <Input
                    value={quote.attribution}
                    onChange={(e) => updateQuote(quote.id, 'attribution', e.target.value)}
                    placeholder="Attribution"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addQuote} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Quote
            </Button>

            {/* Carousel toggle */}
            {quotes.length > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Label htmlFor={`quote-carousel-${block.id}`} className="cursor-pointer">
                  Carousel Mode
                </Label>
                <Switch
                  id={`quote-carousel-${block.id}`}
                  checked={data.carousel ?? false}
                  onCheckedChange={(checked) => onChange({ carousel: checked })}
                />
              </div>
            )}
          </>
        )}

        {/* Style */}
        <div className="space-y-2 border-t border-border pt-4">
          <Label htmlFor={`quote-style-${block.id}`}>Style</Label>
          <select
            id={`quote-style-${block.id}`}
            value={data.style}
            onChange={(e) =>
              onChange({ style: e.target.value as QuoteBlock['data']['style'] })
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
