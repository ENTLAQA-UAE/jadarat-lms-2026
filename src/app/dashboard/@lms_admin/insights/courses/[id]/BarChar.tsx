"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarCharType {
    month: string;
    enrollments: number;
    completions: number;
}

interface BarChartProps {
    enrollmentCompletionData: BarCharType[];
    loading: boolean;
    errorMessage: string;
}

function BarChar({ enrollmentCompletionData, loading, errorMessage }: BarChartProps) {
    if (loading) return <div>Loading...</div>;
    if (errorMessage) return <div>Error: {errorMessage}</div>;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Enrollments vs Completions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentCompletionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="enrollments" fill="#8884d8" />
                            <Bar dataKey="completions" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export default BarChar;
