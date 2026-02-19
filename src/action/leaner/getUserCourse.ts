'use server'

import { createClient } from '@/utils/supabase/server';

export const getUserCourses = async () => {
    const supabase = await createClient()
    try {
        let { data, error } = await supabase.rpc('get_user_courses_learner')
        
        if (error) {
            throw new Error(`Error fetching users course: ${error.message}`);
        }

        return data

    } catch (error) {
        console.error('Error in users data:', error);
        throw error; // Re-throw the error for the calling component to handle
    }
}