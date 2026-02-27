'use client';

import { useCallback, useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import { Upload, CheckCircle2, AlertCircle, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface VideoUploaderProps {
  onUploadComplete: (videoData: {
    bunny_video_id: string;
    bunny_library_id: string;
    title: string;
  }) => void;
}

type UploadState = 'idle' | 'uploading' | 'completed' | 'error';

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ACCEPTED_EXTENSIONS = '.mp4,.webm,.mov';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

interface TusCredentials {
  videoId: string;
  libraryId: string;
  tusEndpoint: string;
  tusAuthHeader: string;
  tusAuthExpire: number;
}

export function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadRef = useRef<tus.Upload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoDataRef = useRef<{ videoId: string; libraryId: string } | null>(null);

  const resetState = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setUploadState('idle');
    setProgress(0);
    setFileName(null);
    setErrorMessage(null);
    videoDataRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return `Unsupported file type "${file.type}". Please upload an MP4, WebM, or MOV file.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds the 10 GB limit. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB.`;
    }
    return null;
  }, []);

  const startUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setUploadState('error');
        return;
      }

      setFileName(file.name);
      setUploadState('uploading');
      setProgress(0);
      setErrorMessage(null);

      let credentials: TusCredentials;

      try {
        const response = await fetch('/api/bunny/create-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: file.name }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `Failed to create video placeholder: ${response.status} ${errorBody}`
          );
        }

        credentials = await response.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to initialize upload';
        setErrorMessage(message);
        setUploadState('error');
        return;
      }

      videoDataRef.current = {
        videoId: credentials.videoId,
        libraryId: credentials.libraryId,
      };

      const tusUpload = new tus.Upload(file, {
        endpoint: credentials.tusEndpoint,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        chunkSize: 5 * 1024 * 1024, // 5 MB chunks
        metadata: {
          filetype: file.type,
          title: file.name,
        },
        headers: {
          AuthorizationSignature: credentials.tusAuthHeader,
          AuthorizationExpire: String(credentials.tusAuthExpire),
          VideoId: credentials.videoId,
          LibraryId: credentials.libraryId,
        },
        onError(err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Upload failed. Please try again.';
          setErrorMessage(message);
          setUploadState('error');
        },
        onProgress(bytesUploaded, bytesTotal) {
          const pct = Math.round((bytesUploaded / bytesTotal) * 100);
          setProgress(pct);
        },
        onSuccess() {
          setUploadState('completed');
          setProgress(100);

          if (videoDataRef.current) {
            onUploadComplete({
              bunny_video_id: videoDataRef.current.videoId,
              bunny_library_id: videoDataRef.current.libraryId,
              title: file.name,
            });
          }
        },
      });

      uploadRef.current = tusUpload;

      // Check for previous uploads to resume
      const previousUploads = await tusUpload.findPreviousUploads();
      if (previousUploads.length > 0) {
        tusUpload.resumeFromPreviousUpload(previousUploads[0]);
      }

      tusUpload.start();
    },
    [onUploadComplete, validateFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        startUpload(file);
      }
    },
    [startUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        startUpload(file);
      }
    },
    [startUpload]
  );

  const handleClickZone = useCallback(() => {
    if (uploadState === 'idle') {
      fileInputRef.current?.click();
    }
  }, [uploadState]);

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Select video file"
      />

      {/* Upload zone */}
      {uploadState === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClickZone}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClickZone();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={
            'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ' +
            (isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50')
          }
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              Drag and drop your video here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP4, WebM, or MOV -- up to 10 GB
            </p>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {uploadState === 'uploading' && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetState}
              aria-label="Cancel upload"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Completed state */}
      {uploadState === 'completed' && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                Upload complete. Video is being processed.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetState}>
              Upload another
            </Button>
          </div>
        </div>
      )}

      {/* Error state */}
      {uploadState === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Upload failed</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetState}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
