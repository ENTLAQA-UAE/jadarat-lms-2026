'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sparkles,
  Expand,
  Shrink,
  Languages,
  RefreshCw,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type RefineAction = 'expand' | 'simplify' | 'translate' | 'rephrase' | 'addExample';

interface InlineAIToolbarProps {
  content: string;
  language: 'ar' | 'en';
  onUpdate: (newContent: string) => void;
  className?: string;
}

const ACTIONS: {
  key: RefineAction;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: 'expand',
    label: 'Expand',
    icon: Expand,
    description: 'Add more detail and examples',
  },
  {
    key: 'simplify',
    label: 'Simplify',
    icon: Shrink,
    description: 'Simpler language and shorter sentences',
  },
  {
    key: 'translate',
    label: 'Translate',
    icon: Languages,
    description: 'Translate to the other language',
  },
  {
    key: 'rephrase',
    label: 'Rephrase',
    icon: RefreshCw,
    description: 'Rewrite in a different tone',
  },
  {
    key: 'addExample',
    label: 'Add Example',
    icon: Lightbulb,
    description: 'Add a MENA-relevant example',
  },
];

export function InlineAIToolbar({
  content,
  language,
  onUpdate,
  className,
}: InlineAIToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<RefineAction | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleAction = async (action: RefineAction) => {
    if (!content.trim()) {
      toast.error('No content to refine');
      return;
    }

    setLoading(action);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai/refine-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          action,
          language,
          target_language: language === 'ar' ? 'en' : 'ar',
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Refine failed');
      }

      // Read streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      if (result.trim()) {
        onUpdate(result.trim());
        toast.success(`Content ${action === 'addExample' ? 'updated with example' : action + 'd'}`);
      }

      setIsOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('AI refine failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${className}`}
          aria-label="AI refine options"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <div className="space-y-0.5">
          {ACTIONS.map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              onClick={() => handleAction(key)}
              disabled={loading !== null}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors disabled:opacity-50 text-left"
            >
              {loading === key ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              <div>
                <p className="font-medium text-xs">{label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
