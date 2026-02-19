import { Loader2 } from "lucide-react"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingComponent() {
 return (
  <div className="min-h-screen w-full max-w-3xl mx-auto p-4 space-y-6">
   {/* Header */}
   <div className="flex flex-col items-center gap-4">
    <Skeleton className="h-[60px] w-[200px]" />
    <Select defaultValue="english" disabled>
     <option value="english">English</option>
    </Select>
   </div>

   {/* Title */}
   <h1 className="text-2xl font-semibold text-center">Certificate Validation</h1>

   {/* Loading Card */}
   <Card>
    <CardContent className="pt-6">
     <div className="flex flex-col items-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="space-y-2">
       <h2 className="text-xl font-semibold">Loading Certificate Data</h2>
       <p className="text-muted-foreground max-w-md">
        Please wait while we fetch the certificate information...
       </p>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Details Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    {[...Array(4)].map((_, index) => (
     <div key={index} className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-full" />
     </div>
    ))}
   </div>

   <Skeleton className="h-4 w-2/3 mx-auto mt-6" />
  </div>
 )
}