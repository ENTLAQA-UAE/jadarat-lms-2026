import { store } from "@/redux/sotre"
import { createClient } from "./supabase"
import { setUserCourses } from "@/redux/user.slice"

export const getUserCourses = async () => {
    const supabase = createClient()
    let { data, error } = await supabase
        .rpc('get_user_courses')
    if (!error) store.dispatch(setUserCourses(data))
}