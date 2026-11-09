import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface BarGraphDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface BarGraphChartProps {
  data: BarGraphDataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  className?: string;
}

/**
 * GLOBAL CALLING COMPONENT: BarGraphChart
 * Universal column / bar histogram visualization.
 */
export const BarGraphChart: React.FC<BarGraphChartProps> = ({
  data,
  dataKey = 'value',
  color = '#C9A84C', // primary gold
  height = 240,
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
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
