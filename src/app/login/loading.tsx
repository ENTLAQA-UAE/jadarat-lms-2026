import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
 return (
  <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] h-screen">
   <div className="flex items-center justify-center py-12">
    <div className="mx-auto grid w-[350px] gap-6">
     <Skeleton className="h-40 w-1/2 mb-20 mx-auto" />
     <Skeleton className="h-8 w-full" />
     <Skeleton className="h-4 w-3/4" />
     <Skeleton className="h-10 w-full" />
     <Skeleton className="h-10 w-full" />
     <Skeleton className="h-10 w-full mt-4" />
    </div>
   </div>
   <div className="hidden bg-muted lg:block">
    <Skeleton className="h-full w-full" />
   </div>
  </div>
 );
}