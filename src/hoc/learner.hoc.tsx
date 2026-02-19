"use client"

// components/app/learner/learner-hoc.tsx
import { usePathname } from "next/navigation"
import RecentCoursesSideBarSkeleton from "@/components/app/home/skeletonAdmin/SidebarSkeleton"
import type { CoursesType } from "@/app/home/types"
// import { MobileDrawer } from "@/components/app/learner/sidebar/MobileDrawer"
import { SearchInput } from "@/components/app/learner/sidebar/SearchInput"
import { RecentCourses } from "@/components/app/learner/sidebar/RecentCourses"
import { Insights } from "@/components/app/learner/sidebar/Insights"
import dynamic from "next/dynamic"

interface LearnerHOCProps {
  courses: CoursesType[]
}

export default function LearnerHOC({ courses }: LearnerHOCProps) {
  const path = usePathname()

  const DynamicHeader = dynamic(() => import('../components/app/learner/sidebar/MobileDrawer').then(mod => mod.MobileDrawer), {
    ssr: true,
  })
  if (path.includes("play") || path.includes("certificates")) {
    return <></>
  }

  return (

    <>
      <aside className="relative hidden w-[300px] flex-col gap-8 bg-muted p-6 md:flex">
        {!["/dashboard/search"].includes(path) && (
          <div>
            <SearchInput />
          </div>
        )}

        {courses.length > 0 && (
          <RecentCourses courses={courses} />
        )}

        <Insights courses={courses} />
      </aside>

      <div className="flex px-8 mt-4 md:hidden">
        <DynamicHeader courses={courses} />
      </div>
    </>
  )
}