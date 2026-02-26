export interface CoursesType {
    id: number;
    name: string;
    description: string;
    thumbnail: string;
    percentage?: number;
    category?: number;
    enrolled_at?: Date;
    timeline?: string;
    level?: string;
    slug?: string;
    category_name: string;
    category_ar_name: string;
    course_id: number;
    title: string;
    isscorm?: boolean;
    authoring_type?: 'native' | 'scorm';
    content_id?: string;
}

export type Category = {
    ar_name: string;
    created_at: string;
    id: number;
    image: string;
    name: string;
    organization_id: number;
  };

export interface FullCourseTypes {
    id: number;
    created_at: string;
    organization_id: number;
    title: string;
    description: string;
    level: string;
    category?: number;
    languages: Language[];
    thumbnail: string;
    timeline: string;
    category_id: number;
    slug?: string;
    name?: string;
    percentage?: number;
    enrolled_at?: Date;
    outcomes: { id: string; text: string }[]
    category_name: string;
    category_ar_name: string;
    course_id: number;
    authoring_type?: 'native' | 'scorm';
    content_id?: string;
}

export interface Language {
    url: string;
    language: string;
}

export interface SliderType {
    id: number;
    created_at: string;
    organization_id: number;
    created_by: string;
    link: any;
    image: string;
}
