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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Trophy,
  Flame,
  Target,
  Star,
  Plus,
  Trash2,
} from "lucide-react";
import { LevelBadge, DEFAULT_LEVELS, type LevelDefinition, type ChallengeData } from "@/components/gamification/GamificationComponents";

// ============================================================
// Level Config State
// ============================================================

interface LevelConfig extends LevelDefinition {
  enabled: boolean;
}

const defaultLevelConfigs: LevelConfig[] = DEFAULT_LEVELS.map((lvl) => ({
  ...lvl,
  enabled: true,
}));

// ============================================================
// Streak Config State
// ============================================================

interface StreakConfig {
  enabled: boolean;
  streakType: "daily" | "weekly";
  maxFreezes: number;
  freezeCostPoints: number;
  milestones: number[];
  milestoneXPBonus: number;
}

const defaultStreakConfig: StreakConfig = {
  enabled: true,
  streakType: "daily",
  maxFreezes: 3,
  freezeCostPoints: 50,
  milestones: [7, 14, 30, 60, 100],
  milestoneXPBonus: 50,
};

// ============================================================
// Challenge Template
// ============================================================

interface ChallengeTemplate {
  id: string;
  title: string;
  type: ChallengeData["type"];
  goal: number;
  durationDays: number;
  xpReward: number;
  enabled: boolean;
  recurring: boolean;
}

const defaultChallengeTemplates: ChallengeTemplate[] = [
  {
    id: "ct1",
    title: "Weekly Course Sprint",
    type: "courses_completed",
    goal: 2,
    durationDays: 7,
    xpReward: 150,
    enabled: true,
    recurring: true,
  },
  {
    id: "ct2",
    title: "Quiz Master",
    type: "quizzes_passed",
    goal: 5,
    durationDays: 14,
    xpReward: 200,
    enabled: true,
    recurring: true,
  },
  {
    id: "ct3",
    title: "Consistency Challenge",
    type: "login_streak",
    goal: 10,
    durationDays: 14,
    xpReward: 100,
    enabled: true,
    recurring: false,
  },
  {
    id: "ct4",
    title: "Monthly Points Goal",
    type: "points_earned",
    goal: 500,
    durationDays: 30,
    xpReward: 250,
    enabled: false,
    recurring: true,
  },
];

// ============================================================
// Component
// ============================================================

