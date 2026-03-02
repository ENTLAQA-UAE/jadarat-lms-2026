'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Upload,
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentChunk } from '@/types/authoring';

interface DocumentUploaderProps {
  onExtracted: (chunks: DocumentChunk[]) => void;
}

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'error';

export function DocumentUploader({ onExtracted }: DocumentUploaderProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (selectedFile: File) => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, DOCX, and PPTX files are supported');
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File must be under 50MB');
        return;
      }

      setFile(selectedFile);
      setState('uploading');
      setError('');

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        setState('extracting');

        const res = await fetch('/api/ai/extract-document', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Extraction failed');
        }

        const data = await res.json();
        const extractedChunks: DocumentChunk[] = data.chunks;

        setChunks(extractedChunks);
        setState('done');
        onExtracted(extractedChunks);

        toast.success('Document processed', {
          description: `${extractedChunks.length} sections extracted`,
        });
      } catch (err) {
        setState('error');
        const msg =
          err instanceof Error ? err.message : 'Failed to process document';
        setError(msg);
        toast.error('Document processing failed', { description: msg });
      }
    },
    [onExtracted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) processFile(droppedFile);
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) processFile(selectedFile);
    },
    [processFile]
  );

  const reset = () => {
    setState('idle');
    setFile(null);
    setChunks([]);
    setError('');
  };

  if (state === 'done' && file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <Check className="h-5 w-5 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {chunks.length} sections extracted
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={reset}
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Extraction failed</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          Try Again
        </Button>
      </div>
    );
  }

  if (state === 'uploading' || state === 'extracting') {
    return (
      <div className="p-6 rounded-lg border border-dashed text-center space-y-3">
        <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          {state === 'uploading'
            ? 'Uploading document...'
            : 'Extracting text...'}
        </p>
        <Progress value={state === 'extracting' ? 60 : 30} className="h-1" />
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors ${
        dragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('doc-upload-input')?.click()}
    >
      <input
        id="doc-upload-input"
        type="file"
        accept=".pdf,.docx,.doc,.pptx,.ppt"
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="space-y-2">
        <div className="flex justify-center gap-2">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">
          Drop a PDF, DOCX, or PPTX file here
        </p>
        <p className="text-xs text-muted-foreground">
          The AI will use this document as source material for the course
        </p>
      </div>
    </div>
  );
}
