"use client";

import { CoursesType } from "@/app/home/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/language.context";

interface ContinueLearningHeroProps {
  course: CoursesType;
}

export default function ContinueLearningHero({ course }: ContinueLearningHeroProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800">
      {/* Background thumbnail */}
      {course.thumbnail && (
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
        {/* Thumbnail preview */}
        <div className="hidden shrink-0 md:block">
          <div className="h-28 w-44 overflow-hidden rounded-lg shadow-lg">
            <Image
              src={course.thumbnail || ""}
              alt={course.name || ""}
              width={176}
              height={112}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-300">
            {isRTL ? "أكمل التعلم" : "Continue Learning"}
          </p>
          <h2 className="mb-2 text-lg font-bold text-white md:text-xl line-clamp-1 exclude-weglot" dir="auto">
            {course.name}
          </h2>
          <p className="mb-3 text-sm text-slate-300 exclude-weglot">
            {isRTL ? course.category_ar_name : course.category_name}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress
              value={course.percentage ?? 0}
              className="h-2 flex-1 bg-slate-700"
              progressClassName="bg-blue-500"
            />
            <span className="shrink-0 text-sm font-semibold text-white">
              {course.percentage ?? 0}%
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Link href={`/dashboard/course/play/${course.slug}`}>
            <Button
              size="lg"
              className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700 md:w-auto"
            >
              <Play className="h-4 w-4" />
              {isRTL ? "استئناف التعلم" : "Resume Learning"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
