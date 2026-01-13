
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, colorClass = "text-slate-900" }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-slate-50">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className={`text-2xl font-bold mt-1 ${colorClass}`}>{formattedValue}</h3>
    </div>
  );
};

export default StatCard;
