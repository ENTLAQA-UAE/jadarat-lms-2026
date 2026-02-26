import { fetchUserData } from '@/action/authAction';
import { getAiAndDocumentBuilder } from '@/action/organization/organizationAction';
import NoContent from '@/components/shared/NoContent';
import { redirect } from 'next/navigation';

type OrganizationFeatures = {
  ai_builder: boolean;
  document_builder: boolean;
  create_courses: boolean;
};

/**
 * Edit Content Page (Stub)
 *
 * Previously loaded Coassemble edit iframe via EditContent component.
 * Now redirects to the native block editor build-course page.
 * Will be fully replaced in Phase 1 with the native editor.
 */
async function EditContentPage({ searchParams }: { searchParams: { courseId?: string } }) {
  const userData = await fetchUserData();
  const user_role = userData?.user_role ?? '';
  const organization_id = userData?.organization_id;
  if (user_role !== 'LMSAdmin') {
    return redirect('/dashboard/courses');
  }

  const features = await getAiAndDocumentBuilder(organization_id) as OrganizationFeatures;

  if (!features.create_courses) {
    return redirect('/dashboard/courses');
  }

  if (searchParams.courseId) {
    return redirect(`/dashboard/courses/add-course/build-course?courseId=${searchParams.courseId}`);
  }

  return <NoContent />;
}

export default EditContentPage;
