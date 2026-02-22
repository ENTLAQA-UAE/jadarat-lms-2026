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
        <div className="space-y-6">
            <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                    <div className="overflow-hidden rounded-lg">
                        <Image
                            src={courseData.thumbnail}
                            alt={courseData.name}
                            width={600}
                            height={400}
                            className="rounded-lg object-cover w-full aspect-video hover:scale-[1.02] transition-transform duration-300"
                        />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold exclude-weglot">{courseData.name}</h2>
                        <div className="space-y-3 text-sm">
                            <p className="text-muted-foreground"><strong className="text-foreground">Category:</strong> <span className='exclude-weglot'>{courseData.category}</span></p>
                            <p className="text-muted-foreground"><strong className="text-foreground">Created at:</strong> <span className='exclude-weglot'>{courseData.created_at}</span></p>
                            <p className="text-muted-foreground"><strong className="text-foreground">Created by:</strong> <span className='exclude-weglot'>{courseData.created_by_name}</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-2xl font-bold exclude-weglot">{courseData.enrollments}</p>
                                <p className="text-xs text-muted-foreground">Total Enrollments</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-2xl font-bold exclude-weglot">{courseData.completions}</p>
                                <p className="text-xs text-muted-foreground">Total Completions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TwoColumnLearningOutcomesCard outcomes={courseData.outcomes ?? []} />
        </div>
    )
}

export default CourseInfo
