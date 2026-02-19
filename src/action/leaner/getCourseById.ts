"use server";

import { createClient } from "@/utils/supabase/server";


export async function getCourseByIdAction(slug: string) {
 const supabase = await createClient();
 const { data, error } = await supabase.rpc('get_course_by_slug', {
  course_slug: slug
 });
 if (error) {
  console.error("Error fetching course:", error);
  return [];
 }
 return data[0];
}