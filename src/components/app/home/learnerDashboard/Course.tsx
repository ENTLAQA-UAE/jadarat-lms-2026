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
    <Card key={course?.id} className="group overflow-hidden border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="exclude-weglot p-0">
        {/* Image with hover zoom + gradient overlay */}
        <div className="relative overflow-hidden">
          <Image
            src={course?.thumbnail || ""}
            width={400}
            height={225}
            alt={course?.name || "course"}
            layout="responsive"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge floating on image */}
          <div className="absolute top-3 start-3 z-10">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-[11px] font-medium shadow-sm border-0">
              {isRTL ? course?.category_ar_name : course?.category_name}
            </Badge>
          </div>

          {/* Progress badge on image (if in progress) */}
          {percentage >= 0 && (
            <div className="absolute top-3 end-3 z-10">
              <Badge
                variant={completed ? "success" : "secondary"}
                className={completed
                  ? "shadow-sm"
                  : "bg-card/90 backdrop-blur-sm shadow-sm border-0"
                }
              >
                {completed ? (isRTL ? "مكتمل" : "Completed") : `${percentage}%`}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <h3 dir="auto" className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 exclude-weglot">
          {isFullCourseType(course) ? course.title : course.name}
        </h3>

        {percentage < 0 ? (
          <ReadMore
            id={course?.id?.toString() ?? ''}
            text={course?.description as string}
            amountOfWords={17}
          />
        ) : (
          <div className="space-y-1.5">
            <Progress
              value={percentage}
              className="h-1.5 w-full"
              gradient={percentage > 50}
              progressClassName={completed ? "bg-success" : undefined}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{percentage}% {isRTL ? "مكتمل" : "complete"}</span>
            </div>
          </div>
        )}
        <CourseButtonActions course={course} completed={completed} />
      </CardContent>
    </Card>
  );
}

export default Course;
