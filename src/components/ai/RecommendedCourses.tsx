"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  BookOpen,
  BarChart3,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface Recommendation {
  course_id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  category_name: string | null;
  level: string;
  score: number;
  reason: string;
  algorithm: string;
}

interface RecommendedCoursesProps {
  lang?: string;
  maxVisible?: number;
  onCourseClick?: (courseId: number) => void;
}

export function RecommendedCourses({
  lang = "en",
  maxVisible = 4,
  onCourseClick,
}: RecommendedCoursesProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const isRTL = lang === "ar";

  const fetchRecommendations = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      const response = await fetch(
        refresh ? "/api/recommendations" : "/api/recommendations",
        { method: refresh ? "POST" : "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setEnabled(data.enabled !== false);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (!enabled || (!isLoading && recommendations.length === 0)) {
    return null;
  }

  const levelColors: Record<string, string> = {
    beginner: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {isRTL ? "موصى لك" : "Recommended For You"}
          </h2>
          <span className="rounded-full bg-primary/5 px-2 py-0.5 text-tiny font-medium text-primary">
            AI
          </span>
        </div>
        <button
          onClick={() => fetchRecommendations(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
          />
          {isRTL ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: maxVisible }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-muted"
            >
              <div className="aspect-video bg-muted" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted/50" />
                <div className="h-3 w-1/2 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recommendations.slice(0, maxVisible).map((rec) => (
            <div
              key={rec.course_id}
              onClick={() => onCourseClick?.(rec.course_id)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {rec.thumbnail ? (
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {/* Match score */}
                <div className="absolute bottom-2 rounded-full bg-primary/90 px-2 py-0.5 text-tiny font-medium text-primary-foreground" style={{ [isRTL ? "right" : "left"]: "0.5rem" }}>
                  {Math.round(rec.score * 100)}%{" "}
                  {isRTL ? "تطابق" : "match"}
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                  {rec.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {rec.description}
                </p>

                {/* Reason */}
                <p className="mt-2 flex items-start gap-1 text-tiny text-primary">
                  <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                  <span className="line-clamp-1">{rec.reason}</span>
                </p>

                {/* Meta */}
                <div className="mt-2 flex items-center gap-2">
                  {rec.category_name && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-tiny font-medium text-muted-foreground">
                      {rec.category_name}
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-tiny font-medium",
                      levelColors[rec.level] || "bg-muted text-muted-foreground"
                    )}
                  >
                    <BarChart3 className="mr-0.5 inline h-2.5 w-2.5" />
                    {rec.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Link */}
      {recommendations.length > maxVisible && (
        <div className="mt-3 flex justify-end">
          <button className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80">
            {isRTL ? "عرض الكل" : "View all"}
            {isRTL ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
