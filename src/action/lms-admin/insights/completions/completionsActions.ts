"use server"
import { createClient } from "@/utils/supabase/server";

interface Filters {
 course_filter: string | null;
 department_filter: string | null;
 group_name_filter: string | null;
 name_filter: string | null;
 start_date: string | null;
 end_date: string | null;
}

interface FetchDataResult {
 isLoading: boolean;
 data: any[];
 errorMessage: string;
 count: number;
}

const fetchData = async (rpcName: string, page: number, pageSize: number, filters: Filters): Promise<FetchDataResult> => {
 const supabase = await createClient();
 const start = (page - 1) * pageSize;
 const end = start + pageSize - 1;

 try {
  const { data: rpcData, error, count: rpcCount } = await supabase
   .rpc(rpcName, {
    _course_filter: filters.course_filter,
    _department_filter: filters.department_filter,
    _group_name_filter: filters.group_name_filter,
    _name_filter: filters.name_filter,
    _start_date: filters.start_date,
    _end_date: filters.end_date,
   }, {
    count: 'exact',
   })
   .range(start, end);

  if (error) {
   throw new Error(`Error fetching ${rpcName}: ${error.message}`);
  }

  return {
   isLoading: false,
   data: rpcData || [],
   errorMessage: '',
   count: rpcCount || 0
  };
 } catch (error: any) {
  console.error(`Error in fetchData: ${error.message}`);
  return {
   isLoading: false,
   data: [],
   errorMessage: error.message,
   count: 0
  };
 }
};

export const getCompletions = (page: number, pageSize: number, filters: Filters) =>
 fetchData('get_learners_with_completed_courses', page, pageSize, filters);

export const getAllCompletions = async () => {
 const supabase = await createClient();
 const { data, error } = await supabase.rpc('get_learners_with_completed_courses', {
  _course_filter: null,
  _department_filter: null,
  _group_name_filter: null,
  _name_filter: null,
  _start_date: null,
  _end_date: null,
 });
 if (error) {
  throw new Error(`Error fetching all completions: ${error.message}`);
 }
 return { data };
};

export const getCompletionsOptions = async () => {
 const supabase = await createClient();
 const { data, error } = await supabase.rpc('get_completion_options');
 if (error) {
  throw new Error(`Error fetching completions options: ${error.message}`);
 }
 return {data};
}
