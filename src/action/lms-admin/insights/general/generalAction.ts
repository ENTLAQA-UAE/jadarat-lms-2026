'use server';

import { createClient } from '@/utils/supabase/server';

export async function getOrganizationData() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('performance_insights');

  if (error) {
    throw new Error(`Error fetching performance insights: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned from performance_insights');
  }

  const {
    avg_completion_rate,
    active_enrollments_count,
    avg_completion_days
  } = data[0];

  return {
    avgCompletionRate: avg_completion_rate,
    activeEnrollments: active_enrollments_count,
    avgCompletionDays: avg_completion_days
  };
}