"use server"

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

const fetchDataById = async (rpcName: string, params: object) => { // Changed courseId to params
    const supabase = await createClient();
    let loading = true;
    let data = [];
    let errorMessage = '';

    try {
        const { data: rpcData, error } = await supabase.rpc(rpcName, params); // Use params instead of courseId
        if (error) {
            throw new Error(`Error fetching ${rpcName}: ${error.message}`);
        }
        data = rpcData;
    } catch (error: any) {
        errorMessage = error.message;
        console.error(errorMessage);
    } finally {
        loading = false;
        revalidatePath('/dashboard/courses', 'page')
        revalidatePath('/dashboard/categories', 'page')
    }

    return { loading, data, errorMessage };
};

export const fetchAllCategories = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_all_categories', {
        _name_filter: null,
    });
    if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
    }
    return data;
}
export const fetchAllCategoriesFiltered = async (filters: any, page: number, pageSize: number) => {
    const supabase = await createClient();

    const { data, error, count } = await supabase.rpc('get_all_categories', {
        _name_filter: filters.name ?? null,
    }, { count: 'exact' }).range((page - 1) * pageSize, page * pageSize);
    if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
    }
    return { data, count };
}

export const addCategory = async (name: string, image: string | null, ar_name: string) => await fetchDataById('add_category', { _name: name, _image: image ?? null, _ar_name: ar_name });

export const editCategory = async (id: number, name: string, image: string | null, ar_name: string) => await fetchDataById('edit_category', { _id: id, _name: name, _image: image ?? null, _ar_name: ar_name });

export const deleteCategory = async (oldCategoryId: number, newCategoryId: number) => await fetchDataById('delete_category_and_update_courses', {
    old_category_id: oldCategoryId,
    new_category_id: newCategoryId
});

