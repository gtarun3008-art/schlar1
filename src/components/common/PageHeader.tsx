import React from 'react';

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  academicContext?: string;
  badge?: React.ReactNode;
  primaryAction?: ActionItem;
  secondaryActions?: ActionItem[];
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  academicContext = 'Greenfield International · AY 2025–2026',
  badge,
  primaryAction,
  secondaryActions = [],
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {academicContext}
            </span>
            {badge && <div>{badge}</div>}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
        </div>

        {/* Action Buttons */}
        {(primaryAction || secondaryActions.length > 0) && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {secondaryActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              >
                {action.icon}
                {action.label}
              </button>
            ))}

            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>

      {children && <div className="mt-4 pt-4 border-t border-slate-100">{children}</div>}
    </div>
  );
};
