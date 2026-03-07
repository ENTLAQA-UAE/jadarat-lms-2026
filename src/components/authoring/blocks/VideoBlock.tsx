'use client';

import { type VideoBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video } from 'lucide-react';
import { VideoUploader } from '@/components/authoring/VideoUploader';

interface VideoBlockEditorProps {
  block: VideoBlock;
  onChange: (data: Partial<VideoBlock['data']>) => void;
}

export function VideoBlockEditor({ block, onChange }: VideoBlockEditorProps) {
  const { data } = block;
  const bunnyStreamHost = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Video className="h-4 w-4" />
          Video Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video player / placeholder */}
        <div className="overflow-hidden rounded-lg border border-border">
          {data.bunny_video_id && bunnyStreamHost ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://${bunnyStreamHost}/${data.bunny_video_id}`}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                title={data.title || 'Video player'}
              />
            </div>
          ) : data.thumbnail_url ? (
            <div className="relative aspect-video w-full bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.thumbnail_url}
                alt={data.title || 'Video thumbnail'}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Video className="h-8 w-8 text-foreground" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg">
              <VideoUploader
                onUploadComplete={(videoData) => {
                  onChange({
                    bunny_video_id: videoData.bunny_video_id,
                    bunny_library_id: videoData.bunny_library_id,
                    title: data.title || videoData.title,
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`video-title-${block.id}`}>Title</Label>
          <Input
            id={`video-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Video title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`video-desc-${block.id}`}>Description (optional)</Label>
          <Textarea
            id={`video-desc-${block.id}`}
            value={data.description ?? ''}
            onChange={(e) =>
              onChange({ description: e.target.value || undefined })
            }
            placeholder="Brief description of the video content"
            className="min-h-[80px]"
          />
        </div>

        {/* Completion criteria */}
        <div className="space-y-2">
          <Label>Completion Criteria</Label>
          <Select
            value={data.completion_criteria}
            onValueChange={(
              value: 'watch_75' | 'watch_90' | 'watch_100'
            ) => onChange({ completion_criteria: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="watch_75">Watch 75%</SelectItem>
              <SelectItem value="watch_90">Watch 90%</SelectItem>
              <SelectItem value="watch_100">Watch 100%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={`video-skip-${block.id}`} className="cursor-pointer">
              Allow Skip
            </Label>
            <Switch
              id={`video-skip-${block.id}`}
              checked={data.allow_skip}
              onCheckedChange={(checked) => onChange({ allow_skip: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor={`video-autoplay-${block.id}`} className="cursor-pointer">
              Autoplay
            </Label>
            <Switch
              id={`video-autoplay-${block.id}`}
              checked={data.autoplay}
              onCheckedChange={(checked) => onChange({ autoplay: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
