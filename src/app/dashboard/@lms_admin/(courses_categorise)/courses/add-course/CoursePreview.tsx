import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Clock } from 'lucide-react';

interface CoursePreviewProps {
    title: string;
    category: string;
    level: string;
    completionTime: number;
    imagePreview: string | null;
}

export function CoursePreview({ title, category, level, completionTime, imagePreview }: CoursePreviewProps) {
    
    const formatCompletionTime = (completionTime: string | number | undefined): string => {
        if (!completionTime) return "Duration"; // If no value, return "Duration"

        // Convert to string if it's a number
        const timeStr = completionTime?.toString();

        // Check if it already includes "min", "m", or any other characters
        if (/[a-zA-Z]/.test(timeStr)) {
            return timeStr; // Return as is if it contains any letters (like 'm' or 'min')
        }

        // Otherwise, append "min"
        return `${timeStr} min`;
    };

    return (
        <Card className="overflow-hidden">
            <div className="aspect-video relative">
                <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Course preview"
                    fill
                    className="object-fit  "
                />
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{title || "Course Title"}</h3>
                <p className="text-sm text-muted-foreground mb-2">{category || "Category"}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <BarChart className="w-4 h-4 mr-1" />
                        <span>{level || "Level"}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatCompletionTime(completionTime)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}