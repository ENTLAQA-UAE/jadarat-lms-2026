export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase";
import PdfPreviewer from "./PdfPreviewer";

export default async function Page({
  searchParams,
}: {
  searchParams: { s?: string; c?: string; u?: string };
}) {
  const supabase = createClient();
  const studentName = decodeURI(searchParams.s || "N/A");
  const courseName = decodeURI(searchParams.c || "N/A");
  let { data: user_certificate, error } = await supabase.rpc(
    "get_user_certificate",
    {
      user_name: studentName,
      course_title: courseName,
    }
  );
  return <PdfPreviewer pdfLink={user_certificate} />;
}
