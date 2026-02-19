import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"

export default function DiscoverCoursesCard() {
 return (
  <div className="w-full flex items-center justify-center bg-background md:col-span-3">
   <Card className="w-full max-w-md">
    <CardHeader className="text-center">
     <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
     <CardTitle className="text-2xl font-bold">No Courses Found</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
     <p className="text-sm text-muted-foreground">
      It seems like you don’t have any new courses to complete right now
     </p>
    </CardContent>
    <CardFooter className="flex justify-center">
     <Button asChild variant="outline">
      <Link href="/dashboard" className="flex items-center">
       Go to Dashboard
       <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
     </Button>
    </CardFooter>
   </Card>
  </div>
 )
}
