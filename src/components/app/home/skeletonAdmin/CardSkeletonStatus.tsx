import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CardSkeletonStatus() {
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-muted" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton shimmer className="h-4 w-20" />
                <Skeleton shimmer className="h-9 w-9 rounded-lg" />
            </CardHeader>
            <CardContent>
                <Skeleton shimmer className="h-8 w-16 mb-3" />
                <Skeleton shimmer className="h-5 w-28 rounded-full" />
            </CardContent>
        </Card>
    )
}
