"use server"

import { Enrollments } from "@/app/dashboard/@lms_admin/insights/enrollments/type";
import { createClient } from "@/utils/supabase/server";

async function fetchData(rpcName: string, page: number, pageSize: number, filters: any){
  const supabase = await createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let loading = true;
  let data: Enrollments[] = [];
  let errorMessage = '';
  let count: number | null = null;

  try {
    const { data: rpcData, error, count: rpcCount } = await supabase.rpc(rpcName, {
      _name: filters._name ?? null,
      _course: filters._course ?? null,
      _department: filters._department ?? null,
      _group_name: filters._group_name ?? null,
      _start_date: filters._start_date ?? null,
      _end_date: filters._end_date ?? null,
    }, {
      count: 'exact',
    }).range(start, end);

    if (error) {
      throw new Error(`Error fetching ${rpcName}: ${error.message}`);
    }

    data = rpcData;
    count = rpcCount;
  } catch (error: any) {
    errorMessage = error.message;
    console.error(errorMessage);
  } finally {
    loading = false;
  }

  return { loading, data, errorMessage, count };
}

export const enrollmentsActivity = (page: number, pageSize: number , filters?: any) => fetchData('get_enrollment_activity', page, pageSize, filters || {});

export const getAllEnrollments = async () => {
  const supabase = await createClient(); // Await the client creation
  const { data, error } = await supabase.rpc('get_enrollment_activity', {
    _name: null,
    _course: null,
    _department: null,
    _group_name: null,
    _start_date: null,
    _end_date: null,
  });
  if (error) {
    throw new Error(`Error fetching all enrollments: ${error.message}`);
  }
  return { data, error};
}

export const getEnrollmentsOptions = async () => {
  const supabase = await createClient(); // Await the client creation
  const { data, error } = await supabase.rpc('get_enrollments_options');
  
  if (error) {
    throw new Error(`Error fetching enrollments options: ${error.message}`);
  }
  return { data, error};
}