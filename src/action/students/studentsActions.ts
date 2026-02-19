"use server"

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const fetchData = async (rpcName: string) => {
 const supabase = await createClient();
 let loading = true;
 let data = [];
 let errorMessage = '';

 try {
  const { data: rpcData, error } = await supabase.rpc(rpcName);
  if (error) {
   throw new Error(`Error fetching ${rpcName}: ${error.message}`);
  }
  data = rpcData;
 } catch (error: any) {
  errorMessage = error.message;
  console.error(errorMessage);
 } finally {
  loading = false;
 }

 return { loading, data, errorMessage };
};

const fetchDataById = async (rpcName: string, params: object, pathToRevalidate: string) => {
 const supabase = await createClient();
 let loading = true;
 let data = [];
 let errorMessage = '';

 try {
  const { data: rpcData, error } = await supabase.rpc(rpcName, params);
  if (error) {
   throw new Error(`Error fetching ${rpcName}: ${error.message}`);
  }
  data = rpcData;
 } catch (error: any) {
  errorMessage = error.message;
  console.error(errorMessage);
 } finally {
  loading = false;
 }

 // Pass the value to revalidatePath
 revalidatePath(pathToRevalidate ,"layout");

 return { loading, data, errorMessage };
};


export const enrolToCourse = (course_id: number, user_id: string) => fetchDataById('enrol_to_course_by_id', { p_user_id: user_id, p_course_id: course_id }, '/dashboard/lms_admin');
export const getStudentsData = () => fetchData('get_users_for_test');
export const enrollLearnersToCourses = (learners: string[], courses: number[]) =>
 fetchDataById('enroll_users_to_courses', { user_ids: learners, course_ids: courses }, '/dashboard/lms_admin');


export async function updateCourseProgress(
  courseId: number, 
  percentage: number, 
  scormData?: Record<string, any>
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc('update_course_percentage', {
      courseid: courseId,
      scormdata: scormData, // Supabase will automatically handle JSON conversion
      percentage: percentage
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating course progress:', error)
    return { success: false, error }
  }
}

