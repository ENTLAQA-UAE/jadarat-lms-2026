import CourseCardSkeleton from '@/components/skeleton/CourseCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'

function continueCourseSkeleton() {
  return (
    
    <>
    <div className="py-4 flex justify-between items-center">
    <Skeleton className="w-[120px] h-[20px]" />
    <Skeleton className="w-[80px] h-[20px]" />
  </div>

  <div className="grid grid-cols-3 p-2 gap-6">
    {Array.from({ length: 3 }).map((_, i) => {
      return (
       <CourseCardSkeleton key={i} />
      );
    })}
  </div>
  
    </>
  )
}

export default continueCourseSkeleton