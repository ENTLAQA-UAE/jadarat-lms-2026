'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIImageGeneratorProps {
  /** Called with the CDN image URL when generation is complete */
  onGenerated: (imageUrl: string) => void;
  /** Default prompt pre-filled (e.g., from block context) */
  defaultPrompt?: string;
  /** Button variant */
  variant?: 'icon' | 'button';
  /** For cover blocks use landscape, for regular images use square */
  defaultSize?: '1024x1024' | '1792x1024' | '1024x1792';
  className?: string;
}

export function AIImageGenerator({
  onGenerated,
  defaultPrompt = '',
  variant = 'button',
  defaultSize = '1792x1024',
  className,
}: AIImageGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [size, setSize] = useState(defaultSize);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useState<'natural' | 'vivid'>('natural');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), size, quality, style }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      onGenerated(data.image_url);
      toast.success('Image generated successfully');
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate image'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'icon' ? (
          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-primary transition-colors ${className || ''}`}
            title="Generate with AI"
          >
            <Wand2 className="h-4 w-4" />
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={className}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Generate with AI
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Image Generation
            </h4>
            <p className="text-xs text-muted-foreground">
              Describe the image you want and DALL-E 3 will create it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-image-prompt">Image Description</Label>
            <Input
              id="ai-image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A professional workspace with modern technology..."
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Select
                value={size}
                onValueChange={(v: typeof size) => setSize(v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square</SelectItem>
                  <SelectItem value="1792x1024">Landscape</SelectItem>
                  <SelectItem value="1024x1792">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Quality</Label>
              <Select
                value={quality}
                onValueChange={(v: typeof quality) => setQuality(v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Style</Label>
              <Select
                value={style}
                onValueChange={(v: typeof style) => setStyle(v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="vivid">Vivid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-1.5" />
                Generate Image
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Powered by DALL-E 3 &middot; ~$0.04-0.12 per image
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Helper to generate an image from a GENERATE: marker.
 * Used by the generation pipeline to auto-resolve image prompts.
 */
export async function resolveGenerateMarker(
  marker: string,
  isCover: boolean = false
): Promise<string> {
  const prompt = marker.replace(/^GENERATE:/, '').trim();
  if (!prompt) return '';

  const res = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      size: isCover ? '1792x1024' : '1024x1024',
      quality: 'standard',
      style: 'natural',
    }),
  });

  if (!res.ok) return '';

  const data = await res.json();
  return data.image_url || '';
}
