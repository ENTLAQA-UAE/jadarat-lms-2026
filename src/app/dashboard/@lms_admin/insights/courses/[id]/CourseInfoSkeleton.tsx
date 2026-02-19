"use client"
import { Skeleton } from "@/components/ui/skeleton"

export default function CourseInfoSkeleton() {
 return (
  <div className="grid md:grid-cols-2 gap-6">
   <div>
    <Skeleton className="w-full h-64 rounded-lg" />
   </div>
   <div className="space-y-4">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-6 w-1/5" />
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-6 w-1/4" />
   </div>
  </div>
 )
}