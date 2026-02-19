"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CoursesType, FullCourseTypes } from "@/app/home/types";

function CourseButtonActions({
  course,
  completed,
}: {
  course: CoursesType | FullCourseTypes;
  completed?: boolean;
}) {
  const { push } = useRouter();

  function isFullCourseType(
    course: CoursesType | FullCourseTypes
  ): course is FullCourseTypes {
    return (course as FullCourseTypes).title !== undefined;
  }

  if (isFullCourseType(course)) {
    return (
      <Button
        className="mt-4"
        onClick={() => {
          localStorage.removeItem("selectedCourse");
          push(`/dashboard/course/${course?.slug}`);
          localStorage.setItem(
            "selectedCourse",
            JSON.stringify(course)
          );
        }}
      >
        {!completed ? "View Course" : "Discover Course"}
      </Button>
    );
  } else {
    return (
      <Link
        href={
          course.percentage === 100
            ? `/dashboard/course/${course.slug}`
            : `/dashboard/course/play/${course.slug}`
        }
      >
        <Button className="mt-4">
          {course.percentage === 100
            ? "Discover Course"
            : "Continue Courses"}
        </Button>
      </Link>
    );
  }
}

export default CourseButtonActions;