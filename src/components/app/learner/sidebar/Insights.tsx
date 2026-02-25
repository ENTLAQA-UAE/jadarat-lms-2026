import type { CoursesType } from "@/app/home/types"
import { Star, BookOpen, Award, LogIn, Flame, Trophy, BarChart3 } from "lucide-react"
import Link from "next/link"
import { LevelBadge, LevelProgress, getCurrentLevel } from "@/components/gamification/GamificationComponents"

interface InsightsProps {
 courses: CoursesType[]
}

// Mock data — will be replaced with real API data in Phase 2
// Points = XP (unified currency). Points drive levels, leaderboard, and progression.
const mockPoints = 1350
const mockStreak = 7

const mockRecentPoints = [
 { id: 1, action: "Course Completed", points: 100, icon: "book" },
 { id: 2, action: "Certificate Earned", points: 75, icon: "award" },
 { id: 3, action: "Quiz Passed", points: 50, icon: "star" },
 { id: 4, action: "Daily Login", points: 5, icon: "login" },
]

const transactionIcon: Record<string, React.ReactNode> = {
 book: <BookOpen className="h-3.5 w-3.5 text-success" />,
 award: <Award className="h-3.5 w-3.5 text-warning" />,
 star: <Star className="h-3.5 w-3.5 text-warning" />,
 login: <LogIn className="h-3.5 w-3.5 text-primary" />,
}

export function Insights({ courses }: InsightsProps) {
 const currentLevel = getCurrentLevel(mockPoints)

 return (
  <div>
   <h3 className="mb-4 text-lg font-semibold">Insights</h3>
   <div className="grid gap-4">
    {/* Points & Level Card (unified) */}
    <Link href="/dashboard/achievements" className="block">
     <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
       <div className="flex items-center gap-2">
        <LevelBadge xp={mockPoints} size="sm" />
        <div>
         <p className="text-sm font-semibold">{currentLevel.name}</p>
         <p className="text-tiny text-muted-foreground">Level {currentLevel.level}</p>
        </div>
       </div>
       <div className="flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-warning" />
        <span className="text-sm font-bold">{mockStreak}</span>
       </div>
      </div>
      <div className="flex items-center justify-between mb-2">
       <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 text-primary" />
        <span className="text-sm font-medium">{mockPoints.toLocaleString()} pts</span>
       </div>
      </div>
      <LevelProgress xp={mockPoints} />
      <div className="mt-3 space-y-1.5">
       {mockRecentPoints.slice(0, 3).map((tx) => (
        <div key={tx.id} className="flex items-center justify-between text-xs">
         <span className="flex items-center gap-1.5 text-muted-foreground">
          {transactionIcon[tx.icon]}
          {tx.action}
         </span>
         <span className="font-medium text-primary">+{tx.points}</span>
        </div>
       ))}
      </div>
     </div>
    </Link>

    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Completed Courses</div>
     <div className="text-xl font-semibold tracking-tight">
      {courses.filter((e) => e.percentage === 100).length}
     </div>
    </div>
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Courses to Continue</div>
     <div className="text-xl font-semibold tracking-tight">
      {courses.filter((e) => e.percentage && e.percentage < 100 && e.percentage > 0).length}
     </div>
    </div>
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Courses to Do</div>
     <div className="text-xl font-semibold tracking-tight">
      {courses.filter((e) => e.percentage === 0).length}
     </div>
    </div>

    {/* Badges Card */}
    <Link href="/dashboard/achievements" className="block">
     <div className="rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/10 dark:to-primary/10 border border-accent/20 dark:border-accent/20 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-accent dark:text-accent" />
        <span className="text-sm font-medium">Badges</span>
       </div>
       <span className="text-2xl font-bold text-accent dark:text-accent">4/12</span>
      </div>
      <p className="text-tiny text-muted-foreground mt-1">badges earned</p>
     </div>
    </Link>

    {/* Leaderboard Rank */}
    <Link href="/dashboard/leaderboard" className="block">
     <div className="rounded-lg bg-gradient-to-br from-warning/10 to-warning/20 dark:from-warning/10 dark:to-warning/20 border border-warning/20 dark:border-warning/20 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-warning dark:text-warning" />
        <span className="text-sm font-medium">Leaderboard Rank</span>
       </div>
       <span className="text-2xl font-bold text-warning dark:text-warning">#5</span>
      </div>
      <p className="text-tiny text-muted-foreground mt-1">of 48 learners</p>
     </div>
    </Link>

    {/* Achievements Link */}
    <Link href="/dashboard/achievements">
     <div className="rounded-lg border border-primary/20 p-3 flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
      <Trophy className="h-4 w-4" />
      View All Achievements
     </div>
    </Link>
   </div>
  </div>
 )
}
