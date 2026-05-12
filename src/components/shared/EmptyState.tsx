import * as React from 'react';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-4 py-8 text-center text-slate-500">
      <div className="font-semibold">{title}</div>
      {description && <div className="text-sm mt-1">{description}</div>}
    </div>
  );
}