export default function GamificationConfigPage() {
  const [levels, setLevels] = useState<LevelConfig[]>(defaultLevelConfigs);
  const [streakConfig, setStreakConfig] = useState<StreakConfig>(defaultStreakConfig);
  const [challenges, setChallenges] = useState<ChallengeTemplate[]>(defaultChallengeTemplates);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateLevel = (level: number, field: keyof LevelConfig, value: any) => {
    setLevels((prev) =>
      prev.map((l) => (l.level === level ? { ...l, [field]: value } : l))
    );
    setSaved(false);
  };

  const updateChallenge = (id: string, field: keyof ChallengeTemplate, value: any) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
    setSaved(false);
  };

  const addChallenge = () => {
    const newId = `ct${Date.now()}`;
    setChallenges((prev) => [
      ...prev,
      {
        id: newId,
        title: "New Challenge",
        type: "courses_completed",
        goal: 1,
        durationDays: 7,
        xpReward: 100,
        enabled: true,
        recurring: false,
      },
    ]);
    setSaved(false);
  };

  const removeChallenge = (id: string) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
    setSaved(false);
  };

  const totalEnabledLevels = levels.filter((l) => l.enabled).length;
  const totalActiveChallenges = challenges.filter((c) => c.enabled).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Gamification Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure levels, streaks, and challenges for your learners
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnabledLevels}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streakConfig.enabled ? (
                <span className="text-success">Active</span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveChallenges}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Points / Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {levels[levels.length - 1]?.xpThreshold.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="levels">
        <TabsList>
          <TabsTrigger value="levels" className="gap-1.5">
            <Star className="h-4 w-4" />
            Levels
          </TabsTrigger>
          <TabsTrigger value="streaks" className="gap-1.5">
            <Flame className="h-4 w-4" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-1.5">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Levels Tab */}
        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>Level Definitions</CardTitle>
              <CardDescription>
                Define point thresholds and names for each level. Learners progress through
                levels as they earn points.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Active</TableHead>
                    <TableHead className="w-[60px]">Badge</TableHead>
                    <TableHead className="w-[80px]">Level</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[140px]">Points Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((lvl) => (
                    <TableRow
                      key={lvl.level}
                      className={!lvl.enabled ? "opacity-50" : ""}
                    >
                      <TableCell>
                        <Switch
                          checked={lvl.enabled}
                          onCheckedChange={(checked) =>
                            updateLevel(lvl.level, "enabled", checked)
                          }
                          disabled={lvl.level === 1}
                        />
                      </TableCell>
                      <TableCell>
                        <LevelBadge xp={lvl.xpThreshold} levels={levels} size="sm" />
                      </TableCell>
                      <TableCell className="font-medium">{lvl.level}</TableCell>
                      <TableCell>
                        <Input
                          value={lvl.name}
                          onChange={(e) =>
                            updateLevel(lvl.level, "name", e.target.value)
                          }
                          disabled={!lvl.enabled}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={lvl.xpThreshold}
                          onChange={(e) =>
                            updateLevel(
                              lvl.level,
                              "xpThreshold",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={!lvl.enabled || lvl.level === 1}
                          className="w-28"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Streak Configuration</span>
                <Switch
                  checked={streakConfig.enabled}
                  onCheckedChange={(checked) => {
                    setStreakConfig((prev) => ({ ...prev, enabled: checked }));
                    setSaved(false);
                  }}
                />
              </CardTitle>
              <CardDescription>
                Streaks motivate learners to engage consistently. Configure type,
                freezes, and milestone bonuses.
              </CardDescription>
            </CardHeader>
            <CardContent
              className={!streakConfig.enabled ? "opacity-50 pointer-events-none" : ""}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Streak Type</label>
                  <Select
                    value={streakConfig.streakType}
                    onValueChange={(v: "daily" | "weekly") => {
                      setStreakConfig((prev) => ({ ...prev, streakType: v }));
                      setSaved(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Daily = must do activity every day. Weekly = at least once per week.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Streak Freezes</label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={streakConfig.maxFreezes}
                    onChange={(e) => {
                      setStreakConfig((prev) => ({
                        ...prev,
                        maxFreezes: parseInt(e.target.value) || 0,
                      }));
                      setSaved(false);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Learners can use freezes to keep their streak alive on inactive days.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Freeze Cost (Points)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={streakConfig.freezeCostPoints}
                    onChange={(e) => {
                      setStreakConfig((prev) => ({
                        ...prev,
                        freezeCostPoints: parseInt(e.target.value) || 0,
                      }));
                      setSaved(false);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Points deducted when a freeze is used. Set to 0 for free freezes.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Milestone Points Bonus
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={streakConfig.milestoneXPBonus}
                    onChange={(e) => {
                      setStreakConfig((prev) => ({
                        ...prev,
                        milestoneXPBonus: parseInt(e.target.value) || 0,
                      }));
                      setSaved(false);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Bonus points awarded at each streak milestone (7, 14, 30, 60, 100 days).
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium">Streak Milestones</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {streakConfig.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                    >
                      <Flame className="h-3 w-3 text-warning" />
                      {m} {streakConfig.streakType === "daily" ? "days" : "weeks"}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Challenge Templates</CardTitle>
                  <CardDescription>
                    Create configurable challenges that are automatically assigned to learners.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={addChallenge} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Challenge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Active</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[160px]">Type</TableHead>
                    <TableHead className="w-[100px]">Goal</TableHead>
                    <TableHead className="w-[100px]">Duration</TableHead>
                    <TableHead className="w-[100px]">Pts Reward</TableHead>
                    <TableHead className="w-[80px]">Recurring</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((ch) => (
                    <TableRow
                      key={ch.id}
                      className={!ch.enabled ? "opacity-50" : ""}
                    >
                      <TableCell>
                        <Switch
                          checked={ch.enabled}
                          onCheckedChange={(checked) =>
                            updateChallenge(ch.id, "enabled", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={ch.title}
                          onChange={(e) =>
                            updateChallenge(ch.id, "title", e.target.value)
                          }
                          disabled={!ch.enabled}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ch.type}
                          onValueChange={(v) =>
                            updateChallenge(ch.id, "type", v)
                          }
                          disabled={!ch.enabled}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="courses_completed">Courses</SelectItem>
                            <SelectItem value="quizzes_passed">Quizzes</SelectItem>
                            <SelectItem value="login_streak">Login Streak</SelectItem>
                            <SelectItem value="points_earned">Points</SelectItem>
                            <SelectItem value="time_spent">Time Spent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={ch.goal}
                          onChange={(e) =>
                            updateChallenge(
                              ch.id,
                              "goal",
                              parseInt(e.target.value) || 1
                            )
                          }
                          disabled={!ch.enabled}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={1}
                            value={ch.durationDays}
                            onChange={(e) =>
                              updateChallenge(
                                ch.id,
                                "durationDays",
                                parseInt(e.target.value) || 1
                              )
                            }
                            disabled={!ch.enabled}
                            className="w-16"
                          />
                          <span className="text-xs text-muted-foreground">d</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={ch.xpReward}
                          onChange={(e) =>
                            updateChallenge(
                              ch.id,
                              "xpReward",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={!ch.enabled}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={ch.recurring}
                          onCheckedChange={(checked) =>
                            updateChallenge(ch.id, "recurring", checked)
                          }
                          disabled={!ch.enabled}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChallenge(ch.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Delete challenge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {challenges.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No challenge templates. Click &quot;Add Challenge&quot; to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
