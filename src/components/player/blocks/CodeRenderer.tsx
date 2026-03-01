'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CodeBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface CodeRendererProps {
  block: CodeBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function CodeRenderer({
  block,
  progress,
  onComplete,
}: CodeRendererProps) {
  const { code, language, show_line_numbers, caption } = block.data;
  const [copied, setCopied] = useState(false);

  // Auto-complete on mount
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-border bg-[#1e1e2e] text-[#cdd6f4]">
        {/* Top bar with language badge and copy button */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#181825] px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#a6adc8]">
            {language}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 text-xs text-[#a6adc8] hover:bg-white/10 hover:text-[#cdd6f4]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Code content */}
        <div className="overflow-x-auto p-4">
          <pre className="text-sm leading-relaxed">
            <code className="font-mono">
              {show_line_numbers ? (
                <table className="border-collapse">
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={index}>
                        <td className="select-none pr-4 text-end text-xs text-[#585b70]">
                          {index + 1}
                        </td>
                        <td className="whitespace-pre">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                code
              )}
            </code>
          </pre>
        </div>
      </div>

      {caption && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}
