import React from 'react';

interface Trend {
  value: string;
  direction: 'up' | 'down';
}

interface MetricCardProps {
  key?: React.Key;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant: 'navy' | 'gold' | 'green' | 'purple' | 'blue' | 'orange';
  trend?: Trend;
}

export function MetricCard({ label, value, icon, variant, trend }: MetricCardProps) {
  return (
    <div className="admin-metric-card">
      <div className={`admin-metric-card__icon admin-metric-card__icon--${variant}`}>
        {icon}
      </div>
      <div className="admin-metric-card__info">
        <span className="admin-metric-card__label">{label}</span>
        <span className="admin-metric-card__value">{value}</span>
        {trend && (
          <span className={`admin-metric-card__trend admin-metric-card__trend--${trend.direction}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
