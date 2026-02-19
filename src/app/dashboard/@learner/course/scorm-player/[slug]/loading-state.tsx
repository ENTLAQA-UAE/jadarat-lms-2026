import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from 'lucide-react'

export function LoadingState() {
 return (
  <Card className="w-full max-w-md mx-auto mt-8">
   <CardContent className="pt-6">
    <div className="flex flex-col items-center gap-4">
     <div className="relative">
      <Loader2 className="h-8 w-8 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
       <div className="h-2 w-2 rounded-full bg-primary" />
      </div>
     </div>
     <p className="text-sm text-muted-foreground">
      Loading Course Content...
     </p>
    </div>
   </CardContent>
  </Card>
 )
}

