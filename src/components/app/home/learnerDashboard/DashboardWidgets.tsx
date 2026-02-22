"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, ChevronRight } from "lucide-react";
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

// Mock challenges — will be replaced with real data in Phase 2
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

// Mock leaderboard — will be replaced with real data in Phase 2
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
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Challenges Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            {isRTL ? "التحديات النشطة" : "Active Challenges"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_CHALLENGES.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </CardContent>
      </Card>

      {/* Leaderboard Preview Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-warning" />
            {isRTL ? "لوحة المتصدرين" : "Leaderboard"}
          </CardTitle>
          <Link href="/dashboard/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              {isRTL ? "عرض الكل" : "View All"}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_LEADERBOARD.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} showStreak={false} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
