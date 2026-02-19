import { store } from "@/redux/sotre"
import { getUserCourses } from "./getUserCourses"
import { createClient } from "./supabase"
import { setOrganizationCourses } from "@/redux/organization.slice"

export const getOrganizationCourses = async () => {
    const supabase = createClient()

    getUserCourses()
    let { data, error } = await supabase
        .rpc('get_organization_courses')

    if (!error) {
        store.dispatch(setOrganizationCourses(data))
    }
}