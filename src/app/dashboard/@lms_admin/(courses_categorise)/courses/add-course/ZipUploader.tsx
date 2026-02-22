import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadHookReturn, FileWithPreview } from './upload-types';

interface ZipUploaderProps {
  onFileUpdate: (file: File | null) => void;
}

export function ZipUploader({ onFileUpdate }: ZipUploaderProps) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { uploadProgress, uploadFile, resetUpload }: UploadHookReturn = useFileUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')) {
        setFile(Object.assign(selectedFile, {
          preview: URL.createObjectURL(selectedFile)
        }));
        onFileUpdate(selectedFile);
        setError(null);
      } else {
        setError('Please upload a .zip file');
        onFileUpdate(null);
      }
    }
  }, [onFileUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (file) {
      await uploadFile(file);
    }
  };

  const handleRemove = () => {
    setFile(null);
    resetUpload();
    onFileUpdate(null);
  };

  return (
    <div className="w-full p-6 bg-card rounded-lg shadow-md">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop a .zip file here, or click to select one
        </p>
      </div>

      {error && (
        <div className="mt-4 p-2 bg-destructive/10 text-destructive rounded flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}

      {file && (
        <div className="mt-4 p-4 bg-muted rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{file.name}</span>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Progress value={uploadProgress} className="mt-2" />
          )}
          {uploadProgress === 100 && (
            <div className="mt-2 text-success flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Upload complete!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

