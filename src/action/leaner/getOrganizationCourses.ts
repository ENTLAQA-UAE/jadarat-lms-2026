"use server"

import { createClient } from "@/utils/supabase"


export async function getOrganizationCourses({ org_id }: { org_id: number }) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_org_courses", {
        org_id: org_id
    })

    if (error) {
        console.error("Error fetching courses:", error);
        return null;
    }

    return data;
}