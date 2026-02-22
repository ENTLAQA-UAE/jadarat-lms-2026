"use server";

import { createClient } from "@/utils/supabase/server";

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

export const fetchCoursesPerMonth = () => fetchData('get_courses_per_month');
export const fetchCoursesByCategory = () => fetchData('get_courses_by_category');
// export const fetchAllCourses = () => fetchData('get_all_courses');
export const coursesTitlesAndIds = () => fetchData('get_course_titles_and_ids');

export const fetchAllCourses = async (page: number, pageSize: number, filters: any) => {
    const supabase = await createClient();
    let loading = true;
    let errorMessage = '';
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    try {
        const { data, error, count } = await supabase.rpc('get_all_courses', {
            _name_filter: filters.name ?? null,
            _category_filter: filters.category ?? null,
            _status_filter: filters.status ?? null,
        }, { count: 'exact' }).range(start, end)
        if (error) {
            throw new Error(`Error fetching get_all_courses: ${error.message}`);
        }
        return { data, count };
    } catch (error: any) {
        errorMessage = error.message;
        console.error(errorMessage);
    } finally {
        loading = false;
    }
}

export const exportCourses = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_all_courses', {
        _name_filter: null,
        _category_filter: null,
        _status_filter: null,
    });

    if (error) {
        throw new Error(`Error exporting courses: ${error.message}`);
    }
    return data;
}