import * as React from 'react';
import type { IRI_Estadisticas } from '@/types';
import { Card } from '@/components/shared/Card';

export function EstadisticasCards({
  stats,
  condPuntual,
  condMedio,
  viewMode,
  unidad,
}: {
  stats: IRI_Estadisticas;
  condPuntual: number;
  condMedio: number;
  viewMode: '100m' | '20m';
  unidad: string;
}) {
  const cards = [
    {
      label: `Valor max. ${viewMode === '100m' ? 'puntual' : 'crudo'}`,
      value: stats.valor_max_puntual.toFixed(2),
      unit: unidad,
      ok: stats.valor_max_puntual <= condPuntual,
    },
    {
      label: `Valor medio global (${viewMode})`,
      value: stats.valor_medio_global.toFixed(2),
      unit: unidad,
      ok: stats.valor_medio_global <= condMedio,
    },
    {
      label: '% Cumplimiento',
      value: stats.porcentaje_cumplimiento.toFixed(1),
      unit: '%',
      ok: stats.porcentaje_cumplimiento >= 100,
    },
    {
      label: `Excesos (${viewMode === '100m' ? '100m' : 'Base'})`,
      value: String(stats.n_incumplimientos_puntual),
      unit: 'puntos',
      ok: stats.n_incumplimientos_puntual === 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className={`p-4 border-l-4 ${card.ok ? 'border-l-emerald-400' : 'border-l-red-400 opacity-90'}`}>
          <p className="text-xs text-slate-500 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.ok ? 'text-emerald-700' : 'text-red-600'}`}>{card.value}</p>
          <p className="text-xs text-slate-400">{card.unit}</p>
        </Card>
      ))}
    </div>
  );
}
