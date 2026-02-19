import CourseInfo from './CourseInfo'
import BarChar from './BarChar'
import ActionButtonsDetails from '@/components/ActionButtonDetails'
import CourseDetailsTable from './table/CourseDetailsTable'
import { enrollmentsCompletionsPerMonth, fetchCourseSummary, getEnrollmentsByCourse } from '@/action/lms-admin/insights/courses/course/courseAction'
import BackButton from '@/components/BackButton'

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
        <div className="container mx-auto p-4 space-y-8">
            <BackButton />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Course Details</h1>
                <div className="space-x-2">
                    <ActionButtonsDetails data={enrollmentsData} courseInfo={data[0]} enrollmentCompletionData={enrollmentCompletionData} />
                </div>
            </div>

            <CourseInfo courseData={data[0]} loading={loading} errorMessage={errorMessage} />

            <BarChar enrollmentCompletionData={enrollmentCompletionData} loading={loadingEnrollmentCompletionData} errorMessage={errorMessageEnrollmentCompletionData} />

            <div className="my-4">
                <CourseDetailsTable enrollments={enrollmentsData} loading={loadingEnrollments} errorMessage={errorMessageEnrollments} />
            </div>
        </div>
    )
}
