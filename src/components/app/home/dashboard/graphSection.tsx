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
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveBar } from '@nivo/bar';
import { useLanguage } from '@/context/language.context';
import { createClient } from '@/utils/supabase/client';
import { BarChart3 } from 'lucide-react';

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

export default function GraphSection() {
  const { isRTL } = useLanguage();
  const [graphData, setGraphData] = useState<GraphDataItem[]>([]);
  const [year, setYear] = useState<string>(YEARS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    monthlyStats(year);
  }, [year]);

  const monthlyStats = async (selectedYear: string) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_monthly_stats_for_year', {
        year: Number(selectedYear),
      });

      if (error) throw error;
      setGraphData(data || []);
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="xl:col-span-3 lg:col-span-2 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Enrollments & Completions</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Monthly enrollment vs completion trends
              </CardDescription>
            </div>
          </div>
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="aspect-[4/3] max-h-[400px] w-full flex flex-col justify-end gap-2 p-4">
            <div className="flex items-end gap-3 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center justify-end h-full">
                  <Skeleton shimmer className="w-full rounded-t-md" style={{ height: `${30 + Math.random() * 50}%` }} />
                  <Skeleton shimmer className="w-8 h-3 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <StackedBarChart
            graphData={graphData}
            className="aspect-[4/3] max-h-[400px] w-full max-w-full"
            isRTL={isRTL}
          />
        )}
      </CardContent>
    </Card>
  );
}

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
        padding={0.35}
        borderRadius={4}
        colors={['#33658a', 'rgba(134, 187, 216, 0.35)']}
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
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.05)',
            },
          },
          grid: {
            line: {
              stroke: 'hsl(220, 12%, 90%)',
              strokeDasharray: '4 4',
            },
          },
          axis: {
            ticks: {
              text: {
                fill: 'hsl(220, 10%, 50%)',
                fontSize: 11,
              },
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
