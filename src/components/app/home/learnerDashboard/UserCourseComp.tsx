import { CoursesType } from "@/app/home/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function UserCourse({ course }: { course: CoursesType, }) {
  return (
    <>
      <Card key={course.id}>
        <CardHeader className="exclude-weglot">
          <Image
            src={course.thumbnail}
            width={400}
            height={225}
            alt="Course"
            className="aspect-video w-full rounded-t-lg object-cover"
          />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground exclude-weglot">{course.category}</div>
          <p dir="auto" className="mb-2 font-semibold exclude-weglot">
            {course.name}
          </p>
          <div className="text-sm text-muted-foreground exclude-weglot">
            <div className="flex items-center justify-between">
              <Progress value={course.percentage} className="h-2 w-full" />
              <span className="ms-2">{course.percentage}%</span>
            </div>
          </div>
          <Link href={`course/play/${course.slug}`}>
            <Button className="mt-4">Continue Course</Button>
          </Link>
        </CardContent>
      </Card>
    </>
  );
}

export default UserCourse;