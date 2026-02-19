import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function CardSkeletonStatus() {
    return (
        <Card >
            <CardHeader className="flex flex-row  gap-6 items-center justify-between space-y-0 pb-2">
                <Skeleton className="w-[40px] h-[14px]"></Skeleton>
                <Skeleton className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <Skeleton className="w-[80px] h-[20px] my-4"></Skeleton>
                <Skeleton className="text-xs w-[100px] h-[14px] my-2 text-muted-foreground"></Skeleton>
            </CardContent>
        </Card>
    )
}
