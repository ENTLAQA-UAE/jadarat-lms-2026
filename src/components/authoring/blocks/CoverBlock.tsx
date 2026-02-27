'use client';

import { type CoverBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlignLeft, AlignCenter, AlignRight, Image } from 'lucide-react';

interface CoverBlockEditorProps {
  block: CoverBlock;
  onChange: (data: Partial<CoverBlock['data']>) => void;
}

export function CoverBlockEditor({ block, onChange }: CoverBlockEditorProps) {
  const { data } = block;

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
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: data.overlay_color || '#000000AA' }}
            />

            {/* Content */}
            <div
              className={`relative z-10 flex flex-1 flex-col justify-center px-6 ${textAlignMap[data.text_alignment]}`}
            >
              <h2
                className="text-lg font-bold text-white"
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {data.title || 'Cover Title'}
              </h2>
              {(data.subtitle || !data.title) && (
                <p
                  className="mt-1 text-sm text-white/80"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  {data.subtitle || 'Subtitle text'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Background image URL */}
        <div className="space-y-2">
          <Label htmlFor={`cover-bg-${block.id}`}>Background Image URL</Label>
          <Input
            id={`cover-bg-${block.id}`}
            value={data.background_image}
            onChange={(e) =>
              onChange({ background_image: e.target.value })
            }
            placeholder="https://example.com/background.jpg"
            type="url"
          />
          <p className="text-xs text-muted-foreground">
            Upload integration will be available in a future update.
          </p>
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

        {/* Overlay color */}
        <div className="space-y-2">
          <Label htmlFor={`cover-overlay-${block.id}`}>Overlay Color</Label>
          <div className="flex gap-2">
            <div
              className="h-9 w-9 shrink-0 rounded-md border border-border"
              style={{ backgroundColor: data.overlay_color || '#000000AA' }}
            />
            <Input
              id={`cover-overlay-${block.id}`}
              value={data.overlay_color}
              onChange={(e) => onChange({ overlay_color: e.target.value })}
              placeholder="#000000AA"
              className="font-mono text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Hex color with optional alpha channel (e.g., #000000AA for 67%
            opacity black)
          </p>
        </div>

        {/* Text alignment and Height */}
        <div className="grid grid-cols-2 gap-4">
          {/* Text alignment */}
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

          {/* Height */}
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
