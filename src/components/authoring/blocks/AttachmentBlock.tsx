'use client';

import { useCallback, useRef } from 'react';
import { type AttachmentBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paperclip, Upload, FileText, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface AttachmentBlockEditorProps {
  block: AttachmentBlock;
  onChange: (data: Partial<AttachmentBlock['data']>) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  if (mimeType.includes('image')) return '🖼️';
  return '📎';
}

export function AttachmentBlockEditor({
  block,
  onChange,
}: AttachmentBlockEditorProps) {
  const { data } = block;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    const supabase = createClient();

    const ext = file.name.split('.').pop() || 'bin';
    const filePath = `attachments/${block.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('course-assets')
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast.error('Failed to upload file');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('course-assets')
      .getPublicUrl(filePath);

    onChange({
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      title: data.title || file.name,
    });

    toast.success('File uploaded');
  }, [block.id, data.title, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Paperclip className="h-4 w-4" />
          Attachment Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File upload area */}
        {!data.file_url ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Click to upload a file
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              PDF, DOCX, PPTX, XLSX, ZIP, or any file type
            </p>
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <span className="text-2xl">{getFileIcon(data.file_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(data.file_size)} &middot; {data.file_type.split('/').pop()?.toUpperCase()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onChange({ file_url: '', file_name: '', file_size: 0, file_type: '' })}
              title="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor={`attachment-title-${block.id}`} className="text-xs">
            Title
          </Label>
          <Input
            id={`attachment-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="File title (shown to learner)"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor={`attachment-desc-${block.id}`} className="text-xs">
            Description (optional)
          </Label>
          <Textarea
            id={`attachment-desc-${block.id}`}
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Brief description of the attachment"
            className="min-h-[60px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
