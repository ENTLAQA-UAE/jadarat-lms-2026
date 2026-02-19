export const dynamic = 'force-dynamic'
import { getOrganizationCourses } from "@/action/leaner/getOrganizationCourses"
import SearchClient from "./searchClient"
import { getUserCourses } from "@/action/leaner/getUserCourse"
import { getOrgIdByUser } from "@/action/organization/organizationAction"

async function SearchPage() {
    const data = await getOrgIdByUser()
    const [ organizationCourses, userCourses] = await Promise.all([
        getOrganizationCourses({ org_id: data }),
        getUserCourses()
    ])  
    return (
        <SearchClient courses={organizationCourses} userCourses={userCourses} />
    )
}

export default SearchPage