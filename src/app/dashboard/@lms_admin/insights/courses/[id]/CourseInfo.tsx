import Image from 'next/image'
import CourseInfoSkeleton from './CourseInfoSkeleton'
import CourseInfoError from './CourseInfoError'
import TwoColumnLearningOutcomesCard from '@/components/shared/TwoColumnLearningOutcomesCard'

interface CourseInfoProps {
    id: number
    thumbnail: string
    name: string
    category: string
    created_at: string
    created_by_name: string
    enrollments: number
    completions: number
    coassemble_id: string
    outcomes: { id: string; text: string }[]
}

interface CourseInfoComponentProps {
    courseData: CourseInfoProps
    loading: boolean
    errorMessage: string
}

function CourseInfo({ courseData, loading, errorMessage }: CourseInfoComponentProps) {
    if (loading) return <CourseInfoSkeleton />
    if (errorMessage) return <CourseInfoError errorMessage={errorMessage} />


    return (
        <>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Image
                        src={courseData.thumbnail}
                        alt={courseData.name}
                        width={600}
                        height={400}
                        className="rounded-lg object-cover w-full aspect-video"
                    />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold exclude-weglot">{courseData.name}</h2>
                    <p><strong>Category:</strong> <span className='exclude-weglot'>{courseData.category}</span></p>
                    <p><strong>Created at:</strong> <span className='exclude-weglot'>{courseData.created_at}</span></p>
                    <p><strong>Created by:</strong> <span className='exclude-weglot'>{courseData.created_by_name}</span></p>
                    <p><strong>Total Enrollments:</strong> <span className='exclude-weglot'>{courseData.enrollments}</span></p>
                    <p><strong>Total Completions:</strong> <span className='exclude-weglot'>{courseData.completions}</span></p>
                </div>
            </div>
            <TwoColumnLearningOutcomesCard outcomes={courseData.outcomes ?? []} />
        </>
    )
}

export default CourseInfo
