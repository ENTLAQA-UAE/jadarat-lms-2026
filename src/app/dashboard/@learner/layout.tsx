export const revalidate = 0
export const dynamic = 'force-dynamic'
import { ReactNode } from "react";
import LearnerHOC from "@/hoc/learner.hoc";
import { getUserCourses } from "@/action/leaner/getUserCourse";
import { AIChatDrawer } from "@/components/ai/AIChatDrawer";
import { createClient } from "@/utils/supabase/server";

export default async function LearnerLayout({ children }: { children: ReactNode }) {
  const courses = await getUserCourses()

  // Check if AI chat is enabled for this org
  const supabase = await createClient()
  const { data: aiConfigs } = await supabase.rpc('get_org_ai_config')
  const aiConfig = Array.isArray(aiConfigs) ? aiConfigs?.[0] : aiConfigs
  const chatEnabled = aiConfig?.chat_enabled ?? false

  // Get user language
  const { data: userData } = await supabase.rpc('get_user_details')
  const userLang = (Array.isArray(userData) ? userData?.[0]?.lang : userData?.lang) ?? 'en'

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <LearnerHOC courses={courses} />
        <main className="flex-1">{children}</main>
      </div>
      <AIChatDrawer enabled={chatEnabled} lang={userLang} />
    </>
  );
}