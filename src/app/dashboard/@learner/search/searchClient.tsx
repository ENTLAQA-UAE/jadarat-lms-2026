"use client";

import { useEffect, useState } from "react";
import Course from "@/components/app/home/learnerDashboard/Course";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CoursesType, FullCourseTypes } from "../../../home/types";
import CourseCardSkeleton from "@/components/skeleton/CourseCardSkeleton";


const SearchClient = (
    { courses, userCourses }: { courses: CoursesType[], userCourses: CoursesType[] }
) => {
    const isFullCourseType = (course: CoursesType | FullCourseTypes): course is FullCourseTypes => {
        return (course as FullCourseTypes).title !== undefined;
    };
    const searchParam = useSearchParams();

    const [keyword, setKeyword] = useState<string>('')
    useEffect(() => {
        const key = searchParam.get('keyword');

        if (key) {
            setKeyword(key)
        }
    }, [searchParam])


    const combinedCourses = [...userCourses, ...courses.filter(course => !userCourses.some(userCourse => userCourse.course_id === course.course_id))];



    return (
        <div className="flex p-4 min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {combinedCourses.length ? combinedCourses.filter(course =>
                        (isFullCourseType(course) ? course?.title.toLowerCase().trim().includes(keyword.toLowerCase().trim()) : course?.name.toLowerCase().trim().includes(keyword.toLowerCase().trim())) ||
                        course.description.toLowerCase().trim().includes(keyword.toLowerCase().trim())
                    ).map(course => {
                        return (
                            <Course
                                key={course.course_id}
                                course={course}
                                completed={course.percentage === 100}
                            />
                        )
                    }) : Array.from({ length: 4 }).map((_, i) => {
                        return <CourseCardSkeleton key={i} />
                    })}
                </div>
            </main>
        </div>
    );
};

export default SearchClient;
