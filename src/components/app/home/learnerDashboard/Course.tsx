'use client'

import { CoursesType, FullCourseTypes } from "@/app/home/types";
import { ReadMore } from "@/components/readmore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import React from "react";
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
  const percentage = course?.percentage ?? -1;

  return (
    <Card key={course?.id} className="group overflow-hidden transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5">
      <CardHeader className="exclude-weglot p-0">
        <div className="relative overflow-hidden">
          <Image
            src={course?.thumbnail || ""}
            width={400}
            height={225}
            alt={course?.name || "course"}
            layout="responsive"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Category badge */}
          <div className="absolute top-2.5 start-2.5 z-10">
            <Badge variant="secondary" className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-[10px] font-medium shadow-xs border-0 text-foreground">
              {isRTL ? course?.category_ar_name : course?.category_name}
            </Badge>
          </div>

          {/* Progress badge */}
          {percentage >= 0 && (
            <div className="absolute top-2.5 end-2.5 z-10">
              <Badge
                variant={completed ? "success" : "secondary"}
                className={completed
                  ? "text-[10px]"
                  : "bg-white/90 dark:bg-black/60 backdrop-blur-md shadow-xs border-0 text-[10px] text-foreground"
                }
              >
                {completed ? (isRTL ? "مكتمل" : "Completed") : `${percentage}%`}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 p-4">
        <h3 dir="auto" className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150 exclude-weglot">
          {isFullCourseType(course) ? course.title : course.name}
        </h3>

        {percentage < 0 ? (
          <ReadMore
            id={course?.id?.toString() ?? ''}
            text={course?.description as string}
            amountOfWords={17}
          />
        ) : (
          <div className="space-y-1">
            <Progress
              value={percentage}
              className="h-1 w-full"
              gradient={percentage > 50}
              progressClassName={completed ? "bg-success" : undefined}
            />
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {percentage}% {isRTL ? "مكتمل" : "complete"}
            </p>
          </div>
        )}
        <CourseButtonActions course={course} completed={completed} />
      </CardContent>
    </Card>
  );
}

export default Course;
