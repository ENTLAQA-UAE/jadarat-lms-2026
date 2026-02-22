"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, CheckCircle2, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/language.context";

interface StatsRowProps {
  completedCount: number;
  inProgressCount: number;
}

export default function StatsRow({ completedCount, inProgressCount }: StatsRowProps) {
  const { isRTL } = useLanguage();

  const stats = [
    {
      icon: Flame,
      value: 7,
      label: isRTL ? "أيام متتالية" : "Day Streak",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Clock,
      value: `${Math.max(1, Math.round((completedCount * 4 + inProgressCount * 2)))}h`,
      label: isRTL ? "ساعات التعلم" : "Learning Hours",
      color: "text-primary",
      bgColor: "bg-info/10",
    },
    {
      icon: CheckCircle2,
      value: completedCount,
      label: isRTL ? "دورات مكتملة" : "Completed",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: BarChart3,
      value: "#5",
      label: isRTL ? "الترتيب" : "Leaderboard",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
