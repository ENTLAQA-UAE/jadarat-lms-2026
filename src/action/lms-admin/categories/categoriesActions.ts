"use server"

import { createClient } from "@/utils/supabase/server";

export const getCategoriesOptions = async (organization_id: number) => {
  const supabase = await createClient();
  // const { data, error } = await supabase.rpc('get_categories_options');
  const { data, error } = await supabase.from('categories').select('id, name').eq('organization_id', organization_id).order('name', { ascending: true });
  if (error) {
    throw new Error(`Error fetching categories options: ${error.message}`);
  }
  return data;
}
