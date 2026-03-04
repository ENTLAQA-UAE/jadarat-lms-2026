"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    label?: string;
  } | null;
  color?: "primary" | "sky" | "accent" | "golden" | "success";
  loading?: boolean;
  className?: string;
}

const colorMap = {
  primary: {
    iconBg: "bg-primary/[0.08] text-primary",
    iconBgHover: "group-hover:bg-primary/[0.12]",
    accentBorder: "from-primary via-primary/60",
  },
  sky: {
    iconBg: "bg-sky/[0.08] text-sky",
    iconBgHover: "group-hover:bg-sky/[0.12]",
    accentBorder: "from-sky via-sky/60",
  },
  accent: {
    iconBg: "bg-accent/[0.08] text-accent",
    iconBgHover: "group-hover:bg-accent/[0.12]",
    accentBorder: "from-accent via-accent/60",
  },
  golden: {
    iconBg: "bg-golden/[0.08] text-golden",
    iconBgHover: "group-hover:bg-golden/[0.12]",
    accentBorder: "from-golden via-golden/60",
  },
  success: {
    iconBg: "bg-success/[0.08] text-success",
    iconBgHover: "group-hover:bg-success/[0.12]",
    accentBorder: "from-success via-success/60",
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "primary",
  loading = false,
  className,
}: StatsCardProps) {
  if (loading) {
    return <StatsCardSkeleton />;
  }

  const colors = colorMap[color];
  const trendValue = trend?.value ?? 0;
  const isPositive = trendValue > 0;
  const isNegative = trendValue < 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden card-hover transition-all duration-150",
        className
      )}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r to-transparent opacity-80",
          colors.accentBorder
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150",
              colors.iconBg,
              colors.iconBgHover
            )}
          >
            {icon}
          </div>
        </div>

        {trend !== undefined && trend !== null && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                isPositive && "text-success",
                isNegative && "text-destructive",
                !isPositive && !isNegative && "text-muted-foreground"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {isPositive && "+"}
              {trendValue}% {trend.label || "from last month"}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton shimmer className="h-3 w-20" />
            <Skeleton shimmer className="h-8 w-16" />
          </div>
          <Skeleton shimmer className="h-10 w-10 rounded-xl" />
        </div>
        <div className="mt-3 pt-3 border-t border-border/30">
          <Skeleton shimmer className="h-3 w-28" />
        </div>
      </div>
    </Card>
  );
}

export { StatsCardSkeleton };
