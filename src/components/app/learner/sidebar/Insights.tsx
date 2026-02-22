import type { CoursesType } from "@/app/home/types"
import { Star, BookOpen, Award, LogIn, Flame, Trophy, BarChart3 } from "lucide-react"
import Link from "next/link"
import { LevelBadge, LevelProgress, getCurrentLevel } from "@/components/gamification/GamificationComponents"

interface InsightsProps {
 courses: CoursesType[]
}

// Mock points data — will be replaced with real API data in Phase 2
const mockPoints = {
 total: 435,
 transactions: [
  { id: 1, action: "Course Completed", points: 100, date: "2025-02-20", icon: "book" },
  { id: 2, action: "Certificate Earned", points: 75, date: "2025-02-19", icon: "award" },
  { id: 3, action: "Quiz Passed", points: 50, date: "2025-02-18", icon: "star" },
  { id: 4, action: "Daily Login", points: 5, date: "2025-02-18", icon: "login" },
  { id: 5, action: "Course Started", points: 10, date: "2025-02-17", icon: "book" },
 ],
}

// Mock XP/gamification data — will be replaced with real API data in Phase 2
const mockXP = 1350
const mockStreak = 7

const transactionIcon: Record<string, React.ReactNode> = {
 book: <BookOpen className="h-3.5 w-3.5 text-green-600" />,
 award: <Award className="h-3.5 w-3.5 text-orange-500" />,
 star: <Star className="h-3.5 w-3.5 text-yellow-500" />,
 login: <LogIn className="h-3.5 w-3.5 text-blue-500" />,
}

export function Insights({ courses }: InsightsProps) {
 const currentLevel = getCurrentLevel(mockXP)

 return (
  <div>
   <h3 className="mb-4 text-lg font-semibold">Insights</h3>
   <div className="grid gap-4">
    {/* Level & XP Card */}
    <Link href="/dashboard/achievements" className="block">
     <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
       <div className="flex items-center gap-2">
        <LevelBadge xp={mockXP} size="sm" />
        <div>
         <p className="text-sm font-semibold">{currentLevel.name}</p>
         <p className="text-[10px] text-muted-foreground">Level {currentLevel.level}</p>
        </div>
       </div>
       <div className="flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-bold">{mockStreak}</span>
       </div>
      </div>
      <LevelProgress xp={mockXP} />
     </div>
    </Link>

    {/* Learning Points Card */}
    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-sm">
     <div className="mb-1 flex items-center gap-2 text-sm font-medium">
      <Star className="h-4 w-4 text-primary" />
      Learning Points
     </div>
     <div className="text-3xl font-bold text-primary">
      {mockPoints.total}
     </div>
     <div className="mt-3 space-y-2">
      {mockPoints.transactions.slice(0, 3).map((tx) => (
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

    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Completed Courses</div>
     <div className="text-3xl font-bold">
      {courses.filter((e) => e.percentage === 100).length}
     </div>
    </div>
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Courses to Continue</div>
     <div className="text-3xl font-bold">
      {courses.filter((e) => e.percentage && e.percentage < 100 && e.percentage > 0).length}
     </div>
    </div>
    <div className="rounded-lg bg-background p-4 shadow-sm">
     <div className="mb-2 text-sm font-medium">Courses to Do</div>
     <div className="text-3xl font-bold">
      {courses.filter((e) => e.percentage === 0).length}
     </div>
    </div>

    {/* Leaderboard Rank */}
    <Link href="/dashboard/leaderboard" className="block">
     <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium">Leaderboard Rank</span>
       </div>
       <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">#5</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">of 48 learners</p>
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
