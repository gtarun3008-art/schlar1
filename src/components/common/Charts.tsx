import React from 'react';

// Responsive SVG Bar Chart
export interface BarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  displayValue?: string;
  color?: string;
}

export const BarChart: React.FC<{
  data: BarItem[];
  height?: number;
  valueSuffix?: string;
  title?: string;
}> = ({ data, height = 180, valueSuffix = '', title }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 10);

  return (
    <div className="w-full">
      {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{title}</h4>}
      <div className="flex items-end gap-2 pt-4 px-1" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const pct = Math.min(100, Math.round((item.value / maxValue) * 100));
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                {item.displayValue || `${item.value}${valueSuffix}`}
              </span>
              <div className="w-full bg-slate-100 rounded-t-sm h-full flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    item.color || 'bg-indigo-600 group-hover:bg-indigo-700'
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-600 mt-2 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Responsive SVG Line Trend
export interface LinePoint {
  label: string;
  value: number;
}

export const LineChart: React.FC<{
  data: LinePoint[];
  height?: number;
  lineColor?: string;
  suffix?: string;
  minVal?: number;
  maxVal?: number;
}> = ({ data, height = 160, lineColor = '#4F46E5', suffix = '%' }) => {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,100 L ${points.join(' L ')} L 100,100 Z`;

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Subtle Grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />

          {/* Area fill */}
          <path d={areaD} fill="url(#lineGrad)" />
          {/* Line stroke */}
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />

          {/* Dot Markers */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = 100 - ((d.value - min) / range) * 80 - 10;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#ffffff"
                stroke={lineColor}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      {/* X Labels */}
      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-1">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <span>{d.label}</span>
            <div className="font-mono text-[10px] text-slate-700 font-semibold tabular-nums">
              {d.value}{suffix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}> = ({ segments, centerLabel, centerValue, size = 150 }) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="14"
          />
          {segments.map((seg, idx) => {
            const strokeDasharray = (seg.value / total) * circumference;
            const dashOffset = -currentOffset;
            currentOffset += strokeDasharray;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            {centerValue && (
              <span className="text-base font-bold text-slate-900 tabular-nums">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        {segments.map((seg, idx) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-600 truncate">{seg.label}:</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums ml-auto">
                ${seg.value.toLocaleString()} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
