import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FC, HTMLProps } from "react"

const PerformanceCard: FC<{
    completionRate?: number | null,
    compeletionDays?: number,
    enrollementsCount?: string,
    progressBarContainerClassName?: HTMLProps<HTMLDivElement>["className"],
    progressBarFillClassName?: HTMLProps<HTMLDivElement>["className"],
    avgCompletionDays?:number
}> = ({
    completionRate,
    enrollementsCount = 0,
    progressBarContainerClassName = "",
    progressBarFillClassName = "",
    avgCompletionDays= 0
}) => {
        return (
            <Card className="w-full max-w-4xl max-h-[420px]" x-chunk="dashboard-01-chunk-5">
                <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    <div className="bg-muted dark:bg-muted rounded-lg p-4 flex items-center gap-4">
                        <div className="bg-primary rounded-full p-2">
                            <BarChartIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="w-full">
                            <h3 className="text-lg font-medium">Completion Rate</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{(completionRate)?.toLocaleString()}%</p>
                                <Progress value={completionRate} className={progressBarContainerClassName} progressClassName={progressBarFillClassName} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted dark:bg-muted rounded-lg p-4 flex items-center gap-4">
                        <div className="bg-primary rounded-full p-2">
                            <ClockIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Average Completion</h3>
                            <p className="text-2xl font-bold">{avgCompletionDays.toLocaleString()} Days</p>
                        </div>
                    </div>
                    <div className="bg-muted dark:bg-muted rounded-lg p-4 flex items-center gap-4">
                        <div className="bg-primary rounded-full p-2">
                            <UserIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Active Enrollments</h3>
                            <p className="text-2xl font-bold">{enrollementsCount.toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

function BarChartIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    )
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function UserIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}

export default PerformanceCard;