"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Award, Plus, Trash2 } from "lucide-react";
import {
  BadgeIcon,
  TRIGGER_TYPE_LABELS,
  type BadgeData,
} from "@/components/gamification/BadgeComponents";

// ============================================================
// Badge Template (admin config)
// ============================================================

interface BadgeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  triggerType: BadgeData["triggerType"];
  triggerValue: number;
  pointsReward: number;
  enabled: boolean;
}

const ICON_OPTIONS = [
  { value: "trophy", label: "Trophy" },
  { value: "book", label: "Book" },
  { value: "star", label: "Star" },
  { value: "flame", label: "Flame" },
  { value: "award", label: "Award" },
  { value: "target", label: "Target" },
  { value: "zap", label: "Zap" },
  { value: "crown", label: "Crown" },
];

const COLOR_OPTIONS = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-emerald-500", label: "Emerald" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-indigo-500", label: "Indigo" },
];

const defaultBadgeTemplates: BadgeTemplate[] = [
  { id: "b1", name: "First Steps", description: "Complete your first course", icon: "book", color: "bg-blue-500", triggerType: "courses_completed", triggerValue: 1, pointsReward: 50, enabled: true },
  { id: "b2", name: "Quiz Whiz", description: "Pass 5 quizzes", icon: "star", color: "bg-yellow-500", triggerType: "quizzes_passed", triggerValue: 5, pointsReward: 75, enabled: true },
  { id: "b3", name: "Streak Starter", description: "Reach a 7-day streak", icon: "flame", color: "bg-orange-500", triggerType: "streak_reached", triggerValue: 7, pointsReward: 100, enabled: true },
  { id: "b4", name: "Scholar", description: "Reach level 5", icon: "award", color: "bg-emerald-500", triggerType: "level_reached", triggerValue: 5, pointsReward: 150, enabled: true },
  { id: "b5", name: "Course Collector", description: "Complete 10 courses", icon: "book", color: "bg-green-500", triggerType: "courses_completed", triggerValue: 10, pointsReward: 200, enabled: true },
  { id: "b6", name: "Perfect Score", description: "Score 100% on 3 quizzes", icon: "trophy", color: "bg-amber-500", triggerType: "perfect_quizzes", triggerValue: 3, pointsReward: 100, enabled: true },
  { id: "b7", name: "Consistency King", description: "Reach a 30-day streak", icon: "flame", color: "bg-red-500", triggerType: "streak_reached", triggerValue: 30, pointsReward: 250, enabled: true },
  { id: "b8", name: "Point Master", description: "Earn 5,000 points", icon: "zap", color: "bg-purple-500", triggerType: "points_reached", triggerValue: 5000, pointsReward: 500, enabled: true },
  { id: "b9", name: "Certified Pro", description: "Earn 5 certificates", icon: "award", color: "bg-cyan-500", triggerType: "certificates_earned", triggerValue: 5, pointsReward: 200, enabled: true },
  { id: "b10", name: "Challenge Champion", description: "Complete 10 challenges", icon: "target", color: "bg-indigo-500", triggerType: "challenges_completed", triggerValue: 10, pointsReward: 300, enabled: true },
  { id: "b11", name: "Grand Master", description: "Reach level 8", icon: "crown", color: "bg-red-600", triggerType: "level_reached", triggerValue: 8, pointsReward: 400, enabled: false },
  { id: "b12", name: "Legend", description: "Earn 10,000 points", icon: "crown", color: "bg-amber-400", triggerType: "points_reached", triggerValue: 10000, pointsReward: 1000, enabled: false },
];

// ============================================================
// Component
// ============================================================

export default function BadgeConfigPage() {
  const [badges, setBadges] = useState<BadgeTemplate[]>(defaultBadgeTemplates);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateBadge = (id: string, field: keyof BadgeTemplate, value: any) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
    setSaved(false);
  };

  const addBadge = () => {
    const newId = `b${Date.now()}`;
    setBadges((prev) => [
      ...prev,
      {
        id: newId,
        name: "New Badge",
        description: "Description",
        icon: "trophy",
        color: "bg-yellow-500",
        triggerType: "courses_completed",
        triggerValue: 1,
        pointsReward: 50,
        enabled: true,
      },
    ]);
    setSaved(false);
  };

  const removeBadge = (id: string) => {
    setBadges((prev) => prev.filter((b) => b.id !== id));
    setSaved(false);
  };

  const totalEnabled = badges.filter((b) => b.enabled).length;
  const totalRewardPoints = badges
    .filter((b) => b.enabled)
    .reduce((sum, b) => sum + b.pointsReward, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6" />
            Badge Configuration
          </h1>
          <p className="text-muted-foreground">
            Define badges that learners earn by reaching milestones. Badges are one-time, permanent achievements.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reward Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewardPoints.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Badge Definitions</CardTitle>
              <CardDescription>
                Configure badge names, triggers, and point rewards. Learners earn badges automatically when they meet the trigger condition.
              </CardDescription>
            </div>
            <Button size="sm" onClick={addBadge} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Badge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Active</TableHead>
                <TableHead className="w-[60px]">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[160px]">Trigger</TableHead>
                <TableHead className="w-[90px]">Value</TableHead>
                <TableHead className="w-[90px]">Pts Reward</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((badge) => (
                <TableRow
                  key={badge.id}
                  className={!badge.enabled ? "opacity-50" : ""}
                >
                  <TableCell>
                    <Switch
                      checked={badge.enabled}
                      onCheckedChange={(checked) =>
                        updateBadge(badge.id, "enabled", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <BadgeIcon
                      badge={{
                        ...badge,
                        id: 0,
                        isEarned: true,
                      }}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={badge.name}
                      onChange={(e) =>
                        updateBadge(badge.id, "name", e.target.value)
                      }
                      disabled={!badge.enabled}
                      className="max-w-[150px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={badge.description}
                      onChange={(e) =>
                        updateBadge(badge.id, "description", e.target.value)
                      }
                      disabled={!badge.enabled}
                      className="max-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={badge.triggerType}
                      onValueChange={(v) =>
                        updateBadge(badge.id, "triggerType", v)
                      }
                      disabled={!badge.enabled}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRIGGER_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={badge.triggerValue}
                      onChange={(e) =>
                        updateBadge(
                          badge.id,
                          "triggerValue",
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={!badge.enabled}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={badge.pointsReward}
                      onChange={(e) =>
                        updateBadge(
                          badge.id,
                          "pointsReward",
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={!badge.enabled}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBadge(badge.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {badges.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No badges configured. Click &quot;Add Badge&quot; to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
