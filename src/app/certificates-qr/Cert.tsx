"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { LanguageSwitcherDropdown } from "@/components/ui/LanauageSwitcherDropdown"
import Image from "next/image"
import DisplayThumbnail from "@/components/pdfThumbnail"

interface Certificate {
 certificate_id: number;
 issued_at: string; // ISO 8601 date string
 user_name: string;
 user_email: string;
 course_title: string;
 course_description: string;
 organization_id: number;
 certificate_auth_title: string;
 certificate: string; // URL string
 org_logo: string; // URL string
}
function Cert({ certData }: { certData: Certificate | null }) {
 const t = {
  title: "Certificate Validation",
  issuedBy: "Issued By",
  issuedTo: "Issued To",
  issuanceDate: "Issuance Date",
  courseName: "Course Name",
  signedBy: "Signed By",
  validationText:
   "This is to validate the authenticity of Certificate No. 3323",
  languageSelect: "Language",
 };
  return (
   <Card className="w-full max-w-3xl mx-auto">
    <CardHeader className="flex justify-between items-center">
     {certData?.org_logo ? (
      <Image
       src={certData?.org_logo || ""}
       width={200}
       height={200}
       alt="Logo"
       className="h-15 w-30 object-contain"
      />
     ) : (
      <Skeleton className="w-[200px] h-[200px] mb-3" />
     )}
     <LanguageSwitcherDropdown />
    </CardHeader>
    <CardContent className="space-y-6">
     <h2 className="text-2xl font-bold text-center">{t.title}</h2>
     <div className="flex justify-center">
      <div className="w-full">
       {certData?.certificate && (
        <DisplayThumbnail
         fileUrl={certData?.certificate}
         pageIndex={1}
         width={310}
        />
       )}
      </div>
     </div>
     <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
       <p className="font-semibold">Issued By:</p>
       <p className="exclude-weglot">{certData?.certificate_auth_title}</p>
      </div>
      <div>
       <p className="font-semibold">Issued To:</p>
       <p className="exclude-weglot">{certData?.user_name}</p>
      </div>
      <div>
       <p className="font-semibold">Issuance Date:</p>
       <p>
        {new Date(certData?.issued_at || "").toLocaleDateString()}
       </p>
      </div>
      <div>
       <p className="font-semibold">Course Name:</p>
       <p className="exclude-weglot">{certData?.course_title}</p>
      </div>
      <div>
       <p className="font-semibold">Signed By:</p>
       <p className="exclude-weglot">{certData?.certificate_auth_title}</p>
      </div>
     </div>
    </CardContent>
    <CardFooter>
     <p className="text-sm text-center w-full">
      This is to validate the authenticity of Certificate No.{" "}
      {certData?.certificate_id}
     </p>
    </CardFooter>
   </Card>
  )
}

export default Cert