"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Star, BookOpen, LogIn, PlayCircle, Award, Trophy, Save } from "lucide-react"

interface PointAction {
  id: string
  action: string
  description: string
  points: number
  enabled: boolean
  icon: React.ReactNode
}

const defaultActions: PointAction[] = [
  {
    id: "course_completed",
    action: "Course Completed",
    description: "Awarded when a learner finishes a course",
    points: 100,
    enabled: true,
    icon: <BookOpen className="h-4 w-4 text-success" />,
  },
  {
    id: "quiz_passed",
    action: "Quiz Passed",
    description: "Awarded when a learner passes a quiz",
    points: 50,
    enabled: true,
    icon: <Star className="h-4 w-4 text-yellow-500" />,
  },
  {
    id: "daily_login",
    action: "Daily Login",
    description: "Awarded on first login each day",
    points: 5,
    enabled: true,
    icon: <LogIn className="h-4 w-4 text-primary" />,
  },
  {
    id: "course_started",
    action: "Course Started",
    description: "Awarded when a learner begins a new course",
    points: 10,
    enabled: true,
    icon: <PlayCircle className="h-4 w-4 text-accent" />,
  },
  {
    id: "certificate_earned",
    action: "Certificate Earned",
    description: "Awarded when a learner earns a certificate",
    points: 75,
    enabled: true,
    icon: <Award className="h-4 w-4 text-orange-500" />,
  },
  {
    id: "perfect_quiz_score",
    action: "Perfect Quiz Score",
    description: "Bonus for scoring 100% on a quiz",
    points: 25,
    enabled: false,
    icon: <Trophy className="h-4 w-4 text-amber-500" />,
  },
]

export default function PointsConfigPage() {
  const [actions, setActions] = useState<PointAction[]>(defaultActions)
  const [saved, setSaved] = useState(false)

  const updatePoints = (id: string, points: number) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, points: Math.max(0, points) } : a))
    )
    setSaved(false)
  }

  const toggleEnabled = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
    setSaved(false)
  }

  const handleSave = () => {
    // Mock save — will connect to API in Phase 2
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalEnabledActions = actions.filter((a) => a.enabled).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Points Configuration</h1>
          <p className="text-muted-foreground">
            Configure how many points learners earn for each action. Points drive levels, leaderboard rankings, and badge progression.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.length}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnabledActions}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Earnable / Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actions
                .filter((a) => a.enabled && ["course_completed", "certificate_earned", "course_started"].includes(a.id))
                .reduce((sum, a) => sum + a.points, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Point Actions</CardTitle>
          <CardDescription>
            Set point values and enable or disable each action type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id} className={!action.enabled ? "opacity-50" : ""}>
                  <TableCell>
                    <Switch
                      checked={action.enabled}
                      onCheckedChange={() => toggleEnabled(action.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {action.icon}
                      {action.action}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {action.description}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={action.points}
                      onChange={(e) => updatePoints(action.id, parseInt(e.target.value) || 0)}
                      disabled={!action.enabled}
                      className="w-20"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
