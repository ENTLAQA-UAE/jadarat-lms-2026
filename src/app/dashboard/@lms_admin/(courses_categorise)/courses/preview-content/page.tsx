import { fetchUserData } from "@/action/authAction";
import { getAiAndDocumentBuilder } from "@/action/organization/organizationAction";
import { redirect } from "next/navigation";
import PreviewContent from "@/components/app/LMSAdmin/preview-content/PreviewContent"

interface OrganizationFeatures {
  create_courses: boolean;
}


async function PreviewContentPage({ searchParams }: { searchParams: { co: string } }) {
  const userData = await fetchUserData();
  const user_role = userData?.user_role ?? '';
  const organization_id = userData?.organization_id;
  if (user_role !== 'LMSAdmin') {
    return redirect('/dashboard/courses')
  }
  const features = await getAiAndDocumentBuilder(organization_id) as OrganizationFeatures;
  if (!features.create_courses) {
    return redirect('/dashboard/courses')
  }

  return (
    <>

      <div className="h-screen w-screen">
        {features.create_courses && <PreviewContent coassembleId={searchParams.co} />}
      </div>
    </>
  )
}

export default PreviewContentPage