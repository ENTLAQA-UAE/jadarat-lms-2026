'use client'

import { CoursesType, FullCourseTypes } from "@/app/home/types";
import { ReadMore } from "@/components/readmore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import CourseButtonActions from "./CourseButtonActions";
import { useLanguage } from "@/context/language.context";

function Course({
  course,
  completed,
}: {
  course: CoursesType | FullCourseTypes;
  completed?: boolean;
}) {
  function isFullCourseType(
    course: CoursesType | FullCourseTypes
  ): course is FullCourseTypes {
    return (course as FullCourseTypes).title !== undefined;
  }


  const { isRTL } = useLanguage()

  return (
    <>
      <Card key={course?.id} className="">
        <CardHeader className="exclude-weglot p-0 mb-4">
          <Image
            src={course?.thumbnail || ""}
            width={400}
            height={225}
            alt={course?.name || "course"}
            layout="responsive"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Define image sizes for responsiveness
            loading="lazy" // Prioritize loading for above-the-fold content
            className="aspect-video w-full rounded-t-lg object-cover"
          />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground exclude-weglot">
            {isRTL ? course?.category_ar_name : course?.category_name}
          </div>
          <h1 dir="auto" className="mb-2  font-semibold exclude-weglot">
            {isFullCourseType(course) ? course.title : course.name}
          </h1>
          {(course?.percentage ?? -1) < 0 ? (
            <ReadMore
              id={course?.id?.toString() ?? ''}
              text={course?.description as string}
              amountOfWords={17}
            />
          ) : (
            <div className="text-sm text-muted-foreground exclude-weglot">
              <div className="flex items-center justify-between">
                <Progress value={course.percentage} className="h-2 w-full" />
                <span className="ms-2">{course.percentage}%</span>
              </div>
            </div>
          )}
          <CourseButtonActions course={course} completed={completed} />
        </CardContent>
      </Card>
    </>
  );
}

export default Course;
