'use client';

import { type CodeBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code as CodeIcon } from 'lucide-react';

interface CodeBlockEditorProps {
  block: CodeBlock;
  onChange: (data: Partial<CodeBlock['data']>) => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
];

export function CodeBlockEditor({ block, onChange }: CodeBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CodeIcon className="h-4 w-4" />
          Code Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code textarea */}
        <div className="space-y-2">
          <Label htmlFor={`code-content-${block.id}`}>Code</Label>
          <Textarea
            id={`code-content-${block.id}`}
            value={data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="Enter your code here..."
            className="min-h-[200px] resize-y font-mono text-sm"
          />
        </div>

        {/* Language select */}
        <div className="space-y-2">
          <Label htmlFor={`code-language-${block.id}`}>Language</Label>
          <select
            id={`code-language-${block.id}`}
            value={data.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`code-linenums-${block.id}`}
              className="cursor-pointer"
            >
              Show Line Numbers
            </Label>
            <Switch
              id={`code-linenums-${block.id}`}
              checked={data.show_line_numbers}
              onCheckedChange={(checked) =>
                onChange({ show_line_numbers: checked })
              }
            />
          </div>

          {/* Theme selector */}
          <div className="space-y-2">
            <Label>Code Theme</Label>
            <div className="flex gap-1">
              {([
                { value: 'auto', label: 'Auto' },
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ theme: opt.value })}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                    (data.theme ?? 'auto') === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`code-caption-${block.id}`}>Caption (optional)</Label>
            <Input
              id={`code-caption-${block.id}`}
              value={data.caption ?? ''}
              onChange={(e) =>
                onChange({ caption: e.target.value || undefined })
              }
              placeholder="Code caption"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
