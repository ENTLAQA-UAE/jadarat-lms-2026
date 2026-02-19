import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
 const { searchParams } = new URL(req.url);
 const courseSlug = searchParams.get("courseSlug");

 if (!courseSlug) {
  return NextResponse.json({ error: "courseSlug is required" }, { status: 400 });
 }

 const supabase = await createClient();
 const { data: courseData, error: courseError } = await supabase.rpc("get_course_user_details", { slug_input: courseSlug });

 if (courseError) {
  return NextResponse.json({ error: courseError.message }, { status: 500 });
 }

 const launchFileName = courseData?.[0]?.scorm_urls?.find(
   (url: any) => url.path === "scormdriver/indexAPI.html"
 )?.path;

 if (!launchFileName) {
  return NextResponse.json({ error: "Launch file not found" }, { status: 404 });
 }

 // Generate the URL pointing to your server
 const launchUrl = `${req.nextUrl.origin}/api/scorm/content/${courseSlug}/${launchFileName}`;

 return NextResponse.json({ data: launchUrl });
};
