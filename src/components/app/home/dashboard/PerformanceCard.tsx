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
        const metrics = [
            {
                icon: <BarChartIcon className="w-5 h-5 text-primary-foreground" />,
                iconBg: "bg-gradient-to-br from-primary to-primary/70",
                title: "Completion Rate",
                value: `${(completionRate)?.toLocaleString()}%`,
                hasProgress: true,
            },
            {
                icon: <ClockIcon className="w-5 h-5 text-primary-foreground" />,
                iconBg: "bg-gradient-to-br from-sky to-sky/70",
                title: "Average Completion",
                value: `${avgCompletionDays.toLocaleString()} Days`,
                hasProgress: false,
            },
            {
                icon: <UserIcon className="w-5 h-5 text-primary-foreground" />,
                iconBg: "bg-gradient-to-br from-success to-success/70",
                title: "Active Enrollments",
                value: enrollementsCount.toLocaleString(),
                hasProgress: false,
            },
        ];

        return (
            <Card className="w-full max-w-4xl max-h-[420px]" x-chunk="dashboard-01-chunk-5">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                    {metrics.map((metric) => (
                        <div
                            key={metric.title}
                            className="group/metric rounded-lg border border-border/50 bg-muted/20 p-3.5 flex items-center gap-3 hover:bg-muted/40 transition-all duration-150"
                        >
                            <div className={`${metric.iconBg} rounded-lg p-2 shadow-xs`}>
                                {metric.icon}
                            </div>
                            <div className="w-full min-w-0">
                                <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xl font-semibold tracking-tight">{metric.value}</p>
                                    {metric.hasProgress && (
                                        <Progress
                                            value={completionRate}
                                            className={`flex-1 h-2.5 ${progressBarContainerClassName}`}
                                            progressClassName={progressBarFillClassName}
                                            gradient
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
