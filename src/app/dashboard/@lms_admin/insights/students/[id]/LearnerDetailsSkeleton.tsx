import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LearnerDetailsSkeleton() {
 return (
  <Card className="md:col-span-2">
   <CardHeader className="pb-2">
    <CardTitle>
     <Skeleton className="h-8 w-1/3" />
    </CardTitle>
   </CardHeader>
   <CardContent className="flex space-x-4">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="space-y-2 flex-1">
     <Skeleton className="h-6 w-3/4" />
     <Skeleton className="h-4 w-full" />
     <div className="space-y-1 pt-2">
      {[...Array(4)].map((_, index) => (
       <Skeleton key={index} className="h-4 w-5/6" />
      ))}
     </div>
    </div>
   </CardContent>
  </Card>
 )
}