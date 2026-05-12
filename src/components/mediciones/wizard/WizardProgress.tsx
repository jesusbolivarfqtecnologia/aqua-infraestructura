import * as React from 'react';
import { Check } from 'lucide-react';

export function WizardProgress({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between relative mb-12 px-4">
      <div className="absolute left-8 right-8 top-1/2 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
      <div
        className="absolute left-8 top-1/2 h-1 bg-[#00C2D4] -z-10 -translate-y-1/2 transition-all duration-500"
        style={{ width: `${((step - 1) / 3) * 100}%` }}
      ></div>
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${
            step >= s ? 'bg-[#00C2D4] border-white text-[#0A1628]' : 'bg-slate-100 border-white text-slate-400'
          }`}
        >
          {step > s ? <Check className="w-5 h-5" /> : s}
        </div>
      ))}
    </div>
  );
}
