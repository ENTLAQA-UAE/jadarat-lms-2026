export interface CourseData {
  month: string;
  course_count: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface Student {
  id: number;
  image: string;
  name: string;
  category: string;
  createdAt: string;
  createdBy: string;
  enrollments: number;
  completions: number;
  status: string;
}

export interface InsightsCourseColumnsProps {
  course_id: string;
  thumbnail: string;
  name: string; // Add this line
  category: string;
  created_at: string;
  created_by_name: string;
  enrollments: number;
  completions: number;
  status: string;
}

export interface InsightsCourseProps {
  barChartData: CourseData[];
  pieChartData: CategoryData[];
  barChartDataLoading:boolean
  pieChartDataLoading: boolean
  barChartError: string
  pieChartError: string
  courseStatusData?: CategoryData[];
}

