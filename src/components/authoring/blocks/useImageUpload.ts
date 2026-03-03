import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface UseImageUploadReturn {
  uploading: boolean;
  uploadFile: (file: File) => Promise<string | null>;
}

/**
 * Hook for uploading images to Supabase Storage and returning a signed URL.
 * Used by ImageBlock and CoverBlock editors.
 */
export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please upload an image file.' });
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10 MB.' });
      return null;
    }

    setUploading(true);
    try {
      const supabase = createClient();

      // Get org_id from user membership
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      if (!membership) throw new Error('No organization found');

      const orgId = membership.organization_id;
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `block-images/${uuidv4()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(`LMS Resources/${orgId}`)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData, error: urlError } = await supabase.storage
        .from('LMS Resources')
        .createSignedUrl(`${orgId}/${data.path}`, 630720000); // ~20 years

      if (urlError) throw urlError;

      return urlData.signedUrl;
    } catch (err) {
      toast.error('Upload failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, uploadFile };
}
