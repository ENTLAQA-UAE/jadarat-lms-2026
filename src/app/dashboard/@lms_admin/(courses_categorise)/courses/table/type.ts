export type CoursePublishStatus = 'draft' | 'private' | 'published';

export type Course = {
  course_id: number;
  name: string;
  thumbnail?: string;
  category: string;
  category_image?: string;
  created_at: string;
  created_by_name: string;
  editable: boolean;
  status: CoursePublishStatus | null;
};