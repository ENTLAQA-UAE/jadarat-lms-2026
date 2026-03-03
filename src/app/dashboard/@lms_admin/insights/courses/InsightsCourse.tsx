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

const BRAND_PALETTE = ['#33658a', '#86bbd8', '#f26419', '#f6ae2d', '#2f4858'];

function generateDynamicColors(length: number): string[] {
  const colors: string[] = [];

  for (let i = 0; i < length; i++) {
    if (i < BRAND_PALETTE.length) {
      colors.push(BRAND_PALETTE[i]);
    } else {
      // Generate additional colors based on hue distribution for overflow
      const hueStep = 360 / length;
      const h = (i * hueStep + Math.random() * (hueStep / 3)) % 360;
      const s = 65 + Math.random() * 20;
      const l = 50 + Math.random() * 10;
      colors.push(hslToHex(h, s, l));
    }
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
  <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader>
      <CardTitle className="text-destructive flex items-center">
        {title} <CircleX className="ml-2" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-destructive">{error}</p>
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
  <Card className="w-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader>
      <CardTitle className="text-base font-semibold">New Courses per Month</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barChartData}>
            <XAxis dataKey="month" />
            <Tooltip />
            <Bar dataKey="course_count" fill="#33658a">
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

const STATUS_COLORS: Record<string, string> = {
  Published: '#33658a',
  Draft: '#f6ae2d',
  Archived: '#2f4858',
};

const CourseStatusPieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  if (!data || data.length === 0) return null;

  const colors = data.map((d) => STATUS_COLORS[d.name] || '#86bbd8');

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Course Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#33658a"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`status-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {data.map((entry, index) => (
            <div key={`status-legend-${index}`} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-xs sm:text-sm">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PieChartCard = ({
  pieChartData,
  dynamicColors,
}: {
  pieChartData: any[];
  dynamicColors: string[];
}) => (
  <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader>
      <CardTitle className="text-base font-semibold">Courses by Category</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart className="exclude-weglot">
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#33658a"
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
              className="w-3 h-3 mr-1 rounded-full"
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
  courseStatusData,
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

      {/* Course Status Pie Chart */}
      {courseStatusData && courseStatusData.length > 0 && (
        <div className="mb-4">
          <CourseStatusPieChart data={courseStatusData} />
        </div>
      )}
    </div>
  );
}
