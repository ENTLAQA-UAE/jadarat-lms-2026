import { fetchUserData } from '@/action/authAction';
import { getAiAndDocumentBuilder } from '@/action/organization/organizationAction';
import { redirect } from 'next/navigation';

interface OrganizationFeatures {
  create_courses: boolean;
}

/**
 * Preview Content Page (Stub)
 *
 * Previously loaded Coassemble preview iframe via PreviewContent component.
 * Will be replaced in Phase 1 with a read-only CoursePlayer preview.
 * For now, shows a simple "coming soon" placeholder.
 */
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

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-semibold">Course Preview</h2>
        <p className="text-muted-foreground">
          The native course preview will be available once the block editor is complete.
        </p>
        {searchParams.courseId && (
          <p className="text-sm text-muted-foreground">Course #{searchParams.courseId}</p>
        )}
      </div>
    </div>
  );
}

export default PreviewContentPage;
