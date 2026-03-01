'use client';

import {
  type TextBlock,
  type BlockType,
} from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { InlineAIToolbar } from '@/components/authoring/ai/InlineAIToolbar';

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (data: Partial<TextBlock['data']>) => void;
}

export function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlignLeft className="h-4 w-4" />
          Text Block
          <InlineAIToolbar
            content={data.content}
            language={data.direction === 'rtl' ? 'ar' : 'en'}
            onUpdate={(newContent) => onChange({ content: newContent })}
            className="ml-auto"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content editor - simple textarea placeholder for Tiptap */}
        <div className="space-y-2">
          <Label htmlFor={`text-content-${block.id}`}>Content</Label>
          <Textarea
            id={`text-content-${block.id}`}
            value={data.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Enter text content... (Rich text editor will be integrated later)"
            className="min-h-[160px] resize-y"
            dir={data.direction === 'auto' ? undefined : data.direction}
          />
          <p className="text-xs text-muted-foreground">
            Tiptap rich text editor will replace this textarea in a future update.
          </p>
        </div>

        {/* Alignment and Direction controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* Alignment */}
          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-1">
              {([
                { value: 'start', icon: AlignLeft, label: 'Start' },
                { value: 'center', icon: AlignCenter, label: 'Center' },
                { value: 'end', icon: AlignRight, label: 'End' },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ alignment: value })}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                    data.alignment === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select
              value={data.direction}
              onValueChange={(value: 'rtl' | 'ltr' | 'auto') =>
                onChange({ direction: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rtl">RTL (Right to Left)</SelectItem>
                <SelectItem value="ltr">LTR (Left to Right)</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
