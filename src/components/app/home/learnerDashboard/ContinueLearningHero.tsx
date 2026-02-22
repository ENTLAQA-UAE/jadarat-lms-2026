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
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 to-primary-800 shadow-xl">
      {/* Background thumbnail */}
      {course.thumbnail && (
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/70 to-primary-800/50" />
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-gradient-to-bl from-accent/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 start-0 w-48 h-48 bg-gradient-to-tr from-primary/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
        {/* Thumbnail preview */}
        <div className="hidden shrink-0 md:block">
          <div className="h-32 w-48 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
            <Image
              src={course.thumbnail || ""}
              alt={course.name || ""}
              width={192}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-warning" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
              {isRTL ? "أكمل التعلم" : "Continue Learning"}
            </p>
          </div>
          <h2 className="mb-2 text-xl font-bold text-primary-foreground md:text-2xl line-clamp-1 exclude-weglot" dir="auto">
            {course.name}
          </h2>
          <p className="mb-4 text-sm text-primary-foreground/60 exclude-weglot">
            {isRTL ? course.category_ar_name : course.category_name}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress
              value={course.percentage ?? 0}
              className="h-2.5 flex-1 bg-primary-foreground/15"
              progressClassName="bg-gradient-to-r from-primary-foreground/90 to-primary-foreground/70"
            />
            <span className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold text-primary-foreground">
              {course.percentage ?? 0}%
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Link href={`/dashboard/course/play/${course.slug}`}>
            <Button
              size="lg"
              className="w-full gap-2 bg-primary-foreground text-primary-900 hover:bg-primary-foreground/90 shadow-lg md:w-auto font-semibold"
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
