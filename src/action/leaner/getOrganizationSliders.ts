'use server'

import { createClient } from '@/utils/supabase/server';

export const getOrganizationSliders = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_organization_sliders");
  return data;
}