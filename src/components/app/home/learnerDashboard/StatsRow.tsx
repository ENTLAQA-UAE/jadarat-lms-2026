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
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Clock,
      value: `${Math.max(1, Math.round((completedCount * 4 + inProgressCount * 2)))}h`,
      label: isRTL ? "ساعات التعلم" : "Learning Hours",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckCircle2,
      value: completedCount,
      label: isRTL ? "دورات مكتملة" : "Completed",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Trophy,
      value: "#5",
      label: isRTL ? "الترتيب" : "Leaderboard",
      color: "text-golden",
      bgColor: "bg-golden/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="group overflow-hidden transition-all duration-200 hover:shadow-soft"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bgColor} transition-transform duration-200 group-hover:scale-105`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-tight tracking-tight tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
