import React from 'react';

export interface HeatmapCell {
  xLabel: string;
  yLabel: string;
  value: number;
}

export interface HeatmapChartProps {
  data: HeatmapCell[];
  xLabels?: string[];
  yLabels?: string[];
  maxVal?: number;
  className?: string;
}

/**
 * GLOBAL CALLING COMPONENT: HeatmapChart
 * 2D density intensity matrix visualizer.
 */
export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  xLabels: customX,
  yLabels: customY,
  maxVal: customMax,
  className = '',
}) => {
  const xLabels = customX || Array.from(new Set(data.map((d) => d.xLabel)));
  const yLabels = customY || Array.from(new Set(data.map((d) => d.yLabel)));
  const maxVal = customMax || Math.max(...data.map((d) => d.value), 1);

  const getCellColor = (val: number) => {
    if (val === 0) return 'bg-gray-100 text-gray-400';
    const ratio = Math.min(1, val / maxVal);
    if (ratio < 0.25) return 'bg-blue-100 text-navy';
    if (ratio < 0.5) return 'bg-blue-300 text-navy-dark';
    if (ratio < 0.75) return 'bg-navy/70 text-white';
    return 'bg-navy text-gold-light font-bold';
  };

  return (
    <div className={`overflow-x-auto p-2 ${className}`}>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-1.5 text-xs font-semibold text-gray-500 text-left"></th>
            {xLabels.map((x) => (
              <th key={x} className="p-1.5 text-[11px] font-medium text-gray-500 truncate max-w-[60px]">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((y) => (
            <tr key={y}>
              <td className="p-1.5 text-[11px] font-semibold text-gray-700 text-left whitespace-nowrap">
                {y}
              </td>
              {xLabels.map((x) => {
                const item = data.find((d) => d.xLabel === x && d.yLabel === y);
                const val = item ? item.value : 0;
                return (
                  <td key={`${x}-${y}`} className="p-1">
                    <div
                      className={`h-7 rounded-md flex items-center justify-center text-xs transition-colors duration-150 ${getCellColor(
                        val,
                      )}`}
                      title={`${y} @ ${x}: ${val}`}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
