'use client';

import { useState, useCallback, useRef } from 'react';
import { type AudioBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, Upload, X, FileAudio } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioBlockEditorProps {
  block: AudioBlock;
  onChange: (data: Partial<AudioBlock['data']>) => void;
}

export function AudioBlockEditor({ block, onChange }: AudioBlockEditorProps) {
  const { data } = block;
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAudio = useCallback(async (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm', 'audio/aac'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i)) {
      toast.error('Invalid file type', { description: 'Please upload an audio file (MP3, WAV, OGG, M4A).' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum audio file size is 50 MB.' });
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      if (!membership) throw new Error('No organization found');

      const orgId = membership.organization_id;
      const ext = file.name.split('.').pop() || 'mp3';
      const fileName = `block-audio/${uuidv4()}.${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from(`LMS Resources/${orgId}`)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw new Error(error.message || 'Failed to upload');

      const { data: urlData, error: urlError } = await supabase.storage
        .from('LMS Resources')
        .createSignedUrl(`${orgId}/${uploadData.path}`, 630720000);

      if (urlError) throw new Error(urlError.message || 'Failed to generate URL');

      // Auto-detect duration
      let durationSeconds = 0;
      try {
        const audio = new Audio(urlData.signedUrl);
        await new Promise<void>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            durationSeconds = Math.round(audio.duration);
            resolve();
          });
          audio.addEventListener('error', () => resolve());
          setTimeout(resolve, 5000);
        });
      } catch {
        // Duration detection is best-effort
      }

      onChange({
        src: urlData.signedUrl,
        ...(durationSeconds > 0 ? { duration_seconds: durationSeconds } : {}),
        ...(data.title ? {} : { title: file.name.replace(/\.[^/.]+$/, '') }),
      });
      toast.success('Audio uploaded');
    } catch (err) {
      toast.error('Upload failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setUploading(false);
    }
  }, [data.title, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadAudio(file);
  }, [uploadAudio]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAudio(file);
    e.target.value = '';
  }, [uploadAudio]);

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

        {/* Upload zone or preview */}
        {data.src ? (
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileAudio className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{data.title || 'Audio file'}</p>
                  {data.duration_seconds > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(data.duration_seconds / 60)}:{String(data.duration_seconds % 60).padStart(2, '0')}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => onChange({ src: '', duration_seconds: 0 })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {/* Audio preview player */}
              <audio
                controls
                src={data.src}
                className="w-full h-10"
                preload="metadata"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div
              className={cn(
                'rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30',
                uploading && 'pointer-events-none opacity-60',
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                {uploading ? 'Uploading...' : 'Drop audio file here or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                MP3, WAV, OGG, M4A — Max 50 MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Fallback URL input */}
            <div className="space-y-1">
              <Label htmlFor={`audio-src-${block.id}`} className="text-xs text-muted-foreground">
                Or paste audio URL
              </Label>
              <Input
                id={`audio-src-${block.id}`}
                value={data.src}
                onChange={(e) => onChange({ src: e.target.value })}
                placeholder="https://example.com/audio.mp3"
                type="url"
              />
            </div>
          </div>
        )}

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
