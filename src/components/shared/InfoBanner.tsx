import * as React from 'react';
import { Info } from 'lucide-react';

export function InfoBanner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700 mb-6 flex items-start gap-3 shadow-sm">
      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold text-[#1B3A6B] mb-1">{title}</h4>
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
