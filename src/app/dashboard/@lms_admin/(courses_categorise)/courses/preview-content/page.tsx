import { fetchUserData } from '@/action/authAction';
import { getAiAndDocumentBuilder } from '@/action/organization/organizationAction';
import { redirect } from 'next/navigation';
import { PreviewPlayer } from './PreviewPlayer';

interface OrganizationFeatures {
  create_courses: boolean;
}

async function PreviewContentPage({ searchParams }: { searchParams: { courseId?: string } }) {
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

  const courseId = searchParams.courseId;
  if (!courseId || isNaN(Number(courseId))) {
    return redirect('/dashboard/courses');
  }

  return (
    <PreviewPlayer
      courseId={parseInt(courseId)}
      userId={userData?.id ?? ''}
      userName={userData?.name ?? ''}
    />
  );
}

export default PreviewContentPage;
