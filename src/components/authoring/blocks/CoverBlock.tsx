'use client';

import { useCallback, useRef, useState } from 'react';
import { type CoverBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Upload,
  Loader2,
} from 'lucide-react';
import { AIImageGenerator } from '@/components/authoring/ai/AIImageGenerator';
import { useImageUpload } from './useImageUpload';

interface CoverBlockEditorProps {
  block: CoverBlock;
  onChange: (data: Partial<CoverBlock['data']>) => void;
}

/** Parse hex+alpha string like #1a73e8CC into { hex, opacity01 } */
function parseOverlayColor(raw: string): { hex: string; opacity: number } {
  const clean = raw.replace('#', '');
  if (clean.length === 8) {
    const hex = '#' + clean.slice(0, 6);
    const alpha = parseInt(clean.slice(6), 16);
    return { hex, opacity: Math.round((alpha / 255) * 100) };
  }
  if (clean.length === 6) {
    return { hex: '#' + clean, opacity: 100 };
  }
  return { hex: '#000000', opacity: 67 };
}

/** Build hex+alpha string from hex and opacity (0-100) */
function buildOverlayColor(hex: string, opacity: number): string {
  const alpha = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return hex + alpha;
}

export function CoverBlockEditor({ block, onChange }: CoverBlockEditorProps) {
  const { data } = block;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile } = useImageUpload();
  const [isDragging, setIsDragging] = useState(false);

  const { hex: overlayHex, opacity: overlayOpacity } = parseOverlayColor(
    data.overlay_color || '#000000AA'
  );

  const handleFile = useCallback(
    async (file: File) => {
      const url = await uploadFile(file);
      if (url) onChange({ background_image: url });
    },
    [uploadFile, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith('image/')
      );
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const heightMap = {
    small: '200px',
    medium: '400px',
    large: '600px',
  };

  const previewHeightMap = {
    small: 'h-[120px]',
    medium: 'h-[200px]',
    large: 'h-[280px]',
  };

  const textAlignMap = {
    start: 'text-start items-start',
    center: 'text-center items-center',
    end: 'text-end items-end',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Image className="h-4 w-4" />
          Cover Block
          <AIImageGenerator
            onGenerated={(url) => onChange({ background_image: url })}
            defaultPrompt={
              data.title
                ? `Professional e-learning cover background for: ${data.title}`
                : ''
            }
            defaultSize="1792x1024"
            className="ml-auto"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live preview */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          <div
            className={`relative flex overflow-hidden rounded-lg ${previewHeightMap[data.height]}`}
            style={{
              backgroundImage: data.background_image
                ? `url(${data.background_image})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: data.background_image
                ? undefined
                : '#1a1a2e',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor:
                  data.overlay_color || '#000000AA',
              }}
            />
            <div
              className={`relative z-10 flex flex-1 flex-col justify-center px-6 ${textAlignMap[data.text_alignment]}`}
            >
              <h2
                className="text-lg font-bold text-white"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              >
                {data.title || 'Cover Title'}
              </h2>
              {(data.subtitle || !data.title) && (
                <p
                  className="mt-1 text-sm text-white/80"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                >
                  {data.subtitle || 'Subtitle text'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Background image upload area */}
        <div className="space-y-2">
          <Label>Background Image</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <Input
              value={data.background_image}
              onChange={(e) =>
                onChange({ background_image: e.target.value })
              }
              placeholder="Drop image, paste URL, or use AI"
              type="url"
              className="border-0 shadow-none px-0 focus-visible:ring-0"
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Browse
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`cover-title-${block.id}`}>Title</Label>
          <Input
            id={`cover-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Cover title"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor={`cover-subtitle-${block.id}`}>
            Subtitle (optional)
          </Label>
          <Input
            id={`cover-subtitle-${block.id}`}
            value={data.subtitle ?? ''}
            onChange={(e) =>
              onChange({ subtitle: e.target.value || undefined })
            }
            placeholder="Cover subtitle"
          />
        </div>

        {/* Overlay: color picker + opacity slider */}
        <div className="space-y-2">
          <Label>Overlay</Label>
          <div className="flex items-center gap-3">
            {/* Color swatch + picker */}
            <label className="relative shrink-0">
              <div
                className="h-9 w-9 rounded-md border border-border cursor-pointer"
                style={{ backgroundColor: overlayHex }}
              />
              <input
                type="color"
                value={overlayHex}
                onChange={(e) =>
                  onChange({
                    overlay_color: buildOverlayColor(
                      e.target.value,
                      overlayOpacity
                    ),
                  })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>

            {/* Opacity slider */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Opacity</span>
                <span className="text-xs font-medium">{overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={overlayOpacity}
                onChange={(e) =>
                  onChange({
                    overlay_color: buildOverlayColor(
                      overlayHex,
                      Number(e.target.value)
                    ),
                  })
                }
                className="w-full h-1.5 rounded-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select
            value={data.layout || 'centered'}
            onValueChange={(value: string) => onChange({ layout: value as CoverBlock['data']['layout'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="centered">Centered</SelectItem>
              <SelectItem value="left_aligned">Left Aligned</SelectItem>
              <SelectItem value="split">Split (Image + Text)</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="gradient_overlay">Gradient Overlay</SelectItem>
              <SelectItem value="full_bleed">Full Bleed</SelectItem>
              <SelectItem value="pattern">Pattern Background</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text alignment and Height */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <div className="flex gap-1">
              {([
                { value: 'start', icon: AlignLeft, label: 'Start' },
                { value: 'center', icon: AlignCenter, label: 'Center' },
                { value: 'end', icon: AlignRight, label: 'End' },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ text_alignment: value })}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                    data.text_alignment === value
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

          <div className="space-y-2">
            <Label>Height</Label>
            <Select
              value={data.height}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                onChange({ height: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">
                  Small ({heightMap.small})
                </SelectItem>
                <SelectItem value="medium">
                  Medium ({heightMap.medium})
                </SelectItem>
                <SelectItem value="large">
                  Large ({heightMap.large})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
