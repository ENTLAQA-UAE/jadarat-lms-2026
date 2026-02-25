"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const fetchDataById = async (rpcName: string, params: object) => {
 const supabase = await createClient();
 let loading = true;
 let data = [];
 let errorMessage = '';

 try {
  const { data: rpcData, error } = await supabase.rpc(rpcName, params); // Use params object directly
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


export const fetchCourseSummary = (courseId: number) => fetchDataById('get_course_details', { p_course_id: courseId });
export const enrollmentsCompletionsPerMonth = (courseId: number) => fetchDataById('get_enrollments_completions_per_month', { course_id_input: courseId });
export const getEnrollmentsByCourse = (courseId: number) => fetchDataById('get_enrollments_by_course', { course_id_input: courseId });

export const addCourse = async (coursePayload: any) => {
 const supabase = await createClient();

 try {
  const { data, error } = await supabase.rpc('add_course', {
   _organization_id: coursePayload._organization_id,
   _title: coursePayload._title,
   _description: coursePayload._description,
   _category_id: coursePayload._category_id,
   _level: coursePayload._level,
   _completion_time: coursePayload._completion_time,
   _slug: coursePayload._slug,
   _image_preview: coursePayload._image_preview,
   _outcomes: coursePayload._outcomes,
   _is_scorm: coursePayload._is_scorm,
   _scorm_version: coursePayload._scorm_version,
   _launch_path: coursePayload._launch_path,
  });

  if (error) {
   return { data: null, errorMessage: error.message };
  }

  revalidatePath("/dashboard/courses", "page");
  return { data, errorMessage: "" };
 } catch (error: any) {
  console.error(error.message);
  return { data: null, errorMessage: error.message };
 }
};


export const getCourseById = async (courseId: number) => {
 const supabase = await createClient();
 let loading = false;
 let data = [];
 let errorMessage = '';

 try {
  loading = true;
  const { data: rpcData, error } = await supabase.rpc('get_course', { _course_id: courseId });
  if (error) {
   loading = false;
   throw new Error(`Error fetching course: ${error.message}`);
  }
  data = rpcData;
  loading = false;
 } catch (error: any) {
  errorMessage = error.message;
 }

 return { data, errorMessage, loading };
};

export const updateCourse = async (coursePayload: Record<string, any>) => {
 const supabase = await createClient();
 
 try {
  const { data, error } = await supabase.rpc('update_course', {
   _course_id: coursePayload._course_id,
   _organization_id: coursePayload._organization_id,
   _title: coursePayload._title,
   _description: coursePayload._description,
   _category_id: coursePayload._category_id,
   _level: coursePayload._level,
   _completion_time: coursePayload._completion_time.toString(),
   _slug: coursePayload._slug,
   _image_preview: coursePayload._image_preview,
   _outcomes: coursePayload._outcomes,
  });

  if (error) {
   throw new Error(`Error updating course: ${error.message}`);
  }

  revalidatePath("/dashboard/courses", "page");
  revalidatePath(`/dashboard/courses/edit-course/${coursePayload._course_id}`, "page");
  return { data, errorMessage: "" };
 } catch (error: any) {
  console.error("Course update failed:", error.message);
  return { data: null, errorMessage: error.message };
 }
};

// delete course
export async function deleteCourse(courseId: number): Promise<{ data?: any; error?: { message: string } }> {
 const supabase = await createClient();

 try {
  const { data, error } = await supabase.rpc('delete_course_and_related_user_courses', { p_course_id: courseId });
  if (error) throw new Error(`Error deleting course: ${error.message}`);

  revalidatePath("/dashboard", "layout");
  return { data };
 } catch (error: any) {
  console.error("Course deletion failed:", error.message);
  return { error: { message: error.message } };
 }
}

