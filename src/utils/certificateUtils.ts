import { generatePdf, getPDFURL } from "@/lib/controllers/certificate";
import { DownloadFile } from "@/utils/downloadFile";
import { createClient } from "./supabase/client";

export const getCertificateURL = async (
  id: number,
  share: boolean,
  selectedCourse: any,
  setGeneratingCertificate: (value: boolean) => void,
  setSharingCertificate: (value: boolean) => void
) => {
  const supabase = createClient();
  const data = await getPDFURL(id);

  if (data.status === "error") {
    setGeneratingCertificate(false);
    setSharingCertificate(false);
    return;
  }

  if (data.transfer_url) {
    if (share) {
      window.open(
        `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${
          selectedCourse?.name
        }&organizationId=103915279&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth()}&expirationYear=2030&expirationMonth=5&certUrl=${
          data.transfer_url
        }&certId=${data.id}`,
        "_blank"
      );
    } else {
      DownloadFile(data.transfer_url);
    }

    await supabase.rpc("insert_user_certificate", {
      certificate_url: data.transfer_url,
      course: selectedCourse?.id,
    });

    setGeneratingCertificate(false);
    setSharingCertificate(false);
  } else {
    setTimeout(async () => {
      await getCertificateURL(
        id,
        share,
        selectedCourse,
        setGeneratingCertificate,
        setSharingCertificate
      );
    }, 2000);
  }
};

export const generateCertificate = async (
  share: boolean,
  selectedCourse: any,
  certificate: any,
  name: string,
  orgName: string,
  setGeneratingCertificate: (value: boolean) => void,
  setSharingCertificate: (value: boolean) => void,
  toast: any
) => {
  try {
    if (share) setSharingCertificate(true);
    else setGeneratingCertificate(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_certificates")
      .select("certificate")
      .eq("course_id", selectedCourse.id)
      .single();
    const existingURL = data?.certificate;
    if (existingURL) {
      console.log("Certificate URL already exists:", existingURL);
      // If the URL exists, directly download or share the certificate
      console.log(share);
      if (share) {
        window.open(
          `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${
            selectedCourse?.name
          }&organizationId=103915279&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth()}&expirationYear=2030&expirationMonth=5&certUrl=${existingURL}&certId=${selectedCourse.id}`,
          "_blank"
        );
      } else {
        DownloadFile(existingURL);
      }
      setGeneratingCertificate(false);
      setSharingCertificate(false);
      return;
    }
    if (selectedCourse?.id) {
      const { data } = await supabase.rpc("get_certificates");
      const placid = data.find(
        (e: any) => e.id === certificate?.certificateTemplate
      )?.placid;

      if (placid) {
        const response = await generatePdf({
          color: certificate?.certificateBGColor ?? "#ffffff",
          courseName: selectedCourse?.name,
          logo: certificate?.certificateLogo ?? "https://default.logo.url",
          sign: certificate?.certificateSign ?? "",
          studentName: name,
          title: certificate?.certificateAuthTitle ?? orgName,
          uuid: placid,
        });

        if (response.data.id) {
          await getCertificateURL(
            response.data.id,
            share,
            selectedCourse,
            setGeneratingCertificate,
            setSharingCertificate
          );
        } else {
          throw new Error(response.statusText);
        }
      } else {
        throw new Error("Certificate template not found.");
      }
    }
  } catch (error) {
    console.error("Error generating certificate:", error);
    toast({
      title: "Error",
      description: "Failed to generate the certificate.",
      variant: "destructive",
    });
  } finally {
    setGeneratingCertificate(false);
    setSharingCertificate(false);
  }
};
