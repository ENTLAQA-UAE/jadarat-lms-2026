"use client";

import { CoursesType } from "@/app/home/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/language.context";

interface ContinueLearningHeroProps {
  course: CoursesType;
}

export default function ContinueLearningHero({ course }: ContinueLearningHeroProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-[hsl(225,25%,12%)] via-[hsl(224,30%,16%)] to-[hsl(217,40%,22%)]">
      {/* Background thumbnail */}
      {course.thumbnail && (
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover opacity-10 blur-md"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(225,25%,12%)]/90 via-[hsl(224,30%,16%)]/80 to-transparent" />
        </div>
      )}

      {/* Subtle accent glow */}
      <div className="absolute -top-32 -end-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:p-6">
        {/* Thumbnail preview */}
        <div className="hidden shrink-0 md:block">
          <div className="h-[100px] w-[160px] overflow-hidden rounded-lg ring-1 ring-white/[0.08]">
            <Image
              src={course.thumbnail || ""}
              alt={course.name || ""}
              width={160}
              height={100}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary-400" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              {isRTL ? "أكمل التعلم" : "Continue Learning"}
            </p>
          </div>
          <h2 className="mb-1 text-base font-semibold text-white/95 md:text-lg line-clamp-1 exclude-weglot tracking-tight" dir="auto">
            {course.name}
          </h2>
          <p className="mb-3 text-xs text-white/40 exclude-weglot">
            {isRTL ? course.category_ar_name : course.category_name}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2.5">
            <Progress
              value={course.percentage ?? 0}
              className="h-1.5 flex-1 bg-white/[0.08]"
              progressClassName="bg-gradient-to-r from-primary-400 to-primary-300"
            />
            <span className="shrink-0 text-xs font-medium text-white/60 tabular-nums">
              {course.percentage ?? 0}%
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Link href={`/dashboard/course/play/${course.slug}`}>
            <Button
              size="default"
              className="w-full gap-2 bg-white text-[hsl(225,25%,12%)] hover:bg-white/90 md:w-auto font-medium shadow-sm"
            >
              <Play className="h-3.5 w-3.5" />
              {isRTL ? "استئناف التعلم" : "Resume"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
