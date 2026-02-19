import React, { ForwardRefExoticComponent, ReactElement, ReactNode, RefAttributes } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, LucideProps } from 'lucide-react';


interface StatType {
    title: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    value: string;
    percent: string;
    trend: string;
}

function StatsCard({ stat }: { stat: StatType }) {
    return (
        <Card >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                    {stat.trend === "up" ? (
                        <ArrowUpIcon className="inline h-4 w-4 text-green-500" />
                    ) : (
                        <ArrowDownIcon className="inline h-4 w-4 text-red-500" />
                    )}
                    {stat.percent} compared to last month
                </p>
            </CardContent>
        </Card>
    )
}

export default StatsCard