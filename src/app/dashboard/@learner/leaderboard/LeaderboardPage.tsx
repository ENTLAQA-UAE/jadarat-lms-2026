"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  LeaderboardRow,
  MyRankCard,
  PodiumDisplay,
  type LeaderboardEntry,
  type TimePeriod,
} from "@/components/gamification/LeaderboardComponents";

// ============================================================
// Mock Data (Phase 2 will replace with real API calls)
// ============================================================

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "u1",
    displayName: "Sarah Al-Rashidi",
    totalXP: 4250,
    currentLevel: 8,
    levelName: "Grand Master",
    levelColor: "bg-destructive",
    currentStreak: 21,
    previousRank: 1,
  },
  {
    rank: 2,
    userId: "u2",
    displayName: "Mohammed Al-Harbi",
    totalXP: 3890,
    currentLevel: 7,
    levelName: "Master",
    levelColor: "bg-warning",
    currentStreak: 14,
    previousRank: 3,
  },
  {
    rank: 3,
    userId: "u3",
    displayName: "Fatima Al-Dosari",
    totalXP: 3520,
    currentLevel: 7,
    levelName: "Master",
    levelColor: "bg-warning",
    currentStreak: 9,
    previousRank: 2,
  },
  {
    rank: 4,
    userId: "u4",
    displayName: "Ahmed Al-Qahtani",
    totalXP: 2870,
    currentLevel: 7,
    levelName: "Master",
    levelColor: "bg-warning",
    currentStreak: 5,
    previousRank: 5,
  },
  {
    rank: 5,
    userId: "current",
    displayName: "You (Demo User)",
    totalXP: 1350,
    currentLevel: 5,
    levelName: "Scholar",
    levelColor: "bg-success",
    currentStreak: 7,
    previousRank: 6,
    isCurrentUser: true,
  },
  {
    rank: 6,
    userId: "u6",
    displayName: "Noura Al-Mutairi",
    totalXP: 1200,
    currentLevel: 5,
    levelName: "Scholar",
    levelColor: "bg-success",
    currentStreak: 3,
    previousRank: 4,
  },
  {
    rank: 7,
    userId: "u7",
    displayName: "Khalid Al-Shamri",
    totalXP: 980,
    currentLevel: 4,
    levelName: "Achiever",
    levelColor: "bg-success",
    currentStreak: 0,
    previousRank: 7,
  },
  {
    rank: 8,
    userId: "u8",
    displayName: "Reem Al-Otaibi",
    totalXP: 750,
    currentLevel: 4,
    levelName: "Achiever",
    levelColor: "bg-success",
    currentStreak: 2,
    previousRank: 9,
  },
  {
    rank: 9,
    userId: "u9",
    displayName: "Omar Al-Zahrani",
    totalXP: 520,
    currentLevel: 3,
    levelName: "Learner",
    levelColor: "bg-info",
    currentStreak: 0,
    previousRank: 8,
  },
  {
    rank: 10,
    userId: "u10",
    displayName: "Layla Al-Ghamdi",
    totalXP: 310,
    currentLevel: 3,
    levelName: "Learner",
    levelColor: "bg-info",
    currentStreak: 1,
    previousRank: 10,
  },
  {
    rank: 11,
    userId: "u11",
    displayName: "Sultan Al-Dossary",
    totalXP: 180,
    currentLevel: 2,
    levelName: "Explorer",
    levelColor: "bg-info",
    currentStreak: 0,
    previousRank: 12,
  },
  {
    rank: 12,
    userId: "u12",
    displayName: "Haya Al-Shehri",
    totalXP: 90,
    currentLevel: 1,
    levelName: "Newcomer",
    levelColor: "bg-muted-foreground",
    currentStreak: 1,
    previousRank: 11,
  },
];

const mockCurrentUserEntry = mockLeaderboard.find((e) => e.isCurrentUser)!;
const mockTotalLearners = 48;

// ============================================================
// Component
// ============================================================

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<TimePeriod>("all_time");

  const periodLabels: Record<TimePeriod, string> = {
    all_time: "All Time",
    this_week: "This Week",
    this_month: "This Month",
    this_quarter: "This Quarter",
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-warning" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you rank among your peers
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 self-start">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* My Rank */}
        <MyRankCard entry={mockCurrentUserEntry} totalLearners={mockTotalLearners} />

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockTotalLearners}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active in your organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              +1
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Positions gained this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Podium */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Top Performers</CardTitle>
            <Tabs
              value={period}
              onValueChange={(v) => setPeriod(v as TimePeriod)}
            >
              <TabsList className="h-8">
                {Object.entries(periodLabels).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="text-xs px-2.5 h-6">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <PodiumDisplay entries={mockLeaderboard} />
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>
            {periodLabels[period]} leaderboard &middot; Top {mockLeaderboard.length} of {mockTotalLearners} learners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockLeaderboard.map((entry) => (
              <LeaderboardRow key={entry.userId} entry={entry} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
