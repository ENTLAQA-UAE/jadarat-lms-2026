'use client';

import { type AudioBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones } from 'lucide-react';

interface AudioBlockEditorProps {
  block: AudioBlock;
  onChange: (data: Partial<AudioBlock['data']>) => void;
}

export function AudioBlockEditor({ block, onChange }: AudioBlockEditorProps) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Headphones className="h-4 w-4" />
          Audio Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`audio-title-${block.id}`}>Title</Label>
          <Input
            id={`audio-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Audio title"
          />
        </div>

        {/* Audio URL */}
        <div className="space-y-2">
          <Label htmlFor={`audio-src-${block.id}`}>Audio URL</Label>
          <Input
            id={`audio-src-${block.id}`}
            value={data.src}
            onChange={(e) => onChange({ src: e.target.value })}
            placeholder="https://example.com/audio.mp3"
            type="url"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor={`audio-duration-${block.id}`}>Duration (seconds)</Label>
          <Input
            id={`audio-duration-${block.id}`}
            type="number"
            min={0}
            value={data.duration_seconds}
            onChange={(e) =>
              onChange({ duration_seconds: Number(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>

        {/* Show Transcript Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`audio-transcript-toggle-${block.id}`} className="cursor-pointer">
            Show Transcript
          </Label>
          <Switch
            id={`audio-transcript-toggle-${block.id}`}
            checked={data.show_transcript}
            onCheckedChange={(checked) => onChange({ show_transcript: checked })}
          />
        </div>

        {/* Transcript */}
        {data.show_transcript && (
          <div className="space-y-2">
            <Label htmlFor={`audio-transcript-${block.id}`}>Transcript</Label>
            <Textarea
              id={`audio-transcript-${block.id}`}
              value={data.transcript ?? ''}
              onChange={(e) =>
                onChange({ transcript: e.target.value || undefined })
              }
              placeholder="Enter the audio transcript..."
              className="min-h-[120px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
