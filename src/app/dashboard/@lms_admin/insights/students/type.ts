export type Student = {
  learner_id: number;
  learner_name: string;
  learner_email: string;
  learner_department: string;
  learner_group_name: string;
  enrollment_course_count?: number;
  completed_course_count?: number;
  enrollment_date?: string;
};