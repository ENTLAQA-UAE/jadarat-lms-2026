"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  XAxis,
  Bar,
} from "recharts";
import { InsightsCourseProps } from "./type";
import {
  CoursesByCategory,
  NewCoursesPerMonth,
} from "./InsightsCoursesSkeleton";
import { CircleX } from "lucide-react";
import CoursesDataInsightsTablePage from "./@table/page";
import { useSearchParams } from "next/navigation";

function generateDynamicColors(length: number): string[] {
  const hueStep = 360 / length; // evenly distribute hues
  const colors: string[] = [];

  for (let i = 0; i < length; i++) {
    const h = (i * hueStep + Math.random() * (hueStep / 3)) % 360;
    const s = 65 + Math.random() * 20; // saturation between 65 and 85
    const l = 50 + Math.random() * 10; // lightness between 50 and 60
    colors.push(hslToHex(h, s, l));
  }

  return colors;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const ErrorCard = ({ title, error }: { title: string; error: string }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-red-500 flex items-center">
        {title} <CircleX className="ml-2" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-red-500">{error}</p>
    </CardContent>
  </Card>
);

const BarChartCard = ({
  barChartData,
  dynamicColors,
}: {
  barChartData: any[];
  dynamicColors: string[];
}) => (
  <Card className="w-full flex flex-col justify-between">
    <CardHeader>
      <CardTitle>New Courses per Month</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barChartData}>
            <XAxis dataKey="month" />
            <Tooltip />
            <Bar dataKey="course_count" fill="#8884d8">
              {barChartData.map((data, index) => (
                <Cell
                  key={index}
                  fill={dynamicColors[index % dynamicColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const PieChartCard = ({
  pieChartData,
  dynamicColors,
}: {
  pieChartData: any[];
  dynamicColors: string[];
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Courses by Category</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="exclude-weglot">
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={dynamicColors[index % dynamicColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex  flex-wrap justify-center gap-2 mt-4">
        {pieChartData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-1"
              style={{
                backgroundColor: dynamicColors[index % dynamicColors.length],
              }}
            ></div>
            <span className="text-xs sm:text-sm exclude-weglot">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function InsightsCourse({
  barChartData,
  pieChartData,
  barChartDataLoading,
  pieChartDataLoading,
  pieChartError,
  barChartError,
}: InsightsCourseProps) {
  const dynamicColors = generateDynamicColors(
    Math.max(barChartData.length, pieChartData.length)
  );

  const searchParams = useSearchParams()

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Bar Chart Section */}
        {barChartError ? (
          <ErrorCard title="Error Loading Bar Chart" error={barChartError} />
        ) : barChartDataLoading ? (
          <NewCoursesPerMonth />
        ) : (
          <BarChartCard
            barChartData={barChartData}
            dynamicColors={dynamicColors}
          />
        )}

        {/* Pie Chart Section */}
        {pieChartError ? (
          <ErrorCard title="Error Loading Pie Chart" error={pieChartError} />
        ) : pieChartDataLoading ? (
          <CoursesByCategory />
        ) : (
          <PieChartCard
            pieChartData={pieChartData}
            dynamicColors={dynamicColors}
          />
        )}
      </div>
    </div>
  );
}
