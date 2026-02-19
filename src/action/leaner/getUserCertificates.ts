"use server"

import { createClient } from '@/utils/supabase/server';

export async function getUserCertificates(userId: string) {
  const supabase = await createClient();
 const { data, error } = await supabase.from('user_certificates').select('*').eq('user_id', userId);
 if(error) {
  throw new Error(error.message)
 }
  return data;
}