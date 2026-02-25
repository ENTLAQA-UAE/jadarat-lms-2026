// OrganizationsActions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { Organization, OrganizationFormData } from "./type";

export const getOrganizations = async () => {
  let loading = true;
  let errorMessage = "";
  let organizations: Organization[] = [];

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_all_organization");
    if (error) {
      throw error;
    }
    // Map flat snake_case RPC rows to Organization type
    organizations = data.map((org: any) => {
      const isActive = org.subscription_is_active ?? true;
      const isExpired = org.subscription_expiration_date && new Date() > new Date(org.subscription_expiration_date);
      let status: 'Active' | 'Expired' | 'Suspended';
      if (!isActive) status = 'Suspended';
      else if (isExpired) status = 'Expired';
      else status = 'Active';

      return {
        id: org.id.toString(),
        name: org.name,
        domain: org.domain,
        subscriptionPackage: org.subscription_package,
        totalUsers: org.total_users,
        allowedUsers: org.allowed_users,
        totalCourses: org.total_courses,
        allowedCourses: org.allowed_courses,
        totalContentCreators: org.total_content_creators,
        allowedContentCreators: org.allowed_content_creators,
        subscriptionExpirationDate: org.subscription_expiration_date ? new Date(org.subscription_expiration_date) : null,
        subscriptionStartDate: org.subscription_start_date ? new Date(org.subscription_start_date) : null,
        subscriptionIsActive: isActive,
        status,
        allowCreateCourses: org.create_courses,
        allowCreateAICourses: org.ai_builder,
        allowCreateCoursesFromDocuments: org.document_builder,
        logo_url: org.logo_url,
      };
    });
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error fetching organizations:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, organizations, errorMessage };
};

// Function to create a new organization
export const createOrganization = async (newOrg: OrganizationFormData) => {
  let loading = true;
  let errorMessage = "";
  let organizationId: string | null = null;

  const supabase = await createClient();

  try {
    const rpcParams: Record<string, any> = {
      org_domain: newOrg.domain,
      org_name: newOrg.name,
      org_sub_tier_name: newOrg.subscriptionPackage,
    };
    if (newOrg.startDate) rpcParams.p_start_date = newOrg.startDate;
    if (newOrg.endDate) rpcParams.p_expires_at = newOrg.endDate;

    const { data: organization_id, error } = await supabase.rpc(
      "create_new_organization",
      rpcParams
    );

    if (error) {
      throw error;
    }

    organizationId = organization_id.toString();

    // Optionally, you can fetch and return the organization details here if needed.
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error creating organization:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, organizationId, errorMessage };
};

export const updateOrganizationLogo = async (
  orgId: string,
  logoUrl: string
) => {
  let loading = true;
  let errorMessage = "";

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("organization_settings")
      .update({ logo: logoUrl })
      .eq("organization_id", Number(orgId));

    if (error) {
      throw error;
    }
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error updating organization logo:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, errorMessage };
};
// Function to edit an organization
export const editOrganization = async (
  orgId: string,
  editedOrg: OrganizationFormData
) => {
  let loading = true;
  let errorMessage = "";
  let success = false;

  const supabase = await createClient();

  try {
    // Features are inherited from the tier — no per-org feature params needed
    const { error } = await supabase.rpc("update_organization_details", {
      new_domain: editedOrg.domain,
      new_name: editedOrg.name,
      new_subscription_package: editedOrg.subscriptionPackage,
      org_id: orgId,
    });

    if (error) {
      throw error;
    }
    success = true;
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error editing organization:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, success, errorMessage };
};

// Function to delete an organization
export const deleteOrganization = async (orgId: string) => {
  let loading = true;
  let errorMessage = "";
  let success = false;

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("organization")
      .delete()
      .eq("id", orgId);
    if (error) {
      throw error;
    }

    // Remove organization folder from storage
    const removeResult = await removeFolderFromSupabase(`${orgId}`);
    if (!removeResult.success) {
      throw removeResult.error;
    }

    success = true;
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error deleting organization:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, success, errorMessage };
};

