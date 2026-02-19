import React from 'react'
import CourseViewer from './Play'
import { checkUserCourseStatus } from '@/action/leaner/checkUserCourseStatus';
import ExpiredCourse from './ExpiredCourse';
import EnrollCourse from './EnrollCourse';

async function page({ params }: { params: { id: string } }) {
  const courseStatus = await checkUserCourseStatus(params.id);

  // if course is expired,render expired component
  if (courseStatus?.is_expired) {
    return <ExpiredCourse />
  }

  // if course is not expired, and user is not enrolled, render enroll component
  if (!courseStatus?.is_expired && !courseStatus?.is_enrolled) {
    return <EnrollCourse />
  }

  return (
    <div>
      <CourseViewer params={params} />
    </div>
  )
}

export default page