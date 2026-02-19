export type Course = {
    course_id: number;
    name: string;
    created_at: string;
    created_by_name: string;
    thumbnail: string;
    category: string;
    category_image: string;
    category_id: number;    // Add this line
    category_name: string;  // Add this line
}