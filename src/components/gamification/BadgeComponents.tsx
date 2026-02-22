"use client";

import { cn } from "@/lib/utils";
import {
  Trophy,
  BookOpen,
  Star,
  Flame,
  Award,
  Target,
  Zap,
  Crown,
  Lock,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

export interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  triggerType:
    | "points_reached"
    | "courses_completed"
    | "quizzes_passed"
    | "streak_reached"
    | "perfect_quizzes"
    | "certificates_earned"
    | "challenges_completed"
    | "level_reached";
  triggerValue: number;
  pointsReward: number;
  isEarned: boolean;
  awardedAt?: string | null;
}

// ============================================================
// Badge Icon Map
// ============================================================

const BADGE_ICONS: Record<string, React.ReactNode> = {
  trophy: <Trophy className="h-full w-full" />,
  book: <BookOpen className="h-full w-full" />,
  star: <Star className="h-full w-full" />,
  flame: <Flame className="h-full w-full" />,
  award: <Award className="h-full w-full" />,
  target: <Target className="h-full w-full" />,
  zap: <Zap className="h-full w-full" />,
  crown: <Crown className="h-full w-full" />,
};

// ============================================================
// Trigger type labels for display
// ============================================================

export const TRIGGER_TYPE_LABELS: Record<BadgeData["triggerType"], string> = {
  points_reached: "Earn points",
  courses_completed: "Complete courses",
  quizzes_passed: "Pass quizzes",
  streak_reached: "Reach streak",
  perfect_quizzes: "Perfect quizzes",
  certificates_earned: "Earn certificates",
  challenges_completed: "Complete challenges",
  level_reached: "Reach level",
};

export function getTriggerLabel(triggerType: BadgeData["triggerType"], triggerValue: number): string {
  switch (triggerType) {
    case "points_reached":
      return `Earn ${triggerValue.toLocaleString()} points`;
    case "courses_completed":
      return `Complete ${triggerValue} course${triggerValue !== 1 ? "s" : ""}`;
    case "quizzes_passed":
      return `Pass ${triggerValue} quiz${triggerValue !== 1 ? "zes" : ""}`;
    case "streak_reached":
      return `Reach a ${triggerValue}-day streak`;
    case "perfect_quizzes":
      return `Score 100% on ${triggerValue} quiz${triggerValue !== 1 ? "zes" : ""}`;
    case "certificates_earned":
      return `Earn ${triggerValue} certificate${triggerValue !== 1 ? "s" : ""}`;
    case "challenges_completed":
      return `Complete ${triggerValue} challenge${triggerValue !== 1 ? "s" : ""}`;
    case "level_reached":
      return `Reach level ${triggerValue}`;
  }
}

// ============================================================
// BadgeIcon Component
// ============================================================

export function BadgeIcon({
  badge,
  size = "md",
}: {
  badge: BadgeData;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8 p-1.5",
    md: "h-12 w-12 p-2.5",
    lg: "h-16 w-16 p-3",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white shadow-md transition-all",
        badge.isEarned ? badge.color : "bg-muted",
        badge.isEarned ? "" : "opacity-40 grayscale",
        sizeClasses[size]
      )}
    >
      {badge.isEarned ? (
        BADGE_ICONS[badge.icon] ?? <Trophy className="h-full w-full" />
      ) : (
        <Lock className="h-full w-full text-muted-foreground" />
      )}
    </div>
  );
}

// ============================================================
// BadgeCard Component — detailed card for badge grid
// ============================================================

export function BadgeCard({ badge }: { badge: BadgeData }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-center transition-all",
        badge.isEarned
          ? "border-primary/20 bg-primary/5 hover:shadow-md"
          : "border-border opacity-60"
      )}
    >
      <div className="flex justify-center mb-3">
        <BadgeIcon badge={badge} size="lg" />
      </div>
      <h4 className="text-sm font-semibold">{badge.name}</h4>
      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
      <p className="text-tiny text-muted-foreground mt-2">
        {getTriggerLabel(badge.triggerType, badge.triggerValue)}
      </p>
      {badge.isEarned && badge.awardedAt && (
        <p className="text-tiny text-primary font-medium mt-1">
          Earned {new Date(badge.awardedAt).toLocaleDateString()}
        </p>
      )}
      {badge.pointsReward > 0 && (
        <p className="text-tiny text-muted-foreground mt-1">
          +{badge.pointsReward} pts reward
        </p>
      )}
    </div>
  );
}

// ============================================================
// BadgeShowcase — compact horizontal row for sidebar / profile
// ============================================================

export function BadgeShowcase({
  badges,
  maxVisible = 5,
}: {
  badges: BadgeData[];
  maxVisible?: number;
}) {
  const earned = badges.filter((b) => b.isEarned);
  const visible = earned.slice(0, maxVisible);
  const remaining = earned.length - maxVisible;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((badge) => (
        <BadgeIcon key={badge.id} badge={badge} size="sm" />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground font-medium ml-1">
          +{remaining}
        </span>
      )}
      {earned.length === 0 && (
        <span className="text-xs text-muted-foreground">No badges yet</span>
      )}
    </div>
  );
}
