"use client";

import { cn } from "@/lib/utils";
import { LevelBadge, DEFAULT_LEVELS, type LevelDefinition } from "./GamificationComponents";
import { Trophy, Medal, Flame, ChevronUp, ChevronDown, Minus } from "lucide-react";

// ============================================================
// Types
// ============================================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalXP: number;
  currentLevel: number;
  levelName: string;
  levelColor: string;
  currentStreak: number;
  previousRank?: number | null;
  isCurrentUser?: boolean;
}

export type TimePeriod = "all_time" | "this_week" | "this_month" | "this_quarter";

// ============================================================
// RankBadge - Medal icons for top 3
// ============================================================

export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
        <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Medal className="h-4 w-4 text-slate-500" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
        <Medal className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
    </div>
  );
}

// ============================================================
// RankChange - Shows rank movement indicator
// ============================================================

export function RankChange({ current, previous }: { current: number; previous?: number | null }) {
  if (previous == null) return null;

  const diff = previous - current; // positive = moved up

  if (diff > 0) {
    return (
      <span className="inline-flex items-center text-tiny font-medium text-green-600 dark:text-green-400">
        <ChevronUp className="h-3 w-3" />
        {diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center text-tiny font-medium text-red-500">
        <ChevronDown className="h-3 w-3" />
        {Math.abs(diff)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-tiny text-muted-foreground">
      <Minus className="h-3 w-3" />
    </span>
  );
}

// ============================================================
// MyRankCard - Displays current user's rank summary
// ============================================================

export function MyRankCard({
  entry,
  totalLearners,
}: {
  entry: LeaderboardEntry;
  totalLearners: number;
}) {
  const percentile = Math.round(((totalLearners - entry.rank) / totalLearners) * 100);

  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RankBadge rank={entry.rank} />
          <div>
            <p className="text-sm font-semibold">Your Rank</p>
            <p className="text-2xl font-bold text-primary">
              #{entry.rank}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                of {totalLearners}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <LevelBadge xp={entry.totalXP} size="sm" />
            <span className="text-sm font-medium">{entry.levelName}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {entry.totalXP.toLocaleString()} pts
          </p>
        </div>
      </div>
      {totalLearners > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percentile}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">Top {100 - percentile}%</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LeaderboardRow - Single row in the leaderboard table
// ============================================================

export function LeaderboardRow({
  entry,
  showStreak = true,
  showLevel = true,
}: {
  entry: LeaderboardEntry;
  showStreak?: boolean;
  showLevel?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
        entry.isCurrentUser
          ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:bg-muted/50"
      )}
    >
      {/* Rank */}
      <div className="flex items-center gap-1.5 w-14 shrink-0">
        <RankBadge rank={entry.rank} />
        <RankChange current={entry.rank} previous={entry.previousRank} />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              entry.isCurrentUser && "text-primary font-semibold"
            )}
          >
            {entry.displayName}
            {entry.isCurrentUser && (
              <span className="ml-1.5 text-tiny font-medium text-primary">(You)</span>
            )}
          </span>
        </div>
        {showLevel && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                entry.levelColor
              )}
            />
            <span className="text-tiny text-muted-foreground">
              Lvl {entry.currentLevel} &middot; {entry.levelName}
            </span>
          </div>
        )}
      </div>

      {/* Streak */}
      {showStreak && entry.currentStreak > 0 && (
        <div className="flex items-center gap-1 text-xs text-orange-500 shrink-0">
          <Flame className="h-3.5 w-3.5" />
          <span className="font-medium">{entry.currentStreak}</span>
        </div>
      )}

      {/* Points */}
      <div className="text-right shrink-0 w-20">
        <p className="text-sm font-bold">{entry.totalXP.toLocaleString()}</p>
        <p className="text-tiny text-muted-foreground">pts</p>
      </div>
    </div>
  );
}

// ============================================================
// PodiumDisplay - Top 3 visual podium
// ============================================================

export function PodiumDisplay({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const podiumHeights = ["h-20", "h-28", "h-16"];
  const podiumColors = [
    "bg-slate-200 dark:bg-slate-700",
    "bg-yellow-200 dark:bg-yellow-800/50",
    "bg-orange-200 dark:bg-orange-800/30",
  ];

  return (
    <div className="flex items-end justify-center gap-2 pt-8 pb-2">
      {podiumOrder.map((entry, i) => (
        <div key={entry.userId} className="flex flex-col items-center gap-2 w-28">
          {/* User info above podium */}
          <LevelBadge xp={entry.totalXP} size={i === 1 ? "lg" : "md"} />
          <div className="text-center">
            <p className="text-xs font-semibold truncate max-w-[100px]">
              {entry.displayName}
            </p>
            <p className="text-tiny text-muted-foreground font-medium">
              {entry.totalXP.toLocaleString()} pts
            </p>
          </div>
          {/* Podium block */}
          <div
            className={cn(
              "w-full rounded-t-lg flex items-start justify-center pt-2",
              podiumHeights[i],
              podiumColors[i]
            )}
          >
            <span className="text-lg font-bold text-muted-foreground">
              {entry.rank}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
