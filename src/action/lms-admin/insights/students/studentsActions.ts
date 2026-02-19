"use server";

import { createClient } from "@/utils/supabase/server";

export async function getLearners(page: number = 1, pageSize: number = 10, filters: any = null) {
  const supabase = await createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let loading = true;
  let result = { data: [], count: 0, loading };

  try {
    const { data, error, count } = await supabase
      .rpc('get_learners', {
        _learner_name: filters._learner_name ?? null,
        _learner_department: filters._learner_department ?? null,
        _learner_group_name: filters._learner_group_name ?? null,
        _learner_country: filters._learner_country ?? null,
      }, {
        count: 'exact',
      })
      .range(start, end);

    if (error) {
      console.error("Error fetching learners:", error);
    } else {
      result = { data, count: count ?? 0, loading: false };
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  } finally {
    loading = false;
  }

  return result;
}

export async function getAllLearners() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_learners', {
    _learner_name: null,
    _learner_department: null,
    _learner_group_name: null,
    _learner_country: null,
  })
  return { data, error };
}

export async function getLearnersOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_learners_options')
  return { data, error };
}
