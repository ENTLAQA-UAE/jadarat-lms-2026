export interface EnrollmentsType {
    enrollment_id: number;
    user_id: string; // Changed from number to string for consistency
    name: string;
    course: string;
    thumbnail?: string; // Made optional as it's not in the other interface
    enrollment_date: string;
    progress_percentage: number;
    completion_date?: string; // Made optional as it's not in the other interface
    course_id?: number; // Made optional as it's not in the other interface
    email?: string; // Added to match the other interface
    department?: string; // Added to match the other interface
    group_name?: string; // Added to match the other interface
}