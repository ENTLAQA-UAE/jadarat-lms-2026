export interface ScormScore {
  raw: string
  min: string
  max: string
}

export interface ScormData {
  lessonStatus: string
  score: ScormScore
  sessionTime: string
  suspendData: string
  progressMeasure: string
  lessonLocation: string
}

export interface ScormPlayerProps {
  slug: string
  showSidebar?: boolean
  customSidebar?: React.ReactNode
  className?: string
  scorm_data?: Partial<ScormData>
  progress?: string
  learnerId: string
  courseName: string
  learnerName: string
  isGenerating?: boolean
  isSharing?: boolean
} 