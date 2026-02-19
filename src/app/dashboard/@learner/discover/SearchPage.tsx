"use client";

import { useState } from "react";
import Course from "@/components/app/home/learnerDashboard/Course";

import DropdownFilter from "../../../../components/DropdownFilter";
import DiscoverCoursesCard from "./DiscoverCoursesCard";

const SearchPage = ({courses, userCourses, categories}:{courses: any, userCourses: any, categories: any}) => {
 const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

 return (
  <div className="flex min-h-screen w-full flex-col">
   <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
    <div className="w-full z-99">
     <DropdownFilter selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categories} />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
     {courses
        .filter((e: any) => !userCourses.map((i: any) => i.course_id).includes(e.course_id))
        .filter((e: any) => !selectedCategory || e.category_id === selectedCategory)
        .map((course: any) => (
          <Course key={course.id} course={course} />
        )).length === 0 ? (
          <DiscoverCoursesCard />
        ) : (
          courses
            .filter((e: any) => !userCourses.map((i: any) => i.course_id).includes(e.course_id))
            .filter((e: any) => !selectedCategory || e.category_id === selectedCategory)
            .map((course: any) => (
              <Course key={course.id} course={course} />
            ))
        )}
    </div>
   </main>
  </div>
 );
};

export default SearchPage;
