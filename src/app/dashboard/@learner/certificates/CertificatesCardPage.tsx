'use client';

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CertificatesCardPageType } from "./type";
import DisplayThumbnail from "@/components/pdfThumbnail";
import { ReadMore } from "@/components/readmore";
import { Separator } from "@/components/ui/separator";
import NoCertificatesFound from "./components/NoCertificatesFound";
import { DownloadIcon } from "lucide-react";
import CertificateButton from "@/components/shared/CertificateButton";
import { useAppSelector } from "@/hooks/redux.hook";
import { DownloadFile } from "@/utils/downloadFile";

export default function CertificatesCardPage({ userCertificates }: { userCertificates: CertificatesCardPageType[] }) {

  const { user: { name } } = useAppSelector(state => state.user);

  if (userCertificates.length === 0) {
    return <NoCertificatesFound />
  }

  return (
    <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 gap-8">

        {userCertificates.map(async (certificate) => {
          return (
            <div key={certificate.id} className="bg-card cursor-pointer rounded-lg shadow-md overflow-hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="h-48 bg-cover bg-center overflow-hidden">
                    <DisplayThumbnail fileUrl={certificate.certificate} pageIndex={1} width={400} />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>Certificate Preview</DialogTitle>
                    <DialogDescription>This is a preview of your certificate.</DialogDescription>
                  </DialogHeader>
                  <div className="p-8 flex items-center justify-center">
                    <DisplayThumbnail fileUrl={certificate.certificate} pageIndex={0} />
                  </div>
                  <DialogFooter>
                    <DialogClose>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="p-4 mt-4" dir="auto">
                <h2 className="text-xl font-bold mb-2">{certificate.title}</h2>
                <ReadMore text={certificate.description} amountOfWords={14} id={certificate.id.toString()} />
                <Separator className="my-2 bg-transparent border-transparent" />
                <p className="text-muted-foreground text-sm" dir="auto">Issued: {new Date(certificate.created_at).toDateString()}</p>
                {certificate.updated_at && <p className="text-muted-foreground text-sm" dir="auto">Updated: {new Date(certificate.updated_at).toDateString()}</p>}
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                <Button className="flex items-center gap-2" onClick={() => DownloadFile(certificate.certificate)}><DownloadIcon className="w-5 h-5" />
                  Download</Button>
                <CertificateButton selectedCourse={{ id: certificate.course_id, courseName: certificate.title, learnerName: name, learnerId: certificate.user_id }} variant="share" disabled={false} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
