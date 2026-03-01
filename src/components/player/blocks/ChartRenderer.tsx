'use client';

import { useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ChartRendererProps {
  block: ChartBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function ChartRenderer({
  block,
  progress,
  onComplete,
  theme,
}: ChartRendererProps) {
  const { chart_type, title, labels, datasets, show_legend } = block.data;

  // Auto-complete on mount
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  // Transform data for recharts
  const barLineData = labels.map((label, index) => {
    const entry: Record<string, string | number> = { name: label };
    datasets.forEach((ds) => {
      entry[ds.label || `Dataset ${datasets.indexOf(ds) + 1}`] = ds.data[index] ?? 0;
    });
    return entry;
  });

  // Transform data for pie/donut
  const pieData = labels.map((label, index) => ({
    name: label,
    value: datasets[0]?.data[index] ?? 0,
  }));

  const pieColors = labels.map((_, index) => {
    if (datasets[0]?.color) {
      // Generate varied colors from the first dataset color
      const baseColor = datasets[0].color;
      if (index === 0) return baseColor;
      // Use dataset colors if available, otherwise vary hue
      return datasets[index]?.color || baseColor;
    }
    return theme.primary_color;
  });

  // For pie charts, use one color per slice from a palette
  const sliceColors = labels.map((_, i) => {
    // First try to use distinct colors from all datasets
    if (datasets.length > 1 && datasets[i]?.color) {
      return datasets[i].color;
    }
    // Otherwise generate a palette from primary
    const hueStep = 360 / Math.max(labels.length, 1);
    const baseHue = i * hueStep;
    return `hsl(${baseHue}, 65%, 55%)`;
  });

  if (chart_type === 'bar') {
    return (
      <div>
        {title && (
          <h3
            className="mb-4 text-center text-lg font-semibold"
            style={{ color: theme.text_color }}
          >
            {title}
          </h3>
        )}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barLineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {show_legend && <Legend />}
            {datasets.map((ds, i) => (
              <Bar
                key={i}
                dataKey={ds.label || `Dataset ${i + 1}`}
                fill={ds.color || theme.primary_color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_type === 'line') {
    return (
      <div>
        {title && (
          <h3
            className="mb-4 text-center text-lg font-semibold"
            style={{ color: theme.text_color }}
          >
            {title}
          </h3>
        )}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={barLineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {show_legend && <Legend />}
            {datasets.map((ds, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={ds.label || `Dataset ${i + 1}`}
                stroke={ds.color || theme.primary_color}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Pie / Donut
  return (
    <div>
      {title && (
        <h3
          className="mb-4 text-center text-lg font-semibold"
          style={{ color: theme.text_color }}
        >
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={chart_type === 'donut' ? 60 : 0}
            outerRadius={120}
            dataKey="value"
            nameKey="name"
            label
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={sliceColors[index]} />
            ))}
          </Pie>
          <Tooltip />
          {show_legend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
