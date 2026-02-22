'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// -- Course Publishing Statuses --
export type CoursePublishStatus = 'draft' | 'private' | 'published';

const courseStatusConfig: Record<CoursePublishStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100',
  },
  private: {
    label: 'Private',
    className: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100',
  },
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
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
    className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-100',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
  },
  expired: {
    label: 'Expired',
    className: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-100',
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
