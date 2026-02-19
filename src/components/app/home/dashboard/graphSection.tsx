'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResponsiveBar } from '@nivo/bar';
import { useLanguage } from '@/context/language.context';
import { createClient } from '@/utils/supabase/client';

// Improve type definitions
type GraphDataItem = {
  month: string;
  arabic_month?: string;
  total_completed: number;
  total_enrollments: number;
  total_pending: number;
};

interface StackedBarChartProps {
  graphData: GraphDataItem[];
  className?: string;
  isRTL: boolean;
}

// Constants
const YEARS = Array.from({ length: 5 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);
const CHART_COLORS = {
  completed: '#4BB543',
  pending: '#89cff040',
} as const;

export default function GraphSection() {
  const { isRTL } = useLanguage();
  const [graphData, setGraphData] = useState<GraphDataItem[]>([]);
  const [year, setYear] = useState<string>(YEARS[0]);

  // Add year dependency to useEffect
  useEffect(() => {
    monthlyStats(year);
  }, [year]); // Now properly responds to year changes

  // Simplified data fetching
  const monthlyStats = async (selectedYear: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_monthly_stats_for_year', {
        year: Number(selectedYear),
      });

      if (error) throw error;
      setGraphData(data || []);
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
      setGraphData([]);
    }
  };

  return (
    <Card className="xl:col-span-3 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enrollments & Completions</CardTitle>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((yearOption) => (
                <SelectItem key={yearOption} value={yearOption}>
                  {yearOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          Showing the total user enrollments vs completions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StackedBarChart
          graphData={graphData}
          className="aspect-[4/3] max-h-[400px] w-full max-w-full"
          isRTL={isRTL}
        />
      </CardContent>
    </Card>
  );
}

// Separate component with proper typing
function StackedBarChart({
  graphData,
  className,
  isRTL,
}: StackedBarChartProps) {
  const data = useMemo(() => {
    if (!graphData?.length) return [];

    return graphData
      .map((item) => ({
        name: isRTL ? item.arabic_month || 'Unknown' : item.month || 'Unknown',
        pending: item.total_pending,
        completed: item.total_completed,
      }))
      .filter((item) => item.name !== 'Unknown');
  }, [graphData, isRTL]);

  if (!data.length) return null;

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <ResponsiveBar
        data={isRTL ? [...data].reverse() : data}
        keys={['completed', 'pending']}
        indexBy="name"
        margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
        padding={0.3}
        colors={[CHART_COLORS.completed, CHART_COLORS.pending]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 4,
          tickPadding: 16,
        }}
        gridYValues={10}
        theme={{
          tooltip: {
            chip: {
              borderRadius: '9999px',
              marginRight: '4px',
              marginLeft: '4px',
            },
            container: {
              fontSize: '12px',
              textTransform: 'capitalize',
              borderRadius: '6px',
              width: '100%',
            },
          },
          grid: {
            line: {
              stroke: '#f3f4f6',
            },
          },
        }}
        tooltipLabel={({ id }) => `${id}`}
        enableLabel={false}
        role="application"
        ariaLabel="Monthly enrollments and completions chart"
      />
    </div>
  );
}
