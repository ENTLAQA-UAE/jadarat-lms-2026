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
import {
  BadgeCard,
  type BadgeData,
} from "@/components/gamification/BadgeComponents";
import { Trophy, Flame, Target, Star, Zap, BarChart3, Award } from "lucide-react";
import Link from "next/link";
import {
  LeaderboardRow,
  type LeaderboardEntry,
} from "@/components/gamification/LeaderboardComponents";

// ============================================================
// Mock Data (Phase 2 will replace with real API calls)
// Points = XP (unified currency). Points drive levels, leaderboard, and progression.
// ============================================================

const mockPoints = 1350;

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
  { rank: 1, userId: "u1", displayName: "Sarah Al-Rashidi", totalXP: 4250, currentLevel: 8, levelName: "Grand Master", levelColor: "bg-destructive", currentStreak: 21 },
  { rank: 2, userId: "u2", displayName: "Mohammed Al-Harbi", totalXP: 3890, currentLevel: 7, levelName: "Master", levelColor: "bg-warning", currentStreak: 14 },
  { rank: 3, userId: "u3", displayName: "Fatima Al-Dosari", totalXP: 3520, currentLevel: 7, levelName: "Master", levelColor: "bg-warning", currentStreak: 9 },
  { rank: 5, userId: "current", displayName: "You (Demo User)", totalXP: 1350, currentLevel: 5, levelName: "Scholar", levelColor: "bg-success", currentStreak: 7, isCurrentUser: true },
];

const mockRecentPoints = [
  { action: "Course Completed", points: 100, date: "2h ago" },
  { action: "Quiz Passed", points: 50, date: "5h ago" },
  { action: "Daily Login", points: 5, date: "Today" },
  { action: "Challenge Bonus", points: 150, date: "Yesterday" },
  { action: "Certificate Earned", points: 75, date: "2d ago" },
];

const mockBadges: BadgeData[] = [
  { id: 1, name: "First Steps", description: "Complete your first course", icon: "book", color: "bg-info", triggerType: "courses_completed", triggerValue: 1, pointsReward: 50, isEarned: true, awardedAt: "2026-01-15T10:00:00Z" },
  { id: 2, name: "Quiz Whiz", description: "Pass 5 quizzes", icon: "star", color: "bg-warning", triggerType: "quizzes_passed", triggerValue: 5, pointsReward: 75, isEarned: true, awardedAt: "2026-01-20T14:30:00Z" },
  { id: 3, name: "Streak Starter", description: "Reach a 7-day streak", icon: "flame", color: "bg-warning", triggerType: "streak_reached", triggerValue: 7, pointsReward: 100, isEarned: true, awardedAt: "2026-02-10T09:00:00Z" },
  { id: 4, name: "Scholar", description: "Reach level 5", icon: "award", color: "bg-success", triggerType: "level_reached", triggerValue: 5, pointsReward: 150, isEarned: true, awardedAt: "2026-02-18T16:00:00Z" },
  { id: 5, name: "Course Collector", description: "Complete 10 courses", icon: "book", color: "bg-success", triggerType: "courses_completed", triggerValue: 10, pointsReward: 200, isEarned: false },
  { id: 6, name: "Perfect Score", description: "Score 100% on 3 quizzes", icon: "trophy", color: "bg-warning", triggerType: "perfect_quizzes", triggerValue: 3, pointsReward: 100, isEarned: false },
  { id: 7, name: "Consistency King", description: "Reach a 30-day streak", icon: "flame", color: "bg-destructive", triggerType: "streak_reached", triggerValue: 30, pointsReward: 250, isEarned: false },
  { id: 8, name: "Point Master", description: "Earn 5,000 points", icon: "zap", color: "bg-accent", triggerType: "points_reached", triggerValue: 5000, pointsReward: 500, isEarned: false },
  { id: 9, name: "Certified Pro", description: "Earn 5 certificates", icon: "award", color: "bg-info", triggerType: "certificates_earned", triggerValue: 5, pointsReward: 200, isEarned: false },
  { id: 10, name: "Challenge Champion", description: "Complete 10 challenges", icon: "target", color: "bg-primary", triggerType: "challenges_completed", triggerValue: 10, pointsReward: 300, isEarned: false },
  { id: 11, name: "Grand Master", description: "Reach level 8", icon: "crown", color: "bg-destructive", triggerType: "level_reached", triggerValue: 8, pointsReward: 400, isEarned: false },
  { id: 12, name: "Legend", description: "Earn 10,000 points", icon: "crown", color: "bg-warning", triggerType: "points_reached", triggerValue: 10000, pointsReward: 1000, isEarned: false },
];

