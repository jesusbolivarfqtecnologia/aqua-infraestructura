import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import type { IRI_ResumenKm } from '@/types';
import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';

export function TablaResumenKm({ data, viewMode }: { data: IRI_ResumenKm[]; viewMode: '100m' | '20m' }) {
  return (
    <Card className="lg:col-span-2 flex flex-col overflow-hidden">
      <div className="p-3 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-sm">Detalle de Incumplimientos y Promedios (Tramos Combinados)</h3>
        <span className="text-xs text-slate-500">{data.filter((k) => !k.cumple_km).length} km incumplen / {data.length} total</span>
      </div>
      <div className="flex-1 overflow-auto max-h-[300px]">
        <table className="w-full text-xs text-left">
          <thead className="bg-white sticky top-0 font-semibold shadow-sm">
            <tr>
              <th className="p-3">Km (Desde abscisa real)</th>
              <th className="p-3">Valor Medio</th>
              <th className="p-3 text-center">Incumplimientos ({viewMode === '100m' ? '100m' : 'Crudos'})</th>
              <th className="p-3">Estado Km</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((km, i) => (
              <tr key={i} className={!km.cumple_km ? 'bg-red-50/40' : ''}>
                <td className="p-3 font-medium">{km.km_label}</td>
                <td className="p-3 font-bold">{km.valor_medio.toFixed(2)}</td>
                <td className="p-3 text-center">
                  {km.n_incumplimientos > 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-600 font-bold"><AlertCircle className="w-3 h-3" /> {km.n_incumplimientos}</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="p-3"><Badge variant={km.cumple_km ? 'green' : 'red'}>{km.cumple_km ? 'CUMPLE' : 'INCUMPLE'}</Badge></td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Sin datos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
