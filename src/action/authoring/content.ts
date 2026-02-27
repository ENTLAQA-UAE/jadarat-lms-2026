'use server';

import { createClient } from '@/utils/supabase/server';
import type { CourseContent } from '@/types/authoring';

/**
 * Save course content by calling the `save_course_content` RPC.
 * The RPC performs an upsert on the course_content table and returns
 * the content ID for subsequent operations (publish, versioning).
 */
export async function saveContent(
  courseId: number,
  content: CourseContent,
): Promise<{ contentId: string | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { contentId: null, error: 'Authentication required. Please sign in again.' };
    }

    const { data, error } = await supabase.rpc('save_course_content', {
      p_course_id: courseId,
      p_content: content,
      p_user_id: user.id,
    });

    if (error) {
      return { contentId: null, error: error.message };
    }

    return { contentId: data as string, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while saving content.';
    return { contentId: null, error: message };
  }
}

/**
 * Publish course content by calling the `publish_course_content` RPC.
 * This transitions the content from draft to published state, making it
 * available to enrolled learners.
 */
export async function publishContent(
  courseId: number,
  contentId: string,
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Authentication required. Please sign in again.' };
    }

    const { error } = await supabase.rpc('publish_course_content', {
      p_course_id: courseId,
      p_content_id: contentId,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while publishing content.';
    return { error: message };
  }
}

/**
 * Load a course along with its latest content by calling the
 * `get_course_with_content` RPC. Returns the full course data
 * including metadata, settings, modules, lessons, and blocks.
 */
export async function loadCourseWithContent(
  courseId: number,
): Promise<{ data: any; error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required. Please sign in again.' };
    }

    const { data, error } = await supabase.rpc('get_course_with_content', {
      p_course_id: courseId,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading course content.';
    return { data: null, error: message };
  }
}
