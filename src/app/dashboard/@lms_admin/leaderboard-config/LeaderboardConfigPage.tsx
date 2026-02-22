"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Save, Trophy, Eye, EyeOff, BarChart3 } from "lucide-react";

// ============================================================
// Config State
// ============================================================

interface LeaderboardConfig {
  enabled: boolean;
  showTopN: number;
  anonymizeNames: boolean;
  showDepartment: boolean;
  showLevel: boolean;
  showStreak: boolean;
  resetPeriod: "none" | "weekly" | "monthly" | "quarterly";
}

const defaultConfig: LeaderboardConfig = {
  enabled: true,
  showTopN: 50,
  anonymizeNames: false,
  showDepartment: true,
  showLevel: true,
  showStreak: true,
  resetPeriod: "none",
};

// ============================================================
// Component
// ============================================================

export default function LeaderboardConfigPage() {
  const [config, setConfig] = useState<LeaderboardConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = <K extends keyof LeaderboardConfig>(
    key: K,
    value: LeaderboardConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Leaderboard Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure how the leaderboard appears to learners
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
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.enabled ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visible Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Top {config.showTopN}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reset Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {config.resetPeriod === "none" ? "Never" : config.resetPeriod}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              General Settings
            </span>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => update("enabled", checked)}
            />
          </CardTitle>
          <CardDescription>
            Enable or disable the leaderboard for all learners in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent
          className={!config.enabled ? "opacity-50 pointer-events-none" : ""}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Show Top N Learners</label>
              <Input
                type="number"
                min={5}
                max={200}
                value={config.showTopN}
                onChange={(e) =>
                  update("showTopN", parseInt(e.target.value) || 50)
                }
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of learners visible on the leaderboard (5–200).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reset Period</label>
              <Select
                value={config.resetPeriod}
                onValueChange={(v) =>
                  update("resetPeriod", v as LeaderboardConfig["resetPeriod"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Never (All Time)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often the leaderboard resets. &quot;Never&quot; shows all-time rankings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.anonymizeNames ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
            Visibility Settings
          </CardTitle>
          <CardDescription>
            Control what information is visible on the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent
          className={!config.enabled ? "opacity-50 pointer-events-none" : ""}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Anonymize Names</p>
                <p className="text-xs text-muted-foreground">
                  Replace real names with &quot;Learner #1&quot;, &quot;Learner #2&quot;, etc.
                </p>
              </div>
              <Switch
                checked={config.anonymizeNames}
                onCheckedChange={(checked) =>
                  update("anonymizeNames", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Department</p>
                <p className="text-xs text-muted-foreground">
                  Display the learner&apos;s department or team on the leaderboard.
                </p>
              </div>
              <Switch
                checked={config.showDepartment}
                onCheckedChange={(checked) =>
                  update("showDepartment", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Level</p>
                <p className="text-xs text-muted-foreground">
                  Display the learner&apos;s current level and badge.
                </p>
              </div>
              <Switch
                checked={config.showLevel}
                onCheckedChange={(checked) => update("showLevel", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Streak</p>
                <p className="text-xs text-muted-foreground">
                  Display the learner&apos;s current streak count on the leaderboard.
                </p>
              </div>
              <Switch
                checked={config.showStreak}
                onCheckedChange={(checked) => update("showStreak", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
