import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LearnerInsightsSkeleton() {
 return (
  <Card className="w-full max-w-sm">
   <CardHeader className="pb-2">
    <CardTitle>
     <Skeleton className="h-8 w-3/4" />
    </CardTitle>
   </CardHeader>
   <CardContent className="space-y-4">
    {[...Array(3)].map((_, index) => (
     <div key={index} className="flex justify-between items-center">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-6" />
     </div>
    ))}
   </CardContent>
  </Card>
 )
}