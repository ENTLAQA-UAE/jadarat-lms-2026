// Code
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { useAppSelector } from "@/hooks/redux.hook";
import { LanguageSwitcherDropdown } from "@/components/ui/LanauageSwitcherDropdown";
import DisplayThumbnail from "@/components/pdfThumbnail";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { CertificatesCardPageType } from "../dashboard/@learner/certificates/type";
import { Skeleton } from "@/components/ui/skeleton";

export default function CertificatesQr() {
  // const { settings: { logo, organization_id } } = useAppSelector((state) => state.organization)
  const [userInfo, setUserInfo] = useState<{
    user_id: string;
    course_id: string;
  } | null>(null);
  const [certificate, setCertificate] =
    useState<CertificatesCardPageType | null>(null);
  const [user, setUser] = useState<{
    name: string;
    organization_id: number;
  } | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<{
    name: string;
    logo: string;
    certificate_auth_title: string;
  } | null>(null);
  const searchParams = useSearchParams();

  const studentName = decodeURI(searchParams.get("s") || "N/A");
  const courseName = decodeURI(searchParams.get("c") || "N/A");

  const supabase = createClient();

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: userData, error } = await supabase.rpc("get_user_id", {
        user_name: studentName,
        course_title: courseName,
      });
      if (!error) {
        setUserInfo(userData);
      }
    };
    getUserInfo();
  }, [studentName, courseName]);

  useEffect(() => {
    if (userInfo?.user_id && userInfo?.course_id) {
      const getCertificate = async () => {
        const { data: certData, error } = await supabase
          .from("user_certificates")
          .select("*")
          .eq("user_id", userInfo.user_id)
          .eq("course_id", userInfo.course_id)
          .single();
        if (!error) {
          setCertificate(certData);
        }
      };
      getCertificate();
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo?.user_id) {
      const getUserData = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("name, organization_id")
          .eq("id", userInfo.user_id)
          .single();
        if (!error) {
          setUser(data);
        }
      };
      getUserData();
    }
  }, [userInfo]);

  useEffect(() => {
    if (certificate?.course_id) {
      const getUsersCourse = async () => {
        const { data, error } = await supabase
          .from("courses")
          .select("title")
          .eq("id", certificate.course_id)
          .single();
        if (!error) {
          setCourseTitle(data.title);
        }
      };
      getUsersCourse();
    }
  }, [certificate]);

  useEffect(() => {
    if (user?.organization_id) {
      const getOrgName = async () => {
        const { data, error } = await supabase
          .from("organization_settings")
          .select("name, logo, certificate_auth_title")
          .eq("organization_id", user.organization_id)
          .single();
        if (!error) {
          setOrgData(data);
        }
      };
      getOrgName();
    }
  }, [user]); // Triggered only when user has organization_id

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

  if (!certificate && !user && courseTitle) {
    throw new Error("");
  }
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex justify-between items-center">
        {orgData?.logo ? (
          <Image
            src={orgData?.logo || ""}
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
            {certificate && (
              <DisplayThumbnail
                fileUrl={certificate?.certificate}
                pageIndex={1}
                width={310}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Issued By:</p>
            <p className="exclude-weglot">{orgData?.name}</p>
          </div>
          <div>
            <p className="font-semibold">Issued To:</p>
            <p className="exclude-weglot">{user?.name}</p>
          </div>
          <div>
            <p className="font-semibold">Issuance Date:</p>
            <p>
              {new Date(certificate?.created_at || "").toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-semibold">Course Name:</p>
            <p className="exclude-weglot">{courseTitle}</p>
          </div>
          <div>
            <p className="font-semibold">Signed By:</p>
            <p className="exclude-weglot">{orgData?.certificate_auth_title}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          This is to validate the authenticity of Certificate No.{" "}
          {certificate?.id}
        </p>
      </CardFooter>
    </Card>
  );
}
