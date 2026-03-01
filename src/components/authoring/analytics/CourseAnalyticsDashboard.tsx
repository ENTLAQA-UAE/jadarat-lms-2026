'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Target, Award, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// ============================================================
// TYPES
// ============================================================

interface BlockProgressRow {
  block_id: string;
  block_type: string;
  completed: boolean;
  score: number | null;
  attempts: number;
  time_spent_seconds: number;
  user_id: string;
}

interface EnrollmentRow {
  user_id: string;
  status: string;
  progress: number | null;
}

interface CourseAnalyticsDashboardProps {
  courseId: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

// ============================================================
// HELPERS
// ============================================================

function formatBlockType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COURSE ANALYTICS DASHBOARD COMPONENT
// ============================================================

export default function CourseAnalyticsDashboard({
  courseId,
}: CourseAnalyticsDashboardProps) {
  const [blockProgress, setBlockProgress] = useState<BlockProgressRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'avgScore' | 'passRate' | 'attempts'>(
    'avgScore',
  );

  // Fetch analytics data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      const [progressRes, enrollRes] = await Promise.all([
        supabase
          .from('learner_block_progress')
          .select('*')
          .eq('course_id', courseId),
        supabase
          .from('user_courses')
          .select('*')
          .eq('course_id', courseId),
      ]);

      setBlockProgress(
        (progressRes.data as BlockProgressRow[]) ?? [],
      );
      setEnrollments((enrollRes.data as EnrollmentRow[]) ?? []);
      setLoading(false);
    };

    fetchData();
  }, [courseId]);

  // ============================================================
  // COMPUTED METRICS
  // ============================================================

  const totalEnrollees = enrollments.length;

  const completedCount = enrollments.filter(
    (e) => e.status === 'completed',
  ).length;

  const completionRate =
    totalEnrollees > 0
      ? Math.round((completedCount / totalEnrollees) * 100)
      : 0;

  const assessmentBlocks = useMemo(
    () => blockProgress.filter((b) => b.score !== null && b.completed),
    [blockProgress],
  );

  const averageScore = useMemo(() => {
    if (assessmentBlocks.length === 0) return 0;
    const total = assessmentBlocks.reduce(
      (sum, b) => sum + (b.score ?? 0),
      0,
    );
    return Math.round(total / assessmentBlocks.length);
  }, [assessmentBlocks]);

  const totalTimeSeconds = useMemo(
    () => blockProgress.reduce((sum, b) => sum + b.time_spent_seconds, 0),
    [blockProgress],
  );

  const avgTimeMinutes =
    totalEnrollees > 0
      ? Math.round(totalTimeSeconds / totalEnrollees / 60)
      : 0;

  // Block type completion data for bar chart
  const blockTypeCompletionData = useMemo(() => {
    const typeMap = new Map<
      string,
      { total: number; completed: number }
    >();

    for (const row of blockProgress) {
      const existing = typeMap.get(row.block_type) ?? {
        total: 0,
        completed: 0,
      };
      existing.total++;
      if (row.completed) existing.completed++;
      typeMap.set(row.block_type, existing);
    }

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type: formatBlockType(type),
      completion:
        data.total > 0
          ? Math.round((data.completed / data.total) * 100)
          : 0,
    }));
  }, [blockProgress]);

  // Quiz results grouped by block
  const quizResults = useMemo(() => {
    const blockMap = new Map<
      string,
      { type: string; scores: number[]; attempts: number }
    >();

    for (const row of assessmentBlocks) {
      const existing = blockMap.get(row.block_id) ?? {
        type: row.block_type,
        scores: [],
        attempts: 0,
      };
      existing.scores.push(row.score ?? 0);
      existing.attempts += row.attempts;
      blockMap.set(row.block_id, existing);
    }

    const results = Array.from(blockMap.entries()).map(
      ([blockId, data]) => {
        const avg =
          data.scores.length > 0
            ? Math.round(
                data.scores.reduce((s, v) => s + v, 0) /
                  data.scores.length,
              )
            : 0;
        const passCount = data.scores.filter((s) => s >= 70).length;

        return {
          blockId: blockId.slice(0, 8),
          blockType: formatBlockType(data.type),
          avgScore: avg,
          attempts: data.attempts,
          passRate:
            data.scores.length > 0
              ? Math.round(
                  (passCount / data.scores.length) * 100,
                )
              : 0,
        };
      },
    );

    // Sort by selected column
    results.sort((a, b) => b[sortBy] - a[sortBy]);

    return results;
  }, [assessmentBlocks, sortBy]);

  // Enrollment status data for pie chart
  const enrollmentStatusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    for (const row of enrollments) {
      statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
    }
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [enrollments]);

  // Learner progress data
  const learnerProgressData = useMemo(() => {
    const userMap = new Map<
      string,
      {
        blocksCompleted: number;
        totalScore: number;
        scoredBlocks: number;
        lastActivity: string;
      }
    >();

    for (const row of blockProgress) {
      const existing = userMap.get(row.user_id) ?? {
        blocksCompleted: 0,
        totalScore: 0,
        scoredBlocks: 0,
        lastActivity: '',
      };
      if (row.completed) existing.blocksCompleted++;
      if (row.score !== null) {
        existing.totalScore += row.score;
        existing.scoredBlocks++;
      }
      userMap.set(row.user_id, existing);
    }

    return Array.from(userMap.entries()).map(([userId, data]) => ({
      userId: userId.slice(0, 8),
      blocksCompleted: data.blocksCompleted,
      avgScore:
        data.scoredBlocks > 0
          ? Math.round(data.totalScore / data.scoredBlocks)
          : null,
    }));
  }, [blockProgress]);

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (totalEnrollees === 0 && blockProgress.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Users className="h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          No analytics data yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Analytics will appear once learners start engaging with this course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------- */}
      {/* Summary Cards                                            */}
      {/* -------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard icon={Users} label="Enrollees" value={totalEnrollees} />
        <SummaryCard
          icon={Target}
          label="Completion Rate"
          value={`${completionRate}%`}
        />
        <SummaryCard
          icon={Award}
          label="Avg Score"
          value={`${averageScore}%`}
        />
        <SummaryCard
          icon={Clock}
          label="Avg Time"
          value={`${avgTimeMinutes}m`}
        />
      </div>

      {/* -------------------------------------------------------- */}
      {/* Charts Row                                               */}
      {/* -------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Block Completion by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Block Completion by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockTypeCompletionData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No block progress data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={blockTypeCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, 'Completion']}
                  />
                  <Bar
                    dataKey="completion"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Enrollment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollmentStatusData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No enrollments yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={enrollmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {enrollmentStatusData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          CHART_COLORS[index % CHART_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------- */}
      {/* Quiz Results Table                                       */}
      {/* -------------------------------------------------------- */}
      {quizResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Quiz Results Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="py-2 pe-4 text-start font-medium text-muted-foreground">
                      Block
                    </th>
                    <th className="py-2 pe-4 text-start font-medium text-muted-foreground">
                      Type
                    </th>
                    <th
                      className="cursor-pointer py-2 pe-4 text-start font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => setSortBy('avgScore')}
                    >
                      Avg Score{sortBy === 'avgScore' ? ' \u2193' : ''}
                    </th>
                    <th
                      className="cursor-pointer py-2 pe-4 text-start font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => setSortBy('attempts')}
                    >
                      Attempts{sortBy === 'attempts' ? ' \u2193' : ''}
                    </th>
                    <th
                      className="cursor-pointer py-2 text-start font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => setSortBy('passRate')}
                    >
                      Pass Rate{sortBy === 'passRate' ? ' \u2193' : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quizResults.map((row) => (
                    <tr
                      key={row.blockId}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 pe-4 font-mono text-xs">
                        {row.blockId}...
                      </td>
                      <td className="py-2 pe-4">{row.blockType}</td>
                      <td className="py-2 pe-4">{row.avgScore}%</td>
                      <td className="py-2 pe-4">{row.attempts}</td>
                      <td className="py-2">{row.passRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* -------------------------------------------------------- */}
      {/* Learner Progress Table                                   */}
      {/* -------------------------------------------------------- */}
      {learnerProgressData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Learner Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start">
                    <th className="py-2 pe-4 text-start font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="py-2 pe-4 text-start font-medium text-muted-foreground">
                      Blocks Completed
                    </th>
                    <th className="py-2 text-start font-medium text-muted-foreground">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {learnerProgressData.map((row) => (
                    <tr
                      key={row.userId}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 pe-4 font-mono text-xs">
                        {row.userId}...
                      </td>
                      <td className="py-2 pe-4">
                        {row.blocksCompleted}
                      </td>
                      <td className="py-2">
                        {row.avgScore !== null
                          ? `${row.avgScore}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
