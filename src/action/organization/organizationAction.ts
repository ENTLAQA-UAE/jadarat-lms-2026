"use server"

import { createClient } from "@/utils/supabase/server";

export async function getOrganizationDetails(domain: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_organization_settings_for_user', {
    domain_name: domain ?? null
  });

  if (error) {
    return null
  };
  return data;
}

export async function getOrganizationSubscription() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_organization_subscription');

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_user_details');

  if (error) throw new Error(error.message);

  return data[0];
}

export async function get_organization_statistics() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_organization_statistics');

  if (error) {
    throw new Error(error.message);
  }
  return data || 0;
}

export async function getAiAndDocumentBuilder(organization_id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organization_settings')
    .select('ai_builder, document_builder , create_courses')
    .eq('organization_id', organization_id)
    .single();

  if (error) {
    console.log(error)
  }
  return data || {};
}

export async function get_monthly_stats_for_year(year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_monthly_stats_for_year', {
    year: year ?? 2024
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getOrgIdByUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_organization_id_by_user")
  
  if (error) throw new Error(error.message)
  return data;
}

export async function getCertData(studentId:string,courseId:string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_certificate_details', {
    user_id: studentId,
    course_id: parseInt(courseId)
  });

  
  
  if (error) {
    console.log(error);
    return null
  }
  return data[0];
}