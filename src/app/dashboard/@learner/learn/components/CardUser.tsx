"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"


export default function Component() {
 return (
  <Card className="w-full max-w-md shadow-lg">
   <CardHeader className="flex flex-row items-center gap-4">
    <div className="rounded-full bg-primary p-2">
     <BookOpen className="h-6 w-6 text-primary-foreground" />
    </div>
    <div>
     <CardTitle className="text-xl">New Course Available</CardTitle>
    </div>
   </CardHeader>
   <CardContent>
    <h3 className="font-semibold text-lg mb-2">New Course Available</h3>
    <p className="text-muted-foreground">
     Learn the basics of HTML, CSS, and JavaScript to kickstart your web development journey.
    </p>
   </CardContent>
   <CardFooter>
    <Button className="w-full">
     Join Course
    </Button>
   </CardFooter>
  </Card>
 )
}