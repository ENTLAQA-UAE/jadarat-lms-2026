"use client";

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation";

export default function ExpiredCourse() {
 const router = useRouter();
 return (
  <div className="min-h-screen w-full grid place-items-center bg-gray-100 dark:bg-gray-900">
   <Card className="w-full max-w-md">
    <CardHeader className="text-center">
     <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
     </div>
     <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Expired</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
     <p className="text-gray-600 dark:text-gray-300">
      Your access to this course has expired, If you would like to renew access please connect with L&D Team to remove your past Enrollment
     </p>
    </CardContent>
    <CardFooter className="flex justify-center">
     <Button className="w-full sm:w-auto" onClick={() => router.back()}>
      Back to Course
     </Button>
    </CardFooter>
   </Card>
  </div>
 )
}