import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderClass = 'border-emerald-200 bg-emerald-50/90 text-emerald-950';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          borderClass = 'border-rose-200 bg-rose-50/90 text-rose-950';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-indigo-600 shrink-0" />;
          borderClass = 'border-indigo-200 bg-indigo-50/90 text-indigo-950';
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider">{toast.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-black/5 transition-colors text-slate-500 hover:text-slate-800"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
