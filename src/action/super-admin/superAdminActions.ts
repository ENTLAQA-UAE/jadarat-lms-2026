'use server';
import { createClient } from '@/utils/supabase/server';

export const getSummaryData = async () => {
  // Initially
  let dashboardData = [];

  let loading = true;
  let errorMessage = '';

  const supabase = await createClient();

  try {
    let { data, error } = await supabase.rpc(
      'get_summary_data_for_super_admin'
    );
    if (error) {
      errorMessage = error.message;
      console.error('RPC error:', errorMessage);
    } else {
      dashboardData = data;
    }
  } catch (error: any) {
    errorMessage = error.message;
    console.error(errorMessage);
  } finally {
    loading = false;
  }

  // Return loading, statsData, and monthlyData, along with an error message if any
  return { loading, dashboardData, errorMessage };
};
