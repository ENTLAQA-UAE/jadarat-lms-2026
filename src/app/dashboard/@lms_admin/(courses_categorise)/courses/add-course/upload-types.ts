export interface FileWithPreview extends File {
 preview: string;
}

export interface UploadHookReturn {
 uploadProgress: number;
 uploadFile: (file: File) => Promise<File>;
 resetUpload: () => void;
}

