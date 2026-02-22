'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// -- Course Publishing Statuses --
export type CoursePublishStatus = 'draft' | 'private' | 'published';

const courseStatusConfig: Record<CoursePublishStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/10',
  },
  private: {
    label: 'Private',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
  },
  published: {
    label: 'Published',
    className: 'bg-success/10 text-success border-success/30 hover:bg-success/10',
  },
};

// -- Enrollment Statuses --
export type EnrollmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'overdue';

const enrollmentStatusConfig: Record<EnrollmentStatus, { label: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-info/10 text-info border-info/30 hover:bg-info/10',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/10 text-success border-success/30 hover:bg-success/10',
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/10',
  },
  expired: {
    label: 'Expired',
    className: 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/10',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/10',
  },
};

interface CourseStatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export function CourseStatusBadge({ status, className }: CourseStatusBadgeProps) {
  const key = (status?.toLowerCase() ?? 'draft') as CoursePublishStatus;
  const config = courseStatusConfig[key] ?? courseStatusConfig.draft;

  return (
    <Badge className={cn(config.className, 'whitespace-nowrap', className)}>
      {config.label}
    </Badge>
  );
}

interface EnrollmentStatusBadgeProps {
  status: string | null | undefined;
  progress?: number;
  className?: string;
}

export function EnrollmentStatusBadge({ status, progress, className }: EnrollmentStatusBadgeProps) {
  // Derive status from progress if not explicitly set
  let resolvedStatus: EnrollmentStatus;
  if (status && status in enrollmentStatusConfig) {
    resolvedStatus = status as EnrollmentStatus;
  } else if (status === 'completed') {
    resolvedStatus = 'completed';
  } else if (progress !== undefined) {
    if (progress >= 100) resolvedStatus = 'completed';
    else if (progress > 0) resolvedStatus = 'in_progress';
    else resolvedStatus = 'not_started';
  } else {
    resolvedStatus = 'not_started';
  }

  const config = enrollmentStatusConfig[resolvedStatus];

  return (
    <Badge className={cn(config.className, 'whitespace-nowrap', className)}>
      {config.label}
    </Badge>
  );
}
