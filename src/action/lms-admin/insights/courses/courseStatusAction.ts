"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCourseStatus(
  courseId: number,
  newStatus: string
): Promise<{ data?: any; error?: string }> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("update_course_status", {
      p_course_id: courseId,
      p_new_status: newStatus,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/courses", "page");
    return { data };
  } catch (error: any) {
    console.error("Course status update failed:", error.message);
    return { error: error.message };
  }
}
