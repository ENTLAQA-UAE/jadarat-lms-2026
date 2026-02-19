
import { Card, CardContent } from "@/components/ui/card"

export function ScormHeader({ title = "Course Content" }) {

 return (
  <Card className="mb-4 border-none shadow-none">
   <CardContent className="flex items-center justify-between p-2">
    <h1 className="text-xl font-semibold">{title}</h1>
   </CardContent>
  </Card>
 )
}

