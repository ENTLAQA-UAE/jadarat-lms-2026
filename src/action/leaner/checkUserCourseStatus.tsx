"use server";

import { createClient } from "@/utils/supabase/server";


export async function checkUserCourseStatus(courseId: string) {
 const supabase = await createClient();
 
 const { data, error } = await supabase.rpc("check_user_course_status", {
  course_slug_param: courseId
 });

 if (error) {
  throw new Error(error.message);
 }

 return data?.[0];
}