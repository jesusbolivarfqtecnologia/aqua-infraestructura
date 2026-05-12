import * as React from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#0A1628]">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
