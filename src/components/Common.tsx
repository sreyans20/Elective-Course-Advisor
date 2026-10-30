import React from 'react';

export function Badge({
  children,
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  className?: string;
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    outline: 'bg-white text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function DifficultyMeter({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center space-x-1" title={`Difficulty: ${difficulty}/5`}>
      {[1, 2, 3, 4, 5].map((lvl) => (
        <span
          key={lvl}
          className={`h-1.5 w-3 rounded-full transition-colors ${
            lvl <= difficulty
              ? lvl >= 4
                ? 'bg-rose-500'
                : lvl === 3
                ? 'bg-amber-500'
                : 'bg-emerald-500'
              : 'bg-slate-200'
          }`}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1.5 font-medium">{difficulty}/5</span>
    </div>
  );
}

export function ScoreRing({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (s: number) => {
    if (s >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s >= 70) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    if (s >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs font-bold border',
    md: 'w-12 h-12 text-sm font-bold border-2',
    lg: 'w-16 h-16 text-lg font-extrabold border-2'
  };

  return (
    <div
      className={`rounded-full flex flex-col items-center justify-center shrink-0 shadow-xs ${getColor(score)} ${sizeClasses[size]}`}
    >
      <span>{score}</span>
      {size === 'lg' && <span className="text-[9px] uppercase tracking-wider text-slate-500 font-normal">Score</span>}
    </div>
  );
}
