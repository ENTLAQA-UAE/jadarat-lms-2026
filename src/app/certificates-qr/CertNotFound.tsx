"use client"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { LanguageSwitcherDropdown } from "@/components/ui/LanauageSwitcherDropdown"

export default function CertNotFound() {
 return (
  <div className="min-h-screen w-full max-w-3xl mx-auto p-4 space-y-6">
   {/* Header */}
   <div className="flex flex-col items-center gap-4">
    <Image
     src="/placeholder.png"
     alt="Company Logo"
     width={120}
     height={60}
     className="h-[60px] w-auto"
    />
    <LanguageSwitcherDropdown />
   </div>

   {/* Title */}
   <h1 className="text-2xl font-semibold text-center">Certificate Validation</h1>

   {/* Error Card */}
   <Card className="border-destructive">
    <CardContent className="pt-6">
     <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
       <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2">
       <h2 className="text-xl font-semibold text-destructive">Certificate Not Found</h2>
       <p className="text-muted-foreground max-w-md">
        We couldn&apos;t find the certificate you&apos;re looking for. Please check the certificate number and try
        again.
       </p>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Details Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <div className="space-y-2">
     <p className="text-sm font-medium text-muted-foreground">Certificate Number</p>
     <p className="font-mono">Not Found</p>
    </div>
    <div className="space-y-2">
     <p className="text-sm font-medium text-muted-foreground">Issuance Date</p>
     <p className="font-mono">--/--/----</p>
    </div>
    <div className="space-y-2">
     <p className="text-sm font-medium text-muted-foreground">Issued To</p>
     <p className="font-mono">Not Available</p>
    </div>
    <div className="space-y-2">
     <p className="text-sm font-medium text-muted-foreground">Course Name</p>
     <p className="font-mono">Not Available</p>
    </div>
   </div>

   <p className="text-center text-sm text-muted-foreground pt-6">
    If you believe this is an error, please contact support for assistance.
   </p>
  </div>
 )
}