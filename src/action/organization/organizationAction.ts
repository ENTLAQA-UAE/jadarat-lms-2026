"use server"

import { createClient, createServerAdminClient } from "@/utils/supabase/server";

export async function getOrganizationDetails(domain: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_organization_settings_for_user', {
      domain_name: domain ?? null
    });

    if (error) {
      return null
    };
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getOrganizationSubscription() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_organization_subscription');

    if (error) throw new Error(error.message);
    return data;
  } catch {
    return null;
  }
}

export async function getUserDetails() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_user_details');

    if (error) throw new Error(error.message);

    return data[0];
  } catch {
    return null;
  }
}

export async function get_organization_statistics() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_organization_statistics');

    if (error) {
      throw new Error(error.message);
    }
    return data || 0;
  } catch {
    return 0;
  }
}

export async function getAiAndDocumentBuilder(organization_id: number) {
  try {
    // Use the admin client (service_role key) to bypass RLS.
    // The anon-key client was silently blocked by the RLS policy on
    // organization_settings, causing the function to always return false.
    const supabase = createServerAdminClient();
    const { data, error } = await supabase
      .from('organization_settings')
      .select('ai_builder, document_builder, create_courses')
      .eq('organization_id', organization_id)
      .single();

    if (error || !data) {
      return { ai_builder: false, document_builder: false, create_courses: true };
    }

    return {
      ai_builder: data.ai_builder ?? false,
      document_builder: data.document_builder ?? false,
      create_courses: data.create_courses ?? true,
    };
  } catch {
    return { ai_builder: false, document_builder: false, create_courses: true };
  }
}

export async function get_monthly_stats_for_year(year: number) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_monthly_stats_for_year', {
      year: year ?? 2024
    });

    if (error) throw new Error(error.message);
    return data;
  } catch {
    return null;
  }
}

export async function getOrgIdByUser() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_organization_id_by_user")

    if (error) throw new Error(error.message)
    return data;
  } catch {
    return null;
  }
}

export async function getCertData(studentId:string,courseId:string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_certificate_details', {
    user_id: studentId,
    course_id: parseInt(courseId)
  });

  
  
  if (error) {
    return null
  }
  return data[0];
}