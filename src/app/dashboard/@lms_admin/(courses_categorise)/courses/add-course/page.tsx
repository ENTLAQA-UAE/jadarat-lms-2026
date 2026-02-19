export const dynamic = 'force-dynamic'
import { fetchAllCategories } from "@/action/categories/categoriesActions"
import CourseDetails from "./CourseDetails"
import { CourseDetailsPageProps } from "./types"
import { fetchUserData } from "@/action/authAction";
import { redirect } from "next/navigation";
import { getAiAndDocumentBuilder } from "@/action/organization/organizationAction";


async function CourseDetailsPage() {
    const { user_role, organization_id } = await fetchUserData();
    if (user_role !== 'LMSAdmin') {
        return redirect('/dashboard/courses')
    }
    const categoriesData: CourseDetailsPageProps[] = await fetchAllCategories()
    const features = await getAiAndDocumentBuilder(organization_id) as { ai_builder: boolean; document_builder: boolean };
    return (
        <CourseDetails categories={categoriesData} features={features} />
    )
}

export default CourseDetailsPage