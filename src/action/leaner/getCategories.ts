'use server'

import { createClient } from "@/utils/supabase/server"


export const getCategories = async () => {
  const supabase = await createClient()
  let { data, error } = await supabase
    .rpc('get_categories')

  if (error) {
    throw new Error(`Error fetching categories options: ${error.message}`);
  }
  return data;
}