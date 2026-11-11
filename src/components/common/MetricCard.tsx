import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div
      onClick={onAction}
      role={onAction ? 'button' : undefined}
      tabIndex={onAction ? 0 : undefined}
      onKeyDown={(e) => {
        if (onAction && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onAction();
        }
      }}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all text-left ${
        onAction
          ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        {icon && <div className="text-slate-400 p-1.5 bg-slate-50 rounded-lg">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium tabular-nums ${
              change.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {change.isPositive ? '↑' : '↓'} {change.value}
          </span>
        )}
      </div>

      {(subtitle || actionText) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {actionText && (
            <button
              onClick={onAction}
              className="text-indigo-600 hover:text-indigo-700 font-medium ml-auto transition-colors"
            >
              {actionText} →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
