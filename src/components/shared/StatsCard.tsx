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
    iconBg: "bg-primary/10 text-primary",
    iconBgHover: "group-hover:bg-primary/15",
    accentBorder: "from-primary",
  },
  sky: {
    iconBg: "bg-sky/10 text-sky",
    iconBgHover: "group-hover:bg-sky/15",
    accentBorder: "from-sky",
  },
  accent: {
    iconBg: "bg-accent/10 text-accent",
    iconBgHover: "group-hover:bg-accent/15",
    accentBorder: "from-accent",
  },
  golden: {
    iconBg: "bg-golden/10 text-golden",
    iconBgHover: "group-hover:bg-golden/15",
    accentBorder: "from-golden",
  },
  success: {
    iconBg: "bg-success/10 text-success",
    iconBgHover: "group-hover:bg-success/15",
    accentBorder: "from-success",
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
        "group relative overflow-hidden card-hover",
        className
      )}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r to-transparent",
          colors.accentBorder
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300",
              colors.iconBg,
              colors.iconBgHover
            )}
          >
            {icon}
          </div>
        </div>

        {trend !== undefined && trend !== null && (
          <div className="mt-3">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive && "bg-success/10 text-success",
                isNegative && "bg-destructive/10 text-destructive",
                !isPositive && !isNegative && "bg-muted text-muted-foreground"
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
            <Skeleton shimmer className="h-4 w-24" />
            <Skeleton shimmer className="h-8 w-16" />
          </div>
          <Skeleton shimmer className="h-10 w-10 rounded-xl" />
        </div>
        <div className="mt-3">
          <Skeleton shimmer className="h-5 w-32 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export { StatsCardSkeleton };
