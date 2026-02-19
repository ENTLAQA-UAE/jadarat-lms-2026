import { useState, useCallback } from 'react';
import { UploadHookReturn } from '@/app/dashboard/@lms_admin/(courses_categorise)/courses/add-course/upload-types';

export function useFileUpload(): UploadHookReturn {
 const [uploadProgress, setUploadProgress] = useState(0);

 const uploadFile = useCallback(async (file: File) => {
  // Simulate file upload
  for (let i = 0; i <= 100; i += 10) {
   setUploadProgress(i);
   await new Promise(resolve => setTimeout(resolve, 500));
  }
  return file;
 }, []);

 const resetUpload = useCallback(() => {
  setUploadProgress(0);
 }, []);

 return { uploadProgress, uploadFile, resetUpload };
}

