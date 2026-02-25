export const dynamic = 'force-dynamic';
import UserCoursesLeaner from './UserCoursesLeaner';
import { getUserCourses } from '@/action/leaner/getUserCourse';

const LeanerPage = async () => {
  try {
    const userCourse = await getUserCourses();

    if (!userCourse || !Array.isArray(userCourse)) {
      console.error('Invalid user course data:', userCourse);
      return (
        <div className="p-4 sm:p-6">Error: Invalid course data received. Please try again later.</div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <UserCoursesLeaner userCourses={userCourse ?? []}/>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user courses:', error);

    let errorMessage = 'An unexpected error occurred. Please try again later.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }

    return <div className="p-4 sm:p-6">{errorMessage}</div>;
  }
};

export default LeanerPage;
