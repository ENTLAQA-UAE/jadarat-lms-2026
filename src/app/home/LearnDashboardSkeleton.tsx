import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function LearnDashboardSkeleton() {
  return (
    <div className="p-8">
      <Skeleton className="w-full h-[500px]" />

      <div className="py-4 flex justify-between items-center">
        <Skeleton className="w-[120px] h-[20px]" />
        <Skeleton className="w-[80px] h-[20px]" />
      </div>

      <div className="grid grid-cols-3 p-2 gap-6">
        {Array.from({ length: 3 }).map((_, i) => {
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div>
                  <Skeleton className="w-full  h-[250px]" />
                  <Skeleton className="w-[90px] h-[14px] my-2" />
                  <Skeleton className="text-end mr-auto w-[120px] h-[14px] mb-2" />
                  <Skeleton className="w-full h-[10px]" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default LearnDashboardSkeleton;
