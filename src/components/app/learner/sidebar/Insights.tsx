import type { CoursesType } from "@/app/home/types"

interface InsightsProps {
 courses: CoursesType[]
}

export function Insights({ courses }: InsightsProps) {
 return (
  <div>
   <h3 className="mb-4 text-lg font-semibold">Insights</h3>
   <div className="grid gap-4">
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Completed Courses</div>
     <div className="text-3xl font-bold">
      {courses.filter((e) => e.percentage === 100).length}
     </div>
    </div>
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Courses to Continue</div>
     <div className="text-3xl font-bold">
      {courses.filter((e) => e.percentage && e.percentage < 100 && e.percentage > 0).length}
     </div>
    </div>
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Courses to Do</div>
     <div className="text-3xl font-bold">
      {courses.filter((e) => e.percentage === 0).length}
     </div>
    </div>
   </div>
  </div>
 )
}