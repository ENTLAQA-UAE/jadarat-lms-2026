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
    <div className="p-4 sm:p-6">
      <SearchPage courses={organizationCourses} userCourses={userCourses} categories={categories} />
    </div>
  )
}

export default page