'use client';

import {
  type TextBlock,
} from '@/types/authoring';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlignLeft } from 'lucide-react';
import { InlineAIToolbar } from '@/components/authoring/ai/InlineAIToolbar';
import { TiptapEditor } from './TiptapEditor';

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
        {/* Tiptap rich text editor */}
        <div className="space-y-2">
          <Label>Content</Label>
          <TiptapEditor
            content={data.content}
            onChange={(html) => onChange({ content: html })}
            direction={data.direction}
            placeholder="Start writing your lesson content..."
          />
        </div>

        {/* Direction control */}
        <div className="max-w-[200px]">
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
