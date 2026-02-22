"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

export interface LevelDefinition {
  level: number;
  name: string;
  xpThreshold: number;
  color: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakType: "daily" | "weekly";
  lastActivityDate: string | null;
  streakFreezes: number;
  maxStreakFreezes: number;
  isActive: boolean;
}

export interface ChallengeData {
  id: string;
  title: string;
  description: string;
  type: "courses_completed" | "quizzes_passed" | "login_streak" | "points_earned" | "time_spent";
  goal: number;
  progress: number;
  startDate: string;
  endDate: string;
  xpReward: number;
  isCompleted: boolean;
}

// ============================================================
// Default Level Definitions
// ============================================================

export const DEFAULT_LEVELS: LevelDefinition[] = [
  { level: 1, name: "Newcomer", xpThreshold: 0, color: "bg-muted-foreground" },
  { level: 2, name: "Explorer", xpThreshold: 100, color: "bg-info" },
  { level: 3, name: "Learner", xpThreshold: 300, color: "bg-info" },
  { level: 4, name: "Achiever", xpThreshold: 600, color: "bg-success" },
  { level: 5, name: "Scholar", xpThreshold: 1000, color: "bg-success" },
  { level: 6, name: "Expert", xpThreshold: 1500, color: "bg-warning" },
  { level: 7, name: "Master", xpThreshold: 2500, color: "bg-warning" },
  { level: 8, name: "Grand Master", xpThreshold: 4000, color: "bg-destructive" },
  { level: 9, name: "Legend", xpThreshold: 6000, color: "bg-accent" },
  { level: 10, name: "Mythic", xpThreshold: 10000, color: "bg-warning" },
];

// ============================================================
// Helper: compute current level from XP
// ============================================================

export function getCurrentLevel(xp: number, levels: LevelDefinition[] = DEFAULT_LEVELS) {
  let current = levels[0];
  for (const lvl of levels) {
    if (xp >= lvl.xpThreshold) current = lvl;
    else break;
  }
  return current;
}

export function getNextLevel(xp: number, levels: LevelDefinition[] = DEFAULT_LEVELS) {
  for (const lvl of levels) {
    if (xp < lvl.xpThreshold) return lvl;
  }
  return null; // max level
}

export function getLevelProgress(xp: number, levels: LevelDefinition[] = DEFAULT_LEVELS) {
  const current = getCurrentLevel(xp, levels);
  const next = getNextLevel(xp, levels);
  if (!next) return 100;
  const range = next.xpThreshold - current.xpThreshold;
  const progress = xp - current.xpThreshold;
  return Math.round((progress / range) * 100);
}

// ============================================================
// LevelBadge Component
// ============================================================

export function LevelBadge({
  xp,
  levels = DEFAULT_LEVELS,
  size = "md",
}: {
  xp: number;
  levels?: LevelDefinition[];
  size?: "sm" | "md" | "lg";
}) {
  const current = getCurrentLevel(xp, levels);

  const sizeClasses = {
    sm: "h-6 w-6 text-tiny",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-primary-foreground shadow-md",
        current.color,
        sizeClasses[size]
      )}
    >
      {current.level}
    </div>
  );
}

// ============================================================
// LevelProgress Component
// ============================================================

export function LevelProgress({
  xp,
  levels = DEFAULT_LEVELS,
  className,
}: {
  xp: number;
  levels?: LevelDefinition[];
  className?: string;
}) {
  const current = getCurrentLevel(xp, levels);
  const next = getNextLevel(xp, levels);
  const progress = getLevelProgress(xp, levels);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <LevelBadge xp={xp} levels={levels} size="sm" />
          <span className="font-medium">{current.name}</span>
        </div>
        {next ? (
          <span className="text-muted-foreground text-xs">
            {xp.toLocaleString()} / {next.xpThreshold.toLocaleString()} pts
          </span>
        ) : (
          <span className="text-muted-foreground text-xs font-medium">
            MAX LEVEL
          </span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      {next && (
        <p className="text-xs text-muted-foreground">
          {(next.xpThreshold - xp).toLocaleString()} pts to {next.name}
        </p>
      )}
    </div>
  );
}

// ============================================================
// StreakDisplay Component
// ============================================================

export function StreakDisplay({ streak }: { streak: StreakData }) {
  const flameColors = streak.isActive
    ? "text-warning"
    : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg
          className={cn("h-10 w-10", flameColors)}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.037 2.346-6.44 4.95-8.85a.75.75 0 0 1 1.1.05c.83 1.06 1.66 1.98 2.3 2.6.2.19.5.19.7 0 .94-.9 1.83-2.1 2.3-3.3a.75.75 0 0 1 1.35-.1C19.36 9.39 21 12.65 21 16c0 3.866-3.134 7-7 7z" />
        </svg>
        {streak.isActive && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-tiny font-bold text-primary-foreground">
            {streak.currentStreak}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">
            {streak.currentStreak} {streak.streakType === "daily" ? "day" : "week"} streak
          </span>
          {streak.isActive && (
            <span className="inline-flex items-center rounded-full bg-warning/10 px-1.5 py-0.5 text-tiny font-medium text-warning">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Best: {streak.longestStreak}</span>
          <span>|</span>
          <span className="flex items-center gap-1">
            Freezes: {streak.streakFreezes}/{streak.maxStreakFreezes}
            {streak.streakFreezes > 0 && (
              <svg className="h-3 w-3 text-info" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ChallengeCard Component
// ============================================================

export function ChallengeCard({ challenge }: { challenge: ChallengeData }) {
  const progressPercent = Math.min(
    Math.round((challenge.progress / challenge.goal) * 100),
    100
  );
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
  const isExpired = daysLeft === 0 && !challenge.isCompleted;

  const typeIcons: Record<string, string> = {
    courses_completed: "📚",
    quizzes_passed: "✅",
    login_streak: "🔥",
    points_earned: "⭐",
    time_spent: "⏱️",
  };

  return (
    <div
      className={cn(
        "group rounded-lg border p-4 transition-all card-hover",
        challenge.isCompleted
          ? "border-success bg-gradient-to-br from-success/10 to-success/5 dark:border-success dark:bg-gradient-to-br dark:from-success/90 dark:to-success/80"
          : isExpired
            ? "border-destructive bg-gradient-to-br from-destructive/10 to-destructive/5 opacity-60 dark:border-destructive dark:bg-gradient-to-br dark:from-destructive/90 dark:to-destructive/80"
            : "border-border bg-gradient-to-br from-background to-muted/30 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg transition-transform duration-300 group-hover:scale-110">{typeIcons[challenge.type] ?? "🎯"}</span>
          <div>
            <h4 className="text-sm font-semibold">{challenge.title}</h4>
            <p className="text-xs text-muted-foreground">{challenge.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-primary">+{challenge.xpReward} pts</span>
          {!challenge.isCompleted && !isExpired && (
            <p className="text-tiny text-muted-foreground">{daysLeft}d left</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {challenge.progress} / {challenge.goal}
          </span>
          <span className="font-medium">
            {challenge.isCompleted ? (
              <span className="text-success">Completed!</span>
            ) : isExpired ? (
              <span className="text-destructive">Expired</span>
            ) : (
              `${progressPercent}%`
            )}
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-1.5"
          gradient={!challenge.isCompleted && !isExpired && progressPercent > 50}
          progressClassName={cn(
            challenge.isCompleted
              ? "bg-success"
              : isExpired
                ? "bg-destructive"
                : "bg-primary"
          )}
        />
      </div>
    </div>
  );
}
