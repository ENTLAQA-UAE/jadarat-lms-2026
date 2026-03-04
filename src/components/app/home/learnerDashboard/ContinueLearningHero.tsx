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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(240,22%,6%)]">
      {/* Background thumbnail */}
      {course.thumbnail && (
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover opacity-[0.07] blur-md"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,22%,6%)]/95 via-[hsl(240,22%,6%)]/85 to-transparent" />
        </div>
      )}

      {/* Ambient glow orbs */}
      <div className="absolute -top-32 -end-32 h-64 w-64 rounded-full bg-[hsl(245_82%_63%/0.08)] blur-[80px]" />
      <div className="absolute -bottom-20 -start-20 h-48 w-48 rounded-full bg-[hsl(280_80%_60%/0.06)] blur-[60px]" />

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:p-6">
        {/* Thumbnail preview */}
        <div className="hidden shrink-0 md:block">
          <div className="h-[100px] w-[160px] overflow-hidden rounded-xl ring-1 ring-white/[0.08] shadow-elevation-2">
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
            <Sparkles className="h-3 w-3 text-[hsl(245,88%,73%)]" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
              {isRTL ? "أكمل التعلم" : "Continue Learning"}
            </p>
          </div>
          <h2 className="mb-1 text-base font-semibold text-white/95 md:text-lg line-clamp-1 exclude-weglot tracking-tight" dir="auto">
            {course.name}
          </h2>
          <p className="mb-3 text-xs text-white/35 exclude-weglot">
            {isRTL ? course.category_ar_name : course.category_name}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2.5">
            <Progress
              value={course.percentage ?? 0}
              className="h-1.5 flex-1 bg-white/[0.06]"
              progressClassName="bg-gradient-to-r from-[hsl(245,82%,63%)] via-[hsl(280,80%,60%)] to-[hsl(330,80%,58%)]"
            />
            <span className="shrink-0 text-xs font-medium text-white/50 tabular-nums">
              {course.percentage ?? 0}%
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Link href={`/dashboard/course/play/${course.slug}`}>
            <Button
              size="default"
              className="w-full gap-2 bg-white text-[hsl(240,22%,6%)] hover:bg-white/90 md:w-auto font-medium shadow-md shadow-white/10"
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