// Helper functions
const removeFolderFromSupabase = async (folderPath: string) => {
  const supabase = await createClient();
  try {
    // List all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from("LMS Resources")
      .list(folderPath, { limit: 100 });

    if (listError) {
      throw listError;
    }

    // Create an array of file paths to remove
    const filesToRemove = files.map((file) => `${folderPath}/${file.name}`);

    // Remove all files
    const { data, error: removeError } = await supabase.storage
      .from("LMS Resources")
      .remove(filesToRemove);

    if (removeError) {
      // this error means there are no folder for this org
      return { success: true };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error removing folder:", error.message);
    return { success: false, error };
  }
};

// Subscription management actions

export const getSubscriptionDetails = async (orgId: string) => {
  let loading = true;
  let errorMessage = "";
  let details: any = null;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      "get_organization_subscription_details",
      { p_org_id: Number(orgId) }
    );
    if (error) throw error;
    if (data && data.length > 0) {
      const row = data[0];
      details = {
        subscriptionId: row.subscription_id,
        tierId: row.tier_id,
        tierName: row.tier_name,
        startDate: row.start_date,
        expiresAt: row.expires_at,
        isActive: row.is_active,
        maxUser: row.max_user,
        maxCourses: row.max_courses,
        maxLmsManagers: row.max_lms_managers,
        createCourses: row.create_courses,
        aiBuilder: row.ai_builder,
        documentBuilder: row.document_builder,
      };
    }
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error fetching subscription details:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, details, errorMessage };
};

export const updateSubscription = async (
  orgId: string,
  tierId: number,
  startDate: string,
  expiresAt: string,
  isActive: boolean
) => {
  let loading = true;
  let errorMessage = "";
  let success = false;

  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("update_organization_subscription", {
      p_org_id: Number(orgId),
      p_tier_id: tierId,
      p_start_date: startDate,
      p_expires_at: expiresAt,
      p_is_active: isActive,
    });
    if (error) throw error;
    success = true;
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error updating subscription:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, success, errorMessage };
};

export const getSubscriptionRequests = async (orgId: string) => {
  let loading = true;
  let errorMessage = "";
  let requests: any[] = [];

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      "get_pending_subscription_requests",
      { p_org_id: Number(orgId) }
    );
    if (error) throw error;
    requests = (data || []).map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      requesterId: r.requester_id,
      numberOfUsers: r.number_of_users,
      numberOfCourses: r.number_of_courses,
      numberOfContentCreators: r.number_of_content_creators,
      createdAt: r.created_at,
      status: r.status,
    }));
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error fetching subscription requests:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, requests, errorMessage };
};

export const resolveSubscriptionRequest = async (
  requestId: number,
  status: "approved" | "dismissed"
) => {
  let loading = true;
  let errorMessage = "";
  let success = false;

  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("resolve_subscription_request", {
      p_request_id: requestId,
      p_status: status,
    });
    if (error) throw error;
    success = true;
  } catch (error: any) {
    errorMessage = error.message;
    console.error("Error resolving subscription request:", errorMessage);
  } finally {
    loading = false;
  }

  return { loading, success, errorMessage };
};

const updateOrgLogo = async (orgId: string, file: File) => {
  const supabase = await createClient();
  try {
    const bucketName = "LMS Resources";
    const folderPath = `${orgId}`;
    const fileName = "logo";
    const filePath = `${folderPath}/${fileName}`;

    // Remove the existing logo
    const { error: removeError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (removeError) {
      console.error("Error removing existing logo:", removeError.message);
      // Proceed even if removing fails
    }

    // Upload the new logo
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Update the organization's logo URL
    const { data: updateOrgLogo, error: updateOrgLogoError } = await supabase
      .from("organization_settings")
      .update({ logo: data.path })
      .eq("organization_id", Number(orgId))
      .select();

    if (updateOrgLogoError) {
      throw updateOrgLogoError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return { success: false, error };
  }
};
