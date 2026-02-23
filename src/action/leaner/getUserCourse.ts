'use server'

import { createClient } from '@/utils/supabase/server';

export const getUserCourses = async () => {
    try {
        const supabase = await createClient()
        let { data, error } = await supabase.rpc('get_user_courses_learner')

        if (error) {
            throw new Error(`Error fetching users course: ${error.message}`);
        }

        return data

    } catch (error) {
        console.error('Error in users data:', error);
        return null;
    }
}