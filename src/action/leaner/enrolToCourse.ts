"use server"

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const EnrolToCourse = async (course_id: number , slug: string) => {
  const supabase = await createClient();

 let { error } = await supabase.rpc('enrol_to_course', {
  course_input_id: course_id,
 });
 
  if(error) {
    return {error: error.message}
 }
 
 revalidatePath(`/dashboard/course/${slug}`, "page")

  return {data: null, error: null}
}