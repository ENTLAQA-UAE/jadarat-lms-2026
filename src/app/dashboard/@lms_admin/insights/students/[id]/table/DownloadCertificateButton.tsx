import { Button } from "@/components/ui/button";
import { CloudDownload } from "lucide-react";

export default function DownloadCertificateButton() {
  return (
   <Button
    asChild
    size="sm"
    variant="outline"
    className="w-[60%] cursor-pointer"
    onClick={() => {}}
   >
    <p className="flex gap-4">
     {/* <DownloadCloud size={25} className="h-4 w-4" /> */}
     <CloudDownload size={25} className="h-4 w-4" />
     Download
    </p>
   </Button>
  )
}
