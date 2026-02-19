import { fetchUserData } from '@/action/authAction';
import { getAiAndDocumentBuilder } from '@/action/organization/organizationAction';
import EditContent from '@/components/app/LMSAdmin/edit-content/EditContent'
import NoContent from '@/components/shared/NoContent'
import { redirect } from 'next/navigation';

type OrganizationFeatures = {
  ai_builder: boolean;
  document_builder: boolean;
  create_courses: boolean;
};

async function EditContentPage({ searchParams }: { searchParams: { co: string } }) {
  const { user_role, organization_id } = await fetchUserData();
  if (user_role !== 'LMSAdmin') {
    return redirect('/dashboard/courses')
  }

  const features = await getAiAndDocumentBuilder(organization_id) as OrganizationFeatures;

  if (!features.create_courses) {
    return redirect('/dashboard/courses')
  }

  return (
    <>
      {searchParams.co ? (
        <div className="h-screen w-screen">
          <EditContent coassembleId={searchParams.co} />
        </div>
      ) : (
        <NoContent />
      )}
    </>
  )
}

export default EditContentPage
