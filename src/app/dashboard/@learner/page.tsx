export const dynamic = 'force-dynamic'
import { getCategories } from "@/action/leaner/getCategories";
import { getOrganizationCourses } from "@/action/leaner/getOrganizationCourses";
import { getOrganizationSliders } from "@/action/leaner/getOrganizationSliders";
import { getUserCourses } from "@/action/leaner/getUserCourse";
import { getOrgIdByUser } from "@/action/organization/organizationAction";
import LearnerDashboard from "@/app/home/learnerDashboard"

async function page() {
  const data = await getOrgIdByUser()
  const [categories, organizationCourses, organizationSliders, userCourses] = await Promise.all([
    getCategories(),
    getOrganizationCourses({ org_id: data }),
    getOrganizationSliders(),
    getUserCourses()
  ])

  return (
    <LearnerDashboard categories={categories} courses={userCourses} sliders={organizationSliders}
      organizationCourses={organizationCourses ?? []}
    />
  )
}

export default page