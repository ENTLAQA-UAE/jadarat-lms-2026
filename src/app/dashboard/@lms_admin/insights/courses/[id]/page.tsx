import CourseInfo from './CourseInfo'
import BarChar from './BarChar'
import ActionButtonsDetails from '@/components/ActionButtonDetails'
import CourseDetailsTable from './table/CourseDetailsTable'
import { enrollmentsCompletionsPerMonth, fetchCourseSummary, getEnrollmentsByCourse } from '@/action/lms-admin/insights/courses/course/courseAction'
import DetailPageLayout from '@/components/shared/DetailPageLayout'

interface EnrollmentCompletionData {
    month: string
    enrollments: number
    completions: number
}


export default async function CoursePage({ params }: { params: { id: number } }) {
    // Fetch course summary using the provided ID
    const { loading, data, errorMessage } = await fetchCourseSummary(params.id)
    const { loading: loadingEnrollmentCompletionData, data: enrollmentCompletionData, errorMessage: errorMessageEnrollmentCompletionData } = await enrollmentsCompletionsPerMonth(params.id)
    const { loading: loadingEnrollments, data: enrollmentsData, errorMessage: errorMessageEnrollments } = await getEnrollmentsByCourse(params.id)
    return (
        <DetailPageLayout
            title="Course Details"
            backHref="/dashboard/courses"
            actions={<ActionButtonsDetails data={enrollmentsData} courseInfo={data[0]} enrollmentCompletionData={enrollmentCompletionData} />}
        >
            <CourseInfo courseData={data[0]} loading={loading} errorMessage={errorMessage} />

            <BarChar enrollmentCompletionData={enrollmentCompletionData} loading={loadingEnrollmentCompletionData} errorMessage={errorMessageEnrollmentCompletionData} />

            <div className="my-4">
                <CourseDetailsTable enrollments={enrollmentsData} loading={loadingEnrollments} errorMessage={errorMessageEnrollments} />
            </div>
        </DetailPageLayout>
    )
}
