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
    try {
        const supabase = await createClient();
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        const { data, error, count } = await supabase.rpc('get_all_courses', {
            _name_filter: filters.name ?? null,
            _category_filter: filters.category ?? null,
            _status_filter: filters.status ?? null,
        }, { count: 'exact' }).range(start, end)
        if (error) {
            console.error('Error fetching get_all_courses:', error.message);
            return { data: [], count: 0 };
        }
        return { data: data ?? [], count: count ?? 0 };
    } catch (error: any) {
        console.error('Error fetching get_all_courses:', error.message);
        return { data: [], count: 0 };
    }
}

export const fetchCourseStatusCounts = async () => {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.rpc('get_all_courses', {
            _name_filter: null,
            _category_filter: null,
            _status_filter: null,
        });
        if (error) throw error;
        const counts: Record<string, number> = {};
        for (const course of data || []) {
            const status = course.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    } catch (error: any) {
        console.error('Error fetching course status counts:', error.message);
        return [];
    }
};

export const exportCourses = async () => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('get_all_courses', {
            _name_filter: null,
            _category_filter: null,
            _status_filter: null,
        });
        if (error) {
            console.error('Error exporting courses:', error.message);
            return [];
        }
        return data ?? [];
    } catch (error: any) {
        console.error('Error exporting courses:', error.message);
        return [];
    }
}