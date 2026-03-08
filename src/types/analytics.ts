export interface BlockEngagementSummary {
  blockId: string;
  blockType: string;
  lessonId: string;
  moduleId: string;
  avgTimeSpentMs: number;
  interactionCount: number;
  completionRate: number;
  dropOffRate: number;
}

export interface LessonPerformance {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  avgCompletionTimeMs: number;
  completionRate: number;
  avgQuizScore: number | null;
  blockCount: number;
  dropOffBlockIndex: number | null;
}

export interface ContentEffectivenessReport {
  courseId: number;
  generatedAt: string;
  totalEnrollments: number;
  overallCompletionRate: number;
  avgCompletionDays: number;
  lessonPerformance: LessonPerformance[];
  blockEngagement: BlockEngagementSummary[];
  topPerformingBlockTypes: { blockType: string; avgCompletionRate: number }[];
  problematicBlocks: { blockId: string; reason: string; metric: number }[];
}
