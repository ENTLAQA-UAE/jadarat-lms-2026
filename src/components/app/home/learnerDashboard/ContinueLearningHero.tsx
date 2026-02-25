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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-primary-800 to-primary-700 shadow-lg">
      {/* Background thumbnail */}
      {course.thumbnail && (
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover opacity-15 blur-sm"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-primary-700/70" />
        </div>
      )}

      {/* Decorative accents */}
      <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-primary-400/10 blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
        {/* Thumbnail preview */}
        <div className="hidden shrink-0 md:block">
          <div className="h-[120px] w-[180px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
            <Image
              src={course.thumbnail || ""}
              alt={course.name || ""}
              width={180}
              height={120}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-golden" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
              {isRTL ? "أكمل التعلم" : "Continue Learning"}
            </p>
          </div>
          <h2 className="mb-1.5 text-lg font-bold text-white md:text-xl line-clamp-1 exclude-weglot" dir="auto">
            {course.name}
          </h2>
          <p className="mb-4 text-xs text-white/50 exclude-weglot">
            {isRTL ? course.category_ar_name : course.category_name}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress
              value={course.percentage ?? 0}
              className="h-2 flex-1 bg-white/10"
              progressClassName="bg-gradient-to-r from-primary to-sky"
            />
            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
              {course.percentage ?? 0}%
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Link href={`/dashboard/course/play/${course.slug}`}>
            <Button
              size="lg"
              className="w-full gap-2 gradient-cta text-white hover:opacity-90 shadow-lg md:w-auto font-semibold"
            >
              <Play className="h-4 w-4" />
              {isRTL ? "استئناف التعلم" : "Resume"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
