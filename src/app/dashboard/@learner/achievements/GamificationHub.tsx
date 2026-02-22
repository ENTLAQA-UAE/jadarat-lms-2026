"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  LevelBadge,
  LevelProgress,
  StreakDisplay,
  ChallengeCard,
  DEFAULT_LEVELS,
  getCurrentLevel,
  type StreakData,
  type ChallengeData,
} from "@/components/gamification/GamificationComponents";
import {
  CelebrationOverlay,
  useCelebration,
} from "@/components/gamification/CelebrationOverlay";
import { Trophy, Flame, Target, Star, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";
import {
  LeaderboardRow,
  type LeaderboardEntry,
} from "@/components/gamification/LeaderboardComponents";

// ============================================================
// Mock Data (Phase 2 will replace with real API calls)
// ============================================================

const mockXP = 1350;

const mockStreak: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  streakType: "daily",
  lastActivityDate: new Date().toISOString(),
  streakFreezes: 2,
  maxStreakFreezes: 3,
  isActive: true,
};

const mockChallenges: ChallengeData[] = [
  {
    id: "ch1",
    title: "Course Marathon",
    description: "Complete 3 courses this week",
    type: "courses_completed",
    goal: 3,
    progress: 2,
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    xpReward: 200,
    isCompleted: false,
  },
  {
    id: "ch2",
    title: "Quiz Ace",
    description: "Pass 5 quizzes with 80%+ score",
    type: "quizzes_passed",
    goal: 5,
    progress: 5,
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    xpReward: 150,
    isCompleted: true,
  },
  {
    id: "ch3",
    title: "Consistency King",
    description: "Login for 10 consecutive days",
    type: "login_streak",
    goal: 10,
    progress: 7,
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    xpReward: 100,
    isCompleted: false,
  },
  {
    id: "ch4",
    title: "Point Collector",
    description: "Earn 500 points this month",
    type: "points_earned",
    goal: 500,
    progress: 320,
    startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    xpReward: 250,
    isCompleted: false,
  },
];

const mockLeaderboardPreview: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", displayName: "Sarah Al-Rashidi", totalXP: 4250, currentLevel: 8, levelName: "Grand Master", levelColor: "bg-red-500", currentStreak: 21 },
  { rank: 2, userId: "u2", displayName: "Mohammed Al-Harbi", totalXP: 3890, currentLevel: 7, levelName: "Master", levelColor: "bg-orange-500", currentStreak: 14 },
  { rank: 3, userId: "u3", displayName: "Fatima Al-Dosari", totalXP: 3520, currentLevel: 7, levelName: "Master", levelColor: "bg-orange-500", currentStreak: 9 },
  { rank: 5, userId: "current", displayName: "You (Demo User)", totalXP: 1350, currentLevel: 5, levelName: "Scholar", levelColor: "bg-emerald-500", currentStreak: 7, isCurrentUser: true },
];

const mockRecentXP = [
  { action: "Course Completed", xp: 100, date: "2h ago" },
  { action: "Quiz Passed", xp: 50, date: "5h ago" },
  { action: "Daily Login", xp: 5, date: "Today" },
  { action: "Challenge Bonus", xp: 150, date: "Yesterday" },
  { action: "Certificate Earned", xp: 75, date: "2d ago" },
];

// ============================================================
// Component
// ============================================================

export default function GamificationHub() {
  const { celebration, celebrate, dismiss } = useCelebration();
  const currentLevel = getCurrentLevel(mockXP);
  const activeChallenges = mockChallenges.filter((c) => !c.isCompleted);
  const completedChallenges = mockChallenges.filter((c) => c.isCompleted);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Celebration Overlay */}
      {celebration && (
        <CelebrationOverlay
          type={celebration.type}
          title={celebration.title}
          subtitle={celebration.subtitle}
          onClose={dismiss}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your progress, maintain streaks, and complete challenges to earn XP
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <LevelBadge xp={mockXP} size="lg" />
              <div>
                <p className="text-2xl font-bold">{currentLevel.name}</p>
                <p className="text-sm text-muted-foreground">Level {currentLevel.level}</p>
              </div>
            </div>
            <LevelProgress xp={mockXP} />
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay streak={mockStreak} />
            <div className="mt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const isActive = i < mockStreak.currentStreak % 7 || mockStreak.currentStreak >= 7;
                return (
                  <div
                    key={i}
                    className={`h-6 rounded-sm text-center text-[10px] leading-6 font-medium ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* XP Summary Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{mockXP.toLocaleString()}</p>
            <div className="mt-3 space-y-1.5">
              {mockRecentXP.slice(0, 3).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{entry.action}</span>
                  <span className="font-medium text-primary">+{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Challenges
          </CardTitle>
          <CardDescription>
            Complete time-bound challenges to earn bonus XP rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedChallenges.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {activeChallenges.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
                {activeChallenges.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No active challenges. New ones will appear soon!
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {completedChallenges.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
                {completedChallenges.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No completed challenges yet. Keep going!
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Level Map */}
      <Card>
        <CardHeader>
          <CardTitle>Level Map</CardTitle>
          <CardDescription>
            Your journey through all levels. Keep earning XP to advance!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {DEFAULT_LEVELS.map((lvl) => {
              const isReached = mockXP >= lvl.xpThreshold;
              const isCurrent = currentLevel.level === lvl.level;
              return (
                <div
                  key={lvl.level}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : isReached
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                        : "opacity-50"
                  }`}
                >
                  <div
                    className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${lvl.color}`}
                  >
                    {lvl.level}
                  </div>
                  <p className="text-xs font-semibold">{lvl.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {lvl.xpThreshold.toLocaleString()} XP
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Leaderboard
              </CardTitle>
              <CardDescription>Your rank among peers</CardDescription>
            </div>
            <Link href="/dashboard/leaderboard">
              <Button variant="outline" size="sm">
                View Full Leaderboard
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockLeaderboardPreview.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                showStreak={false}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Celebrations (for testing) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Test Celebrations</CardTitle>
          <CardDescription>Click to preview celebration animations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                celebrate("level_up", "Level Up!", "You reached Expert (Level 6)")
              }
            >
              <Star className="mr-1 h-4 w-4 text-yellow-500" />
              Level Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                celebrate(
                  "challenge_complete",
                  "Challenge Complete!",
                  'You completed "Quiz Ace" and earned 150 XP'
                )
              }
            >
              <Target className="mr-1 h-4 w-4 text-green-500" />
              Challenge Done
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                celebrate(
                  "streak_milestone",
                  "7-Day Streak!",
                  "You've been learning for 7 days straight"
                )
              }
            >
              <Flame className="mr-1 h-4 w-4 text-orange-500" />
              Streak Milestone
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
