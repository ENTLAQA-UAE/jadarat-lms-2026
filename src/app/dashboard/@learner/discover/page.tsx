import { getUserCourses } from "@/action/leaner/getUserCourse"
import { getCategories } from "@/action/leaner/getCategories"
import { getOrgIdByUser } from "@/action/organization/organizationAction";
import { getOrganizationCourses } from "@/action/leaner/getOrganizationCourses";
import SearchPage from "./SearchPage";

async function page() {
  const data = await getOrgIdByUser()
  const [categories, organizationCourses, userCourses] = await Promise.all([
    getCategories(),
    getOrganizationCourses({ org_id: data }),
    getUserCourses()
  ])

  return (
    <SearchPage courses={organizationCourses} userCourses={userCourses} categories={categories} />
  )
}

export default page