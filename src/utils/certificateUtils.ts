import { DownloadFile } from "@/utils/downloadFile";
import { createClient } from "./supabase/client";
import { toast } from "sonner";

export const generateCertificate = async (
  share: boolean,
  selectedCourse: any,
  certificate: any,
  name: string,
  orgName: string,
  setGeneratingCertificate: (value: boolean) => void,
  setSharingCertificate: (value: boolean) => void,
  _toast?: any
) => {
  try {
    if (share) setSharingCertificate(true);
    else setGeneratingCertificate(true);

    const supabase = createClient();

    // 1. Check if certificate already exists
    const { data: existingData } = await supabase
      .from("user_certificates")
      .select("certificate")
      .eq("course_id", selectedCourse.id)
      .single();

    const existingURL = existingData?.certificate;
    if (existingURL) {
      if (share) {
        openLinkedInShare(selectedCourse, existingURL);
      } else {
        DownloadFile(existingURL);
      }
      setGeneratingCertificate(false);
      setSharingCertificate(false);
      return;
    }

    // 2. Generate via internal API (uses @react-pdf/renderer)
    if (selectedCourse?.id) {
      const response = await fetch('/api/certificate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse.id }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Certificate generation failed');
      }

      if (share) {
        openLinkedInShare(selectedCourse, result.url);
      } else {
        DownloadFile(result.url);
      }
    }
  } catch (error) {
    console.error("Error generating certificate:", error);
    toast.error("Error", {
      description: "Failed to generate the certificate.",
    });
  } finally {
    setGeneratingCertificate(false);
    setSharingCertificate(false);
  }
};

function openLinkedInShare(course: any, certUrl: string) {
  window.open(
    `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${
      encodeURIComponent(course?.name || '')
    }&organizationId=103915279&issueYear=${new Date().getFullYear()}&issueMonth=${
      new Date().getMonth() + 1
    }&certUrl=${encodeURIComponent(certUrl)}&certId=${course.id}`,
    "_blank"
  );
}
