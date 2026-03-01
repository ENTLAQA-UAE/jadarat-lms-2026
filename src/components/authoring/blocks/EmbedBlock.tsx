'use client';

import { type EmbedBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface EmbedBlockEditorProps {
  block: EmbedBlock;
  onChange: (data: Partial<EmbedBlock['data']>) => void;
}

export function EmbedBlockEditor({ block, onChange }: EmbedBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ExternalLink className="h-4 w-4" />
          Embed Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL */}
        <div className="space-y-2">
          <Label htmlFor={`embed-url-${block.id}`}>URL</Label>
          <Input
            id={`embed-url-${block.id}`}
            value={data.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            type="url"
          />
        </div>

        {/* Provider */}
        <div className="space-y-2">
          <Label htmlFor={`embed-provider-${block.id}`}>Provider</Label>
          <select
            id={`embed-provider-${block.id}`}
            value={data.provider}
            onChange={(e) =>
              onChange({
                provider: e.target.value as EmbedBlock['data']['provider'],
              })
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="google_slides">Google Slides</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label htmlFor={`embed-ratio-${block.id}`}>Aspect Ratio</Label>
          <select
            id={`embed-ratio-${block.id}`}
            value={data.aspect_ratio}
            onChange={(e) =>
              onChange({
                aspect_ratio: e.target.value as EmbedBlock['data']['aspect_ratio'],
              })
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
          </select>
        </div>

        {/* Allow Fullscreen */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`embed-fullscreen-${block.id}`} className="cursor-pointer">
            Allow Fullscreen
          </Label>
          <Switch
            id={`embed-fullscreen-${block.id}`}
            checked={data.allow_fullscreen}
            onCheckedChange={(checked) =>
              onChange({ allow_fullscreen: checked })
            }
          />
        </div>

        {/* Preview */}
        {data.url && (
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                src={data.url}
                className="w-full"
                style={{ maxHeight: 200 }}
                title="Embed preview"
                allowFullScreen={data.allow_fullscreen}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
