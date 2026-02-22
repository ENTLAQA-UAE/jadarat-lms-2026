"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, CheckCircle2, Trophy } from "lucide-react";
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
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Clock,
      value: `${Math.max(1, Math.round((completedCount * 4 + inProgressCount * 2)))}h`,
      label: isRTL ? "ساعات التعلم" : "Learning Hours",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: CheckCircle2,
      value: completedCount,
      label: isRTL ? "دورات مكتملة" : "Completed",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Trophy,
      value: "#5",
      label: isRTL ? "الترتيب" : "Leaderboard",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="group relative overflow-hidden border border-border/50 shadow-sm transition-shadow duration-300 hover:shadow-md"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
