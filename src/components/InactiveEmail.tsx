import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

export default function InactiveEmail() {
 return (
  <Card className="w-full max-w-md mx-auto">
   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Email Status</CardTitle>
    <Badge variant="destructive" className="text-xs">
     Inactive
    </Badge>
   </CardHeader>
   <CardContent>
    <div className="flex items-center space-x-4">
     <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
     <div>
      <p className="text-sm text-muted-foreground mt-1">
       This email address is currently inactive
      </p>
     </div>
    </div>
    <p className="text-sm mt-4">
     To reactivate this email, please contact support or update your account settings.
    </p>
   </CardContent>
  </Card>
 )
}