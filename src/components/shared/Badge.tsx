import * as React from 'react';

type BadgeVariant = 'default' | 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'cyan';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-emerald-100 text-emerald-800',
    purple: 'bg-purple-100 text-purple-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    cyan: 'bg-[#00C2D4]/20 text-[#0A1628] font-bold border border-[#00C2D4]/40',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
