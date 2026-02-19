import { createClient } from '@/utils/supabase/server';

export async function getUserCourses() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from('user_courses').select('*');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error in getUserCourses:', error);
    throw error; // Re-throw the error to be caught in the page component
  }
}
