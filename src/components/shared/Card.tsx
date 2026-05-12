import * as React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-300 ${className}`}
      {...props}
    />
  );
}
