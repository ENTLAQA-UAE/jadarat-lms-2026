"use server"

import { createClient } from "@/utils/supabase/server";

export const getCategoriesOptions = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_categories');
  if (error) {
    console.error('Error fetching categories options:', error.message);
    return [];
  }
  // Map to { id, name } shape expected by the filter component
  return (data ?? []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }));
}
