export type EnrollmentStatusType =
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'failed'
    | 'expired'
    | 'overdue';

export interface EnrollmentsType {
    enrollment_id: number;
    user_id: string;
    name: string;
    course: string;
    thumbnail?: string;
    enrollment_date: string;
    progress_percentage: number;
    completion_date?: string;
    course_id?: number;
    email?: string;
    department?: string;
    group_name?: string;
    enrollment_status?: EnrollmentStatusType;
}