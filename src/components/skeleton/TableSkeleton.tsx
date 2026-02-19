"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
 rows?: number
 columns?: number
 showHeader?: boolean
}

export default function TableSkeleton({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps = {}) {
 return (
  <div className="w-full">
   <div className="rounded-md border">
    <div className="bg-slate-800 p-4">
     <div className="grid grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
       <Skeleton key={i} className="h-6 w-full bg-slate-700" />
      ))}
     </div>
    </div>
    <div className="p-4 space-y-4">
     {[...Array(9)].map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-5 gap-4">
       {[...Array(5)].map((_, colIndex) => (
        <Skeleton
         key={colIndex}
         className={`h-6 w-full`}
        />
       ))}
      </div>
     ))}
    </div>
   </div>
   <div className="flex justify-between items-center mt-4">
    <Skeleton className="h-6 w-40" />
    <div className="space-x-2">
     <Skeleton className="h-8 w-20 inline-block" />
     <Skeleton className="h-8 w-20 inline-block" />
    </div>
   </div>
  </div>
 )
}