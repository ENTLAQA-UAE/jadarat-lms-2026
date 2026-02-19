import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'

function CourseCardSkeleton() {
    return (
        <Card >
          <CardContent className="p-4">
            <div>
              <Skeleton className="w-full  h-[250px]" />
              <Skeleton className="w-[90px] h-[14px] my-2" />
              <Skeleton className="text-end mr-auto w-[120px] h-[14px] mb-2" />
              <Skeleton className="w-full h-[10px]" />
            </div>
            <Skeleton className='w-[40%] lg:w-[30%] h-[30px] mt-6' />
          </CardContent>
        </Card>
      );
}

export default CourseCardSkeleton