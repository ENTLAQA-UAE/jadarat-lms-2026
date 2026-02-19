import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileWarning } from "lucide-react"
import Link from "next/link"

export default function NoCertificatesFound() {
 return (
  <div className="flex items-center justify-center min-h-screen bg-background">
   <Card className="w-full max-w-md">
    <CardHeader className="text-center">
     <FileWarning className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
     <CardTitle className="text-2xl font-bold">No Certificates Found</CardTitle>
     <CardDescription>If you have completed any course, you can issue the certificate from courses section.</CardDescription>
    </CardHeader>
    <CardContent className="text-center">
     <p className="text-sm text-muted-foreground">
      If you haven’t completed any courses, please complete one to get a certificate.
     </p>
    </CardContent>
    <CardFooter className="flex justify-center">
     <Button variant="link" asChild>
      <Link href="/dashboard" className="text-primary text-lg flex items-center">Dashboard
       <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
     </Button>
    </CardFooter>
   </Card>
  </div>
 )
}