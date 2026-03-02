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
    const supabase = createServerAdminClient();
    const { data, error } = await supabase
      .from('organization_settings')
      .select('ai_builder, document_builder, create_courses')
      .eq('organization_id', organization_id)
      .single();

    if (error || !data) {
      return { ai_builder: true, document_builder: true, create_courses: true };
    }

    // Self-healing: migration 20260301000005 was supposed to enable these
    // features for all existing orgs but was never applied to production.
    // If both flags are still at their DEFAULT false, apply the migration now.
    if (!data.ai_builder && !data.document_builder) {
      await Promise.all([
        supabase
          .from('organization_settings')
          .update({ ai_builder: true, document_builder: true })
          .eq('organization_id', organization_id),
        supabase
          .from('subscription_tiers')
          .update({ ai_builder: true, document_builder: true })
          .gt('id', 0),
      ]);
      return { ai_builder: true, document_builder: true, create_courses: data.create_courses ?? true };
    }

    return {
      ai_builder: data.ai_builder ?? true,
      document_builder: data.document_builder ?? true,
      create_courses: data.create_courses ?? true,
    };
  } catch {
    return { ai_builder: true, document_builder: true, create_courses: true };
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