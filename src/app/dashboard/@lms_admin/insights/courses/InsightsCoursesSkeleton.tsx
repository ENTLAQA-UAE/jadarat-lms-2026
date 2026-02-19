"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function NewCoursesPerMonth() {
 return (
  <Card>
   <CardHeader>
    <CardTitle>
     <Skeleton className="h-6 w-[200px]" />
    </CardTitle>
   </CardHeader>
   <CardContent>
    <div className="h-[200px] flex items-end justify-between space-x-2">
     <Skeleton className="w-1/3 h-full" />
     <Skeleton className="w-1/3 h-3/4" />
     <Skeleton className="w-1/3 h-1/2" />
    </div>
    <div className="flex justify-between mt-2">
     {['Jul', 'Aug', 'Sep'].map((month) => (
      <Skeleton key={month} className="h-4 w-10" />
     ))}
    </div>
   </CardContent>
  </Card>
 )
}
export function CoursesByCategory() {
 return (
  <Card>
   <CardHeader>
    <CardTitle>
     <Skeleton className="h-6 w-[200px]" />
    </CardTitle>
   </CardHeader>
   <CardContent>
    <div className="aspect-square size-32 mx-auto relative">
     <Skeleton className="absolute inset-0 rounded-full" />
    </div>
    <div className="mt-4 space-y-2">
     {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
     ))}
    </div>
   </CardContent>
  </Card>
 )
}

export const CourseTableSkeleton = () => (
 <div className="w-full overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
   <thead>
    <tr>
     <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <Skeleton className="h-4 w-24" />
     </th>
     <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <Skeleton className="h-4 w-24" />
     </th>
     <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <Skeleton className="h-4 w-24" />
     </th>
    </tr>
   </thead>
   <tbody className="bg-white divide-y divide-gray-200">
    {Array.from({ length: 5 }).map((_, index) => (
     <tr key={index}>
      <td className="px-6 py-4 whitespace-nowrap">
       <Skeleton className="h-4 w-full" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
       <Skeleton className="h-4 w-full" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
       <Skeleton className="h-4 w-full" />
      </td>
     </tr>
    ))}
   </tbody>
  </table>
 </div>
);


