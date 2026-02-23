'use server';
import { createClient } from '@/utils/supabase/server';
import { Subscription } from '../orgnizations/type'; // Ensure correct import path

// Function to fetch subscription tiers with organization count
export const getSubscriptionTiers = async () => {
  const supabase = await createClient();
  let subscriptionTiers: Subscription[] = [];
  let loading = true;
  let errorMessage = '';

  try {
    const { data, error } = await supabase.rpc(
      'get_subscription_tiers_with_org_count'
    );
    if (error) {
      throw error;
    }
    // Map the flat RPC rows to the Subscription type
    subscriptionTiers = data.map((item: any) => ({
      id: item.id.toString(),
      package: item.tier_name,
      totalAllowedUsers: item.max_user,
      totalAllowedCourses: item.max_courses,
      totalAllowedContentCreators: item.max_lms_managers,
      associatedOrganizations: item.associated_organizations,
    }));
  } catch (error: any) {
    errorMessage = error.message;
    console.error('Error fetching subscription tiers:', errorMessage);
  } finally {
    loading = false;
  }

  return { loading, subscriptionTiers, errorMessage };
};

// Function to create a new subscription
export const createSubscription = async (
  data: Omit<Subscription, 'id' | 'associatedOrganizations'>
) => {
  let loading = true;
  let errorMessage = '';
  let newSubscription = null;

  const supabase = await createClient();

  try {
    const { data: addTierData, error } = await supabase
      .from('subscription_tiers')
      .insert([
        {
          tier_name: data.package,
          max_user: data.totalAllowedUsers,
          max_courses: data.totalAllowedCourses,
          max_lms_managers: data.totalAllowedContentCreators,
        },
      ])
      .select();

    if (error) {
      throw error;
    }
    newSubscription = {
      id: addTierData[0].id.toString(), // Ensure id is a string
      package: addTierData[0].tier_name,
      totalAllowedUsers: addTierData[0].max_user,
      totalAllowedCourses: addTierData[0].max_courses,
      totalAllowedContentCreators: addTierData[0].max_lms_managers,
      associatedOrganizations: 0, // New subscriptions have 0 associated organizations
    };
  } catch (error: any) {
    errorMessage = error.message;
    console.error('Error creating subscription:', errorMessage);
  } finally {
    loading = false;
  }

  return { loading, newSubscription, errorMessage };
};

// Function to edit a subscription
export const editSubscription = async (
  subscriptionId: string, // Ensure subscriptionId is a string
  data: Omit<Subscription, 'id' | 'associatedOrganizations'>
) => {
  let loading = true;
  let errorMessage = '';
  let updatedSubscription: Subscription | null = null;

  const supabase = await createClient();

  try {
    const { data: editTierData, error } = await supabase
      .from('subscription_tiers')
      .update({
        tier_name: data.package,
        max_user: data.totalAllowedUsers,
        max_courses: data.totalAllowedCourses,
        max_lms_managers: data.totalAllowedContentCreators,
      })
      .eq('id', subscriptionId)
      .select();

    if (error) {
      throw error;
    }

    updatedSubscription = {
      id: editTierData[0].id.toString(), // Ensure id is a string
      package: editTierData[0].tier_name,
      totalAllowedUsers: editTierData[0].max_user,
      totalAllowedCourses: editTierData[0].max_courses,
      totalAllowedContentCreators: editTierData[0].max_lms_managers,
      associatedOrganizations: 0, // Default to 0 if not provided
    };
  } catch (error: any) {
    errorMessage = error.message;
    console.error('Error editing subscription:', errorMessage);
  } finally {
    loading = false;
  }

  return { loading, updatedSubscription, errorMessage };
};

// Function to delete a subscription
export const deleteSubscription = async (
  oldTierId: string, // Ensure oldTierId is a string
  newTierId: string // Ensure newTierId is a string
) => {
  let loading = true;
  let errorMessage = '';
  let result = null;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      'move_organizations_and_delete_tier',
      {
        new_tier_id: newTierId,
        old_tier_id: oldTierId,
      }
    );

    if (error) {
      throw error;
    }
    result = data;
  } catch (error: any) {
    errorMessage = error.message;
    console.error('Error deleting subscription:', errorMessage);
  } finally {
    loading = false;
  }

  return { loading, result, errorMessage };
};
