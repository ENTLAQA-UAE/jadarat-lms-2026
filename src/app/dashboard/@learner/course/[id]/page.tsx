export const dynamic = 'force-dynamic'
export const revalidate = 0
import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { getCourseByIdAction } from '@/action/leaner/getCourseById';
import { getOrganizationDetails } from '@/action/organization/organizationAction';
import { headers } from 'next/headers';
import { LoadingAnimation } from '@/components/loader';
import { fetchUserData } from '@/action/authAction';
import CourseNotFound from './CourseNotFound';

const CourseInfo = dynamicImport(() => import('./CourseInfo'), { loading: () => <div className='h-screen w-full flex justify-center items-center'><LoadingAnimation /></div> });

export default async function CourseDetails({ params: { id } }: { params: { id: string } }) {
  const domain = headers().get('host') ?? '';
  const [courseInfo, organizationDetails, userData] = await Promise.all([
    getCourseByIdAction(id),
    getOrganizationDetails(domain),
    fetchUserData()
  ]);

  if (!courseInfo) {
    return <CourseNotFound />
  }

  return (
    <Suspense fallback={<div className='h-screen w-full flex justify-center items-center'><LoadingAnimation /></div>}>
      <CourseInfo courseInfo={courseInfo} organizationDetails={organizationDetails} userData={userData} />
    </Suspense>
  );
}