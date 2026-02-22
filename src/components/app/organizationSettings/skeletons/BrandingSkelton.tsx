import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function BrandingSkelton() {
  return (
    <Card className="w-full">
      <CardContent className="w-full px-6 py-12 rounded-lg dark:bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-20">
          <div className="h-[400px] flex flex-col gap-4">
            <div className="text-left space-y-2">
              <Skeleton className="w-[120px] h-[24px]" dir="auto"></Skeleton>
              <Skeleton className="w-[200px]  xl:w-[460px] h-[14px]"></Skeleton>
            </div>

            <div className="flex flex-col h-full justify-between mt-16">
              <Skeleton className=" w-full md:w-[80%]  h-[140px]" />

              <div>
                <label
                  htmlFor="organization-name"
                  className="block text-sm font-medium text-foreground"
                ></label>
                <div className="mt-1 relative">
                  <Skeleton className="block w-full rounded-md  h-[40px]" />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[400px] flex flex-col justify-between">
            <Skeleton className="h-[320px] max-h-[290px]" />

            <div className="relative w-full flex justify-end">
              <Skeleton className="flex items-center gap-2 w-[183px] h-[44px]"></Skeleton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BrandingSkelton;
