"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function NoContent() {
 const router = useRouter();
 return (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
   <Card className="w-full max-w-md p-6 text-center">
    <h2 className="text-lg font-semibold mb-3">No Content Found</h2>
    <p className="text-sm text-muted-foreground mb-5">
     We couldn&apos;t find any content. Please try again later.
    </p>
    <Button onClick={() => router.back()}>
     Go Back
    </Button>
   </Card>
  </div>
 )
}