export const dynamic = 'force-dynamic'

import { fetchUserData } from '@/action/authAction';
import EditCourseDetails from './EditCourse'
import { fetchAllCategories } from '@/action/categories/categoriesActions'
import { getCourseById } from '@/action/lms-admin/insights/courses/course/courseAction'
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { CourseUserDetails } from '@/app/dashboard/@learner/course/scorm-player/[slug]/types';
import { getAiAndDocumentBuilder } from '@/action/organization/organizationAction';

interface Category {
    id: number;
    name: string;
    ar_name: string
}
interface OrganizationFeatures {
    create_courses: boolean;
}
async function page({ params }: { params: { id: string } }) {
    try {
        const host = headers().get('host')
        const baseUrl = process.env.NODE_ENV === 'development' ? `http://${host}` : `https://${host}`
        
        // Check user role
        const { user_role, organization_id } = await fetchUserData();
        if (user_role !== 'LMSAdmin') {
            redirect('/dashboard/courses')
        }

        // Fetch data in parallel using Promise.all
        const [categoriesResponse, courseResponse] = await Promise.all([
            fetchAllCategories(),
            getCourseById(parseInt(params.id))
        ]);

        const categories: Category[] = categoriesResponse;
        const { data: courseData, errorMessage } = courseResponse;

        if (errorMessage) {
            throw new Error(`Error fetching course data: ${errorMessage}`);
        }

        // Initialize scormData
        let scormData = "";
        
        if (courseData[0].is_scorm) {
            const supabase = await createClient();
            const { data, error: courseError } = await supabase
                .from("courses")
                .select("launch_path")
                .eq("id", parseInt(params.id))
                .single();

            if (courseError) {
                throw new Error(`Error fetching SCORM data: ${courseError.message}`);
            }
            
            scormData = data.launch_path;
        }

        const features = await getAiAndDocumentBuilder(organization_id) as OrganizationFeatures;
        if (!features.create_courses) {
            return redirect('/dashboard/courses')
        }


        return (
            <EditCourseDetails 
                categories={categories} 
                courseData={courseData} 
                courseId={parseInt(params.id)} 
                baseUrl={baseUrl} 
                launch_path={scormData} 
                features={features}
            />
        )
    } catch (error) {
        console.error("Error in page component:", error);
        throw error; // Let Next.js error boundary handle it
    }
}

export default page
