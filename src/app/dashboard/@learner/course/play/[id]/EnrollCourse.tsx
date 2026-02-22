"use client";

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation";

export default function EnrollCourse() {
 const router = useRouter();

 const handleReturn = () => {
  router.back();
 }

 return (
  <div className="min-h-screen w-full grid place-items-center bg-muted dark:bg-card">
   <Card className="w-full max-w-md">
    <CardHeader className="text-center">
     <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-warning/20 dark:bg-warning/20 flex items-center justify-center">
      <AlertCircle className="w-6 h-6 text-warning dark:text-warning" />
     </div>
     <CardTitle className="text-2xl font-bold text-foreground dark:text-foreground">Course Not Joined</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
     <p className="text-muted-foreground dark:text-muted-foreground">
      You have not joined this course yet. Please enroll to access the course content.
     </p>
    </CardContent>
    <CardFooter className="flex justify-center">
     <Button onClick={handleReturn} className="w-full sm:w-auto">
      Back to Course
     </Button>
    </CardFooter>
   </Card>
  </div>
 )
}