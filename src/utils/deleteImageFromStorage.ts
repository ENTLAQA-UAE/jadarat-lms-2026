
import { createClient } from "@/utils/supabase/client";

export const deleteImageFromStorage = async (imageKey: string) => {
 const supabase = createClient();
 try {
  const { error } = await supabase.storage.from('LMS Resources').remove([imageKey]);
  if (error) {
   console.error('Failed to delete image from storage:', error);
  }
 } catch (error) {
  console.error('Error deleting image:', error);
 }
};
