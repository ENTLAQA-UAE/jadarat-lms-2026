'use client';

import { useState, useCallback, useRef } from 'react';
import { type ImageBlock } from '@/types/authoring';
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
  ImageIcon,
  Upload,
  Loader2,
  Trash2,
} from 'lucide-react';
import { AIImageGenerator } from '@/components/authoring/ai/AIImageGenerator';
import { useImageUpload } from './useImageUpload';

interface ImageBlockEditorProps {
  block: ImageBlock;
  onChange: (data: Partial<ImageBlock['data']>) => void;
}

export function ImageBlockEditor({ block, onChange }: ImageBlockEditorProps) {
  const { data } = block;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile } = useImageUpload();

  const handleFile = useCallback(
    async (file: File) => {
      const url = await uploadFile(file);
      if (url) {
        onChange({ src: url });
      }
    },
    [uploadFile, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));
      if (imageFile) handleFile(imageFile);
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset the input so the same file can be re-selected
      e.target.value = '';
    },
    [handleFile]
  );

  const widthOptions = [
    { value: 'small', label: 'Small (33%)' },
    { value: 'medium', label: 'Medium (50%)' },
    { value: 'large', label: 'Large (75%)' },
    { value: 'full', label: 'Full (100%)' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon className="h-4 w-4" />
          Image Block
          <AIImageGenerator
            onGenerated={(url) => onChange({ src: url })}
            defaultPrompt={data.alt || ''}
            defaultSize="1024x1024"
            className="ml-auto"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone / Preview */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : data.src
                ? 'border-border'
                : 'border-border bg-muted/30'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Uploading image...</p>
            </div>
          ) : data.src ? (
            <div className="relative w-full p-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.src}
                alt={data.alt || 'Preview'}
                className="mx-auto max-h-[300px] rounded-md object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChange({ src: '' })}
                title="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium">Drop an image here</p>
              <p className="text-xs">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Browse files
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF, WebP up to 10 MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Image URL (alternative) */}
        <div className="space-y-2">
          <Label htmlFor={`image-src-${block.id}`}>Image URL</Label>
          <Input
            id={`image-src-${block.id}`}
            value={data.src}
            onChange={(e) => onChange({ src: e.target.value })}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
          <p className="text-xs text-muted-foreground">
            Upload a file, paste a URL, or use &quot;Generate with AI&quot;.
          </p>
        </div>

        {/* Alt text */}
        <div className="space-y-2">
          <Label htmlFor={`image-alt-${block.id}`}>Alt Text</Label>
          <Input
            id={`image-alt-${block.id}`}
            value={data.alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Describe the image for accessibility"
          />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor={`image-caption-${block.id}`}>Caption (optional)</Label>
          <Input
            id={`image-caption-${block.id}`}
            value={data.caption ?? ''}
            onChange={(e) =>
              onChange({ caption: e.target.value || undefined })
            }
            placeholder="Image caption"
          />
        </div>

        {/* Width and Alignment */}
        <div className="grid grid-cols-2 gap-4">
          {/* Width */}
          <div className="space-y-2">
            <Label>Width</Label>
            <Select
              value={data.width}
              onValueChange={(
                value: 'small' | 'medium' | 'large' | 'full'
              ) => onChange({ width: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {widthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
