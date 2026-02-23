"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, Linkedin, Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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

  const handleCertificate = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Check if certificate already exists
      const { data: userCertData } = await supabase
        .from("user_certificates")
        .select("certificate")
        .eq("course_id", selectedCourse.id)
        .eq("user_id", selectedCourse.learnerId)
        .single();

      if (userCertData?.certificate) {
        handleResult(userCertData.certificate);
        return;
      }

      // Generate via internal API (replaces Placid)
      const response = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          studentId: selectedCourse.learnerId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Certificate generation failed");
      }

      handleResult(result.url);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResult = (url: string) => {
    if (variant === "download") {
      DownloadFile(url);
    } else {
      window.open(
        `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${
          encodeURIComponent(selectedCourse?.courseName || "")
        }&organizationId=103915279&issueYear=${new Date().getFullYear()}&issueMonth=${
          new Date().getMonth() + 1
        }&certUrl=${encodeURIComponent(url)}&certId=${selectedCourse?.id}`,
        "_blank"
      );
    }
  };

  return (
    <Button
      className={cn(
        `w-full px-4 py-2 text-base flex justify-center items-center gap-2
        ${variant === "share" ? "bg-[#0072b1] hover:bg-[#005a8f] text-primary-foreground" : ""}
        sm:px-3 sm:text-sm md:px-2 md:text-xs`,
        className
      )}
      onClick={handleCertificate}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : variant === "download" ? (
        <>
          <span><DownloadIcon size={16} /></span>
          <span className="hidden md:block">Download</span>
        </>
      ) : (
        <>
          <span><Linkedin size={16} /></span>
          <span className="hidden md:block">Share on LinkedIn</span>
        </>
      )}
    </Button>
  );
};

export default memo(CertificateButton);
