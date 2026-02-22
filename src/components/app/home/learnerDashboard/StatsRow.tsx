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
      borderColor: "from-warning/50 to-warning/10",
    },
    {
      icon: Clock,
      value: `${Math.max(1, Math.round((completedCount * 4 + inProgressCount * 2)))}h`,
      label: isRTL ? "ساعات التعلم" : "Learning Hours",
      color: "text-info",
      bgColor: "bg-info/10",
      borderColor: "from-info/50 to-info/10",
    },
    {
      icon: CheckCircle2,
      value: completedCount,
      label: isRTL ? "دورات مكتملة" : "Completed",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "from-success/50 to-success/10",
    },
    {
      icon: BarChart3,
      value: "#5",
      label: isRTL ? "الترتيب" : "Leaderboard",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "from-accent/50 to-accent/10",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="group relative overflow-hidden border-0 shadow-sm card-hover">
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.borderColor}`} />

          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
