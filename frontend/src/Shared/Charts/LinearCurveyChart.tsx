import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface LinearCurveyDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface LinearCurveyChartProps {
  data: LinearCurveyDataPoint[];
  dataKey?: string;
  color?: string;
  fillOpacity?: number;
  height?: number;
  className?: string;
}

/**
 * GLOBAL CALLING COMPONENT: LinearCurveyChart
 * Universal smooth curved area/spline chart with responsive scaling.
 */
export const LinearCurveyChart: React.FC<LinearCurveyChartProps> = ({
  data,
  dataKey = 'value',
  color = '#001851', // primary navy
  fillOpacity = 0.15,
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
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={fillOpacity * 2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
