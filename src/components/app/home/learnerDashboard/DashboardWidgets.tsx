"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language.context";
import {
  ChallengeCard,
  type ChallengeData,
} from "@/components/gamification/GamificationComponents";
import {
  LeaderboardRow,
  type LeaderboardEntry,
} from "@/components/gamification/LeaderboardComponents";

const MOCK_CHALLENGES: ChallengeData[] = [
  {
    id: "ch-1",
    title: "Complete 3 Courses",
    description: "Finish any 3 courses this month",
    type: "courses_completed",
    goal: 3,
    progress: 1,
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    xpReward: 300,
    isCompleted: false,
  },
  {
    id: "ch-2",
    title: "7-Day Streak",
    description: "Log in and learn for 7 consecutive days",
    type: "login_streak",
    goal: 7,
    progress: 5,
    startDate: "2026-02-15",
    endDate: "2026-03-15",
    xpReward: 150,
    isCompleted: false,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", displayName: "Sarah A.", totalXP: 4200, currentLevel: 8, levelName: "Grand Master", levelColor: "bg-destructive", currentStreak: 14 },
  { rank: 2, userId: "u2", displayName: "Ahmed K.", totalXP: 3800, currentLevel: 7, levelName: "Master", levelColor: "bg-warning", currentStreak: 9 },
  { rank: 3, userId: "u3", displayName: "Fatima H.", totalXP: 3100, currentLevel: 7, levelName: "Master", levelColor: "bg-warning", currentStreak: 5 },
  { rank: 4, userId: "u4", displayName: "Omar M.", totalXP: 2400, currentLevel: 6, levelName: "Expert", levelColor: "bg-warning", currentStreak: 3 },
  { rank: 5, userId: "current", displayName: "You", totalXP: 1350, currentLevel: 4, levelName: "Achiever", levelColor: "bg-success", currentStreak: 7, isCurrentUser: true },
];

export default function DashboardWidgets() {
  const { isRTL } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Challenges Widget */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
          <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/[0.08]">
              <Target className="h-4 w-4 text-accent" />
            </div>
            {isRTL ? "التحديات النشطة" : "Active Challenges"}
          </CardTitle>
          <Link href="/dashboard/achievements">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground/70 hover:text-foreground h-7">
              {isRTL ? "عرض الكل" : "View All"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2.5 px-5 pb-5">
          {MOCK_CHALLENGES.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </CardContent>
      </Card>

      {/* Leaderboard Preview Widget */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
          <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-golden/[0.08]">
              <Trophy className="h-4 w-4 text-golden" />
            </div>
            {isRTL ? "لوحة المتصدرين" : "Leaderboard"}
          </CardTitle>
          <Link href="/dashboard/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground/70 hover:text-foreground h-7">
              {isRTL ? "عرض الكل" : "View All"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-1.5 px-5 pb-5">
          {MOCK_LEADERBOARD.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} showStreak={false} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
