"use client";

import { AISearchResults } from "@/components/ai/AISearchResults";
import { useRouter } from "next/navigation";

interface AISearchPageProps {
  lang?: string;
}

export default function AISearchPage({ lang = "en" }: AISearchPageProps) {
  const router = useRouter();
  const isRTL = lang === "ar";

  const handleCourseClick = (courseId: number) => {
    router.push(`/dashboard/discover?course=${courseId}`);
  };

  return (
    <div className="min-h-screen bg-muted/50 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {isRTL ? "بحث الدورات" : "Course Search"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRTL
              ? "ابحث باستخدام الذكاء الاصطناعي عبر جميع الدورات المتاحة"
              : "Search with AI across all available courses"}
          </p>
        </div>
        <AISearchResults lang={lang} onCourseClick={handleCourseClick} />
      </div>
    </div>
  );
}
