import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CourseInfoSkeleton() {
  return (
    <div className="flex flex-col  md:flex-row gap-8 lg:gap-12 ">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="w-[120px] h-[20px]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-col">
          <Skeleton className="w-[350px] h-[350px]" />
          <Skeleton className="w-72 h-[14px] " />
          <Skeleton className="w-72 h-[14px] " />
          <Skeleton className="w-72 h-[14px] " />
          <Skeleton className="w-full  h-[37px] py-4" />
        </CardContent>
      </Card>
      <div className="flex-1  flex flex-col gap-6">
        <Skeleton className="w-[60%] h-7" />
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-[90px] h-3" />
        <Skeleton className="w-[110px] mt-4 h-5" />
        <div className="flex  flex-col gap-6 w-full">
          <div className="flex flex-col gap-3">
            <Skeleton className="w-[30%] h-[16px] " />
            <Skeleton className="w-[80%] h-[12px]" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[30%] h-[16px] " />
            <Skeleton className="w-[80%] h-[12px]" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[30%] h-[16px] " />
            <Skeleton className="w-[80%] h-[12px]" />
          </div>
        </div>
        <Skeleton className="bg-muted w-full h-36"></Skeleton>
      </div>
    </div>
  );
}

export default CourseInfoSkeleton;
