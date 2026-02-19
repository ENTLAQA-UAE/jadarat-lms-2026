"use client";

import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation";

export default function CourseNotFound() {
 const router = useRouter();

 return (
  <div className="flex items-center justify-center min-h-screen">
   <Card className="w-full max-w-md">
    <CardHeader className="text-center">
     <div className="flex justify-center mb-4">
      <XCircle className="h-12 w-12 text-red-500" />
     </div>
     <CardTitle className="text-2xl font-bold">Course Unavailable</CardTitle>
    </CardHeader>
    <CardContent>
     <p className="text-center text-gray-600">
      It may be a wrong url or the course has temporarily unavailable
     </p>
    </CardContent>
    <CardFooter className="flex justify-center">
     <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
    </CardFooter>
   </Card>
  </div>
 )
}