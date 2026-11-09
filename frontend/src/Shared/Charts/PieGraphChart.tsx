import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export interface PieGraphDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface PieGraphChartProps {
  data: PieGraphDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#001851', '#C9A84C', '#0d9488', '#3b82f6', '#f59e0b', '#7c3aed'];

/**
 * GLOBAL CALLING COMPONENT: PieGraphChart
 * Universal donut / pie chart visualizer.
 */
export const PieGraphChart: React.FC<PieGraphChartProps> = ({
  data,
  height = 240,
  innerRadius = 50,
  outerRadius = 80,
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-xs text-gray-400 h-[${height}px] ${className}`}>
        No chart data available
      </div>
    );
  }

  return (
    <div className={`w-full h-[${height}px] ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
