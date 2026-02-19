export const revalidate = 0
export const dynamic = 'force-dynamic'
import { ReactNode } from "react";
import LearnerHOC from "@/hoc/learner.hoc";
import { getUserCourses } from "@/action/leaner/getUserCourse";

export default async function LearnerLayout({ children }: { children: ReactNode }) {
  const courses = await getUserCourses()
  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <LearnerHOC courses={courses} />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}