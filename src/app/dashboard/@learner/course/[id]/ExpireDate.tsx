import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWarning } from "lucide-react";

function ExpireDate({ isCourseExpired, expirationDate }: { isCourseExpired: boolean, expirationDate: Date }) {

  return (
   <>
    {isCourseExpired && (
     <Alert variant="destructive" className="mt-2">
      <FileWarning className="w-5 h-5 text-destructive mr-2" />
      <AlertDescription>
       Your Enrollment will expire on{' '}
       {expirationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
       })}
      </AlertDescription>
     </Alert>
    )}
   </>
  )
}

export default ExpireDate