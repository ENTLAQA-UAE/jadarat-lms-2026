"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, Linkedin, Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generatePdf, getPDFURL } from "@/lib/controllers/certificate";
import { DownloadFile } from "@/utils/downloadFile";
import { createClient } from "@/utils/supabase";
import { useAppSelector } from "@/hooks/redux.hook";
import { cn } from "@/lib/utils";

interface CertificateButtonProps {
  selectedCourse: {
    id: number;
    learnerId: string;
    courseName?: string;
    learnerName?: string;
  };
  variant: "download" | "share";
  disabled: boolean;
  className?: string;
}

const CertificateButton: React.FC<CertificateButtonProps> = ({
  selectedCourse,
  variant,
  disabled,
  className,
}) => {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const { settings: { certificate } } = useAppSelector(state => state.organization);
  const { user: { name , role } } = useAppSelector((state) => state.user);

  const [learnerName, setLearnerName] = useState<string>(selectedCourse.learnerName ?? name ?? "");

  const [generateCertificate, setGenerateCertificate] = useState(false);
  

  const handleCertificate = async () => {
    setIsLoading(true);
    setGenerateCertificate(true);
    try {
      const supabase = await createClient();

      // Check if certificate already exists in user_certificates
      const { data: userCertData } = await supabase.from('user_certificates').select('certificate')
        .eq('course_id', selectedCourse.id)
        .eq('user_id', selectedCourse.learnerId)
        .single();

      if (userCertData) {
        await handleCertificateDownloadOrOpen(userCertData.certificate);
      } else {
        // Fetch certificate template
        const { data: globalCertData } = await supabase.from('global_certificates').select('placid')
          .eq('id', certificate?.certificateTemplate)
          .single();

        if (globalCertData) {
          const response = await generatePdf({
            uuid: globalCertData.placid,
            logo: certificate?.certificateLogo ?? "",
            title: certificate?.certificateAuthTitle ?? "",
            sign: certificate?.certificateSign ?? "",
            color: certificate?.certificateBGColor ?? "",
            studentName: learnerName,
            courseName: selectedCourse.courseName ?? "",
            studentId: selectedCourse.learnerId ?? "",
            courseId: selectedCourse.id
          });

          if (response.data.id) {
            await pollForPDFURL(response.data.id, supabase);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGenerateCertificate(false);
    }
  };

  const handleCertificateDownloadOrOpen = async (url: string) => {
    if (variant === "download") {
      DownloadFile(url);
    } else {
      window.open(
        `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${selectedCourse?.courseName
        }&organizationId=103915279&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth()}&expirationYear=2030&expirationMonth=5&certUrl=${url}&certId=${selectedCourse?.id}`,
        "_blank"
      );
    }
  };

  const pollForPDFURL = async (pdfId: string, supabase: any) => {
    const intervalPoll = async () => {
      const data = await getPDFURL(Number(pdfId));

      if (data.status === "error") {
        toast({
          title: "Error",
          description: "Failed to generate certificate",
          variant: "destructive",
        });
        return false;
      }

      if (data.transfer_url) {
        await handleCertificateDownloadOrOpen(data.transfer_url);

        if (role === "learner") {
          await supabase.from('user_certificates').insert({
            certificate: data.transfer_url,
            course_id: selectedCourse.id,
            user_id: selectedCourse.learnerId,
          });
        }
        return true;
      }
      return false;
    };

    while (!(await intervalPoll())) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };


  return (
    <Button
      className={cn(`w-full px-4 py-2 text-base flex justify-center items-center gap-2
    ${variant === "share" ? "bg-[#0072b1] hover:bg-[#005a8f] text-primary-foreground" : ""}
    sm:px-3 sm:text-sm  // Smaller padding and font size for small screens
    md:px-2 md:text-xs  // Even smaller for medium screens or reduced width
  `, className)}
      onClick={handleCertificate}
      disabled={isLoading || disabled || generateCertificate}
    >
      {isLoading || generateCertificate ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : variant === "download" ? (
        <>
          <span>
            <DownloadIcon size={16} />
          </span>
          <span className="hidden md:block">Download</span>
        </>
      ) : (
        <>
          <span>
            <Linkedin size={16} />
          </span>
          <span className="hidden md:block">Share on LinkedIn</span>
        </>
      )}
    </Button>

  );
};

export default memo(CertificateButton);
