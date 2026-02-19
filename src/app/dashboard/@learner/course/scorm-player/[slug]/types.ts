export interface ScormDataType {
  lessonLocation?: string;
  lessonStatus?: string;
  score?: {
    raw?: string;
    min?: string;
    max?: string;
  };
  progressMeasure?: string;
  sessionTime?: string;
  suspendData?: string;
}

export interface CourseUserDetails {
  user_name: string;
  user_id: string;
  course_name: string;
  scorm_data: ScormDataType;
  progress: string;
  launch_path: string;
  course_id: number;
  organization_id: number;
}

export interface PlayerProps {
  courseData?: CourseUserDetails;
  slug?: string;
  showSidebar?: boolean;
  isGenerating?: boolean;
  isSharing?: boolean;
  baseUrl: string;
  launch_path?: string;
} 