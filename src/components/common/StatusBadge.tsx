import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate' | 'cyan';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
  // Determine variant automatically if not provided
  let computedVariant = variant;
  if (!computedVariant) {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('paid') || s.includes('present') || s.includes('approved') || s.includes('excellent') || s.includes('converted') || s.includes('published') || s.includes('promoted') || s.includes('verified')) {
      computedVariant = 'emerald';
    } else if (s.includes('admitted') || s.includes('contract')) {
      computedVariant = 'cyan';
    } else if (s.includes('pending') || s.includes('partial') || s.includes('late') || s.includes('follow-up') || s.includes('average') || s.includes('draft') || s.includes('on leave') || s.includes('probation') || s.includes('transferred') || s.includes('notice')) {
      computedVariant = 'amber';
    } else if (s.includes('overdue') || s.includes('absent') || s.includes('rejected') || s.includes('needs attention') || s.includes('cancelled') || s.includes('withdrawn')) {
      computedVariant = 'rose';
    } else if (s.includes('checked in') || s.includes('new') || s.includes('scheduled') || s.includes('issued') || s.includes('enquiry')) {
      computedVariant = 'indigo';
    } else {
      computedVariant = 'slate';
    }
  }

  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  }[computedVariant || 'slate'];

  const dotStyles = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    slate: 'bg-slate-400',
    cyan: 'bg-cyan-500',
  }[computedVariant || 'slate'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} aria-hidden="true" />
      {status}
    </span>
  );
};
