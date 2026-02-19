import { CoursesType } from '@/app/home/types';
import Course from '@/components/app/home/learnerDashboard/Course';

const UserCoursesLeaner = ({ userCourses }: { userCourses: CoursesType[] }) => {
    return (
        <div className="flex p-6 min-h-screen w-full flex-col">
            <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCourses && userCourses.length > 0 ? (
                    userCourses.map((course) => (
                        <Course key={course.id} course={course} completed={true} />
                    ))
                ) : (
                    <p>No courses found.</p>
                )}
            </main>
        </div>
    );
};

export default UserCoursesLeaner;
