"use client"

import { ArrowUp } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import type { CoursesType } from "@/app/home/types"

interface RecentCoursesProps {
    courses: CoursesType[]
}

export function RecentCourses({ courses }: RecentCoursesProps) {
    const router = useRouter()
    const incompleteCourses = courses.filter(course => course.percentage !== 100)

    if (!incompleteCourses.length) return null

    return (
        <div>
            <h3 className="mb-4 text-lg font-semibold">Recent Courses</h3>
            <ul className="grid gap-4">
                {incompleteCourses.slice(0, 3).map((course) => (
                    <li
                        key={course.course_id}
                        className="flex w-full items-center gap-4 rounded-lg bg-background p-4 shadow-sm hover:border-primary group cursor-pointer"
                    >
                        <div
                            onClick={() => router.push(course.isscorm ? `/dashboard/course/scorm-player/${course.slug}` : `/dashboard/course/play/${course.slug}`)}
                            className="relative"
                        >
                            <Image
                                src={course.thumbnail}
                                width={48}
                                height={48}
                                alt="Course"
                                className="h-12 w-12 rounded-md object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowUp className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-muted-foreground" />
                            <p dir="auto" className="font-semibold text-sm">
                                {course.title}
                            </p>
                            <div className="flex items-center justify-between">
                                <Progress value={course.percentage} className="h-2 w-full" />
                                <span className="ml-2 text-sm">{course.percentage}%</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}