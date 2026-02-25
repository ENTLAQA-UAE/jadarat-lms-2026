'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LearnerDetails from '@/components/shared/LearnerDetails';
import CourseDetails from '@/components/shared/CourseDetails';
import ActionButtons from '@/components/shared/ActionButtons';
import { createClient } from '@/utils/supabase/client';
import DetailPageLayout from '@/components/shared/DetailPageLayout';

export default function EnrollmentsDetailsPage() {
  const supabase = createClient();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const user_id = searchParams.get('user_id');
  const [isLoading, setIsLoading] = useState(true);
  const [learner, setLearner] = useState({
    name: '',
    department: '',
    jobTitle: '',
    group: '',
    profilePicture: '',
  });
  const [courseData, setCourseData] = useState({
    name: '',
    category: '',
    image: '',
    completionPercentage: 0,
    enrollmentDate: '',
  });

  useEffect(() => {
    const fetchUserCourseData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_user_course_details', {
          p_user_id: user_id,
          p_course_id: Number(id),
        });
        if (error) throw error;
        if (data?.length > 0) {
          const userData = data[0];
          setLearner({
            name: userData.user_name,
            department: userData.department,
            jobTitle: userData.job_title,
            group: userData.group_name,
            profilePicture: userData.avatar_url,
          });
          setCourseData({
            name: userData.course_title,
            category: userData.course_category,
            image: userData.course_thumbnail,
            completionPercentage: userData.progress,
            enrollmentDate: userData.created_at,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserCourseData();
  }, [id, supabase, user_id]);

  return (
    <DetailPageLayout
      title="Enrollment Details"
      backHref="/dashboard/enrollments"
      actions={<ActionButtons learner={learner} course={courseData} />}
    >
      <LearnerDetails learner={learner} isLoading={isLoading} />
      <CourseDetails course={courseData} learnerName={learner.name} id={id} isLoading={isLoading} learnerId={user_id ? user_id : ""} />
    </DetailPageLayout>
  );
}
