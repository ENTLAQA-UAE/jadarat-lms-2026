export interface CourseDetailsPageProps {
    id: number
    name: string
    ar_name: string
}

export interface CourseFormData {
    title: string;
    description: string;
    category_id: number;    // Add this line
    category_name: string;  // Add this line
    level: string;
    completionTime: string;
    slug: string;
    imagePreview: string | null;
}

interface CourseFormProps {
    onScormFileUpdate: (file: File | null) => void;
}

// scorm enum
export enum ScormEnum {
    SCORM_1_2 = '1.2',
    SCORM_2004 = '2004',
    AICC = 'aicc',
    CMI_5 = 'cmi5',
    XAPI = 'xapi',
}