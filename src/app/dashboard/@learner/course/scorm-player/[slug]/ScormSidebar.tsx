'use client'

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertCircle, Circle, Timer, BarChart2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import lzwCompress from 'lzwcompress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { updateCourseProgress } from "@/action/students/studentsActions"

interface ScormSidebarProps {
  data: {
    lessonStatus: string
    score: {
      raw: string
      min: string
      max: string
    }
    sessionTime: string
    suspendData: string
    progressMeasure: string
    lessonLocation: string
  }
  slug: string
  courseId: number | null
}

function formatSessionTime(time: string) {
  if (!time) return "00:00:00"
  const match = time.match(/^(\d+):(\d{2}):(\d{2})/)
  if (!match) return time
  const [_, hours, minutes, seconds] = match
  const cleanHours = hours.replace(/^0+/, '') || '0'
  return `${cleanHours}:${minutes}:${seconds}`
}

export function ScormSidebar({ data, slug, courseId }: ScormSidebarProps) {
  const [progress, setProgress] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const formattedTime = formatSessionTime(data.sessionTime)

  let parsedData = null
  try {
    if (data.suspendData) {
      const suspendJson = JSON.parse(data.suspendData)
      if (suspendJson?.d) {
        const decompressedData = lzwCompress.unpack(suspendJson.d)
        parsedData = JSON.parse(decompressedData)
      }
    }
  } catch (error) {
    console.warn('Failed to parse suspend data:', error)
  }

  const [lastLocation, setLastLocation] = useState<string>(data.lessonLocation)

  useEffect(() => {
    if (parsedData?.progress?.p) {
      setIsAnimating(true)
      setProgress(Math.round(parsedData.progress.p))
      const timer = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [parsedData])


  useEffect(() => {
    const updateProgress = async () => {
      const lessonStatusLower = data.lessonStatus.toLowerCase()
      const shouldUpdate = courseId && (
        lessonStatusLower === 'passed' ||
        lessonStatusLower === 'completed' ||
        progress > 0 ||
        data.lessonLocation !== lastLocation
      )

      if (shouldUpdate) {
        const progressValue = ['passed', 'completed'].includes(lessonStatusLower) ? 100 : progress
        const { success, error } = await updateCourseProgress(
          courseId, 
          progressValue, 
          JSON.stringify(data) as any
        )
        if (error) {
          console.error('Error updating course progress:', error)
        }
        if (success) {
          setLastLocation(data.lessonLocation)
        }
      }
    }
    updateProgress()
  }, [progress, courseId, data.lessonStatus, slug, data.lessonLocation, lastLocation])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'incomplete':
        return <Circle className="h-4 w-4 text-warning" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20'
      case 'incomplete':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted'
    }
  }

  return (
    <TooltipProvider>
      <Card className="w-full backdrop-blur-sm bg-card/80">
        <CardHeader className="pb-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <h3 className="font-semibold tracking-tight">Course Progress</h3>
            <Badge
              variant="outline"
              className={cn(
                "transition-colors duration-200",
                getStatusColor(data.lessonStatus)
              )}
            >
              {getStatusIcon(data.lessonStatus)}
              <span className="ml-1 capitalize">{data.lessonStatus}</span>
            </Badge>
          </div>
          <Progress
            value={data.lessonStatus === 'passed' || data.lessonStatus === 'completed' ? 100 : progress ?? 0}
            className={cn(
              "h-2 transition-all duration-500",
              isAnimating && "opacity-70"
            )}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{data.lessonStatus === 'passed' ? 100 : progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Course completion progress</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formattedTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time spent in current session</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator />


            {/* Detailed Progress */}
            {parsedData?.sections && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Section Progress</h4>
                <div className="space-y-3">
                  {Object.entries(parsedData.sections).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{value.title || key}</span>
                        <span className="text-muted-foreground ml-2">
                          {data.lessonStatus === 'passed' || data.lessonStatus === 'completed' ? 100 : Math.round(value.progress * 100)}%
                        </span>
                      </div>
                      <Progress value={data.lessonStatus === 'passed' || data.lessonStatus === 'completed' ? 100 : value.progress * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

