'use client';

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CertificatesCardPageType } from "./type";
import DisplayThumbnail from "@/components/pdfThumbnail";
import { ReadMore } from "@/components/readmore";
import { Separator } from "@/components/ui/separator";
import NoCertificatesFound from "./components/NoCertificatesFound";
import { DownloadIcon, Share2, CheckCircle2, Clock, XCircle, Copy } from "lucide-react";
import CertificateButton from "@/components/shared/CertificateButton";
import { useAppSelector } from "@/hooks/redux.hook";
import { DownloadFile } from "@/utils/downloadFile";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function StatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'expired':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1">
          <Clock className="h-3 w-3" />
          Expired
        </Badge>
      )
    case 'revoked':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] gap-1">
          <XCircle className="h-3 w-3" />
          Revoked
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Valid
        </Badge>
      )
  }
}

function ShareDropdown({ certificate }: { certificate: CertificatesCardPageType }) {
  const verifyUrl = certificate.uuid
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificate.uuid}`
    : '';

  const shareText = `I earned a certificate for completing "${certificate.title}"!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    toast.success('Verification link copied!');
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}`,
      '_blank'
    );
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${verifyUrl}`)}`,
      '_blank'
    );
  };

  const handleShareEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(`Certificate: ${certificate.title}`)}&body=${encodeURIComponent(`${shareText}\n\nVerify: ${verifyUrl}`)}`,
      '_blank'
    );
  };

  if (!certificate.uuid) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Verification Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          Share on X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareWhatsApp}>
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareEmail}>
          Share via Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CertificatesCardPage({ userCertificates }: { userCertificates: CertificatesCardPageType[] }) {

  const { user: { name } } = useAppSelector(state => state.user);

  if (userCertificates.length === 0) {
    return <NoCertificatesFound />
  }

  return (
    <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 gap-8">

        {userCertificates.map((certificate) => {
          return (
            <div key={certificate.id} className="bg-card cursor-pointer rounded-lg shadow-md overflow-hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative h-48 bg-cover bg-center overflow-hidden">
                    <DisplayThumbnail fileUrl={certificate.certificate} pageIndex={1} width={400} />
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={certificate.status} />
                    </div>
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
                <h2 className="text-xl font-semibold mb-2">{certificate.title}</h2>
                <ReadMore text={certificate.description} amountOfWords={14} id={certificate.id.toString()} />
                <Separator className="my-2 bg-transparent border-transparent" />
                <p className="text-muted-foreground text-sm" dir="auto">Issued: {new Date(certificate.created_at).toDateString()}</p>
                {certificate.expires_at && (
                  <p className="text-muted-foreground text-sm" dir="auto">
                    Expires: {new Date(certificate.expires_at).toDateString()}
                  </p>
                )}
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                <Button className="flex items-center gap-2" onClick={() => DownloadFile(certificate.certificate)}>
                  <DownloadIcon className="w-5 h-5" />
                  Download
                </Button>
                <CertificateButton
                  selectedCourse={{ id: certificate.course_id, courseName: certificate.title, learnerName: name, learnerId: certificate.user_id }}
                  variant="share"
                  disabled={false}
                />
                <ShareDropdown certificate={certificate} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