// ============================================================
// Component
// ============================================================

export default function GamificationHub() {
  const { celebration, celebrate, dismiss } = useCelebration();
  const currentLevel = getCurrentLevel(mockPoints);
  const activeChallenges = mockChallenges.filter((c) => !c.isCompleted);
  const completedChallenges = mockChallenges.filter((c) => c.isCompleted);
  const earnedBadges = mockBadges.filter((b) => b.isEarned);
  const lockedBadges = mockBadges.filter((b) => !b.isEarned);

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
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your progress, maintain streaks, and complete challenges to earn points
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Card */}
        <Card className="overflow-hidden card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="rounded-lg bg-warning/10 p-1.5">
                <Star className="h-4 w-4 text-warning" />
              </span>
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <LevelBadge xp={mockPoints} size="lg" />
              <div>
                <p className="text-2xl font-bold">{currentLevel.name}</p>
                <p className="text-sm text-muted-foreground">Level {currentLevel.level}</p>
              </div>
            </div>
            <LevelProgress xp={mockPoints} />
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="overflow-hidden card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="rounded-lg bg-warning/10 p-1.5">
                <Flame className="h-4 w-4 text-warning" />
              </span>
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
                    className={`h-6 rounded-sm text-center text-tiny leading-6 font-medium ${
                      isActive
                        ? "bg-warning text-primary-foreground"
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

        {/* Points Summary Card */}
        <Card className="overflow-hidden card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-1.5">
                <Zap className="h-4 w-4 text-primary" />
              </span>
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-primary">{mockPoints.toLocaleString()}</p>
            <div className="mt-3 space-y-1.5">
              {mockRecentPoints.slice(0, 3).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{entry.action}</span>
                  <span className="font-medium text-primary">+{entry.points} pts</span>
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
            Complete time-bound challenges to earn bonus point rewards
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

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges
          </CardTitle>
          <CardDescription>
            Earn badges by reaching milestones. {earnedBadges.length} of {mockBadges.length} unlocked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="earned">
            <TabsList>
              <TabsTrigger value="earned">
                Earned ({earnedBadges.length})
              </TabsTrigger>
              <TabsTrigger value="locked">
                Locked ({lockedBadges.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({mockBadges.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="earned" className="mt-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {earnedBadges.map((b) => (
                  <BadgeCard key={b.id} badge={b} />
                ))}
                {earnedBadges.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-4">
                    No badges earned yet. Keep learning!
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="locked" className="mt-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {lockedBadges.map((b) => (
                  <BadgeCard key={b.id} badge={b} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {mockBadges.map((b) => (
                  <BadgeCard key={b.id} badge={b} />
                ))}
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
            Your journey through all levels. Keep earning points to advance!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {DEFAULT_LEVELS.map((lvl) => {
              const isReached = mockPoints >= lvl.xpThreshold;
              const isCurrent = currentLevel.level === lvl.level;
              return (
                <div
                  key={lvl.level}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : isReached
                        ? "border-success bg-success/10 dark:border-success dark:bg-success/90"
                        : "opacity-50"
                  }`}
                >
                  <div
                    className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground ${lvl.color}`}
                  >
                    {lvl.level}
                  </div>
                  <p className="text-xs font-semibold">{lvl.name}</p>
                  <p className="text-tiny text-muted-foreground">
                    {lvl.xpThreshold.toLocaleString()} pts
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
              <Star className="mr-1 h-4 w-4 text-warning" />
              Level Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                celebrate(
                  "challenge_complete",
                  "Challenge Complete!",
                  'You completed "Quiz Ace" and earned 150 pts'
                )
              }
            >
              <Target className="mr-1 h-4 w-4 text-success" />
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
              <Flame className="mr-1 h-4 w-4 text-warning" />
              Streak Milestone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                celebrate(
                  "badge_earned",
                  "Badge Earned!",
                  'You earned "Scholar" and received 150 pts'
                )
              }
            >
              <Award className="mr-1 h-4 w-4 text-accent" />
              Badge Earned
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
