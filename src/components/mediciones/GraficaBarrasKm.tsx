'use client';

import * as React from 'react';
import { Bar, BarChart, Brush, Cell, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { BarChart2, Maximize, Minimize } from 'lucide-react';
import type { IRI_ResumenKm } from '@/types';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function GraficaBarrasKm({
  data,
  condMedio,
  unidad,
  onBarClick,
  fullscreen,
  setFullscreen,
}: {
  data: IRI_ResumenKm[];
  condMedio: number;
  unidad: string;
  onBarClick: (data: any) => void;
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
}) {
  return (
    <Card className={fullscreen ? 'fixed inset-0 z-[60] bg-white p-6 shadow-2xl flex flex-col' : 'p-4 flex flex-col'}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-sm mb-1"><BarChart2 className="inline w-4 h-4 mr-1 text-[#00C2D4]" />Valor Medio por Km (Evaluacion Normativa)</h3>
          <p className="text-xs text-slate-500 max-w-2xl">Promedio en segmentos de 1,000m. Limite: {'<='} {condMedio} {unidad}.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setFullscreen(!fullscreen)} className="h-7 text-xs text-slate-500 hover:text-slate-800 shrink-0">
          {fullscreen ? <><Minimize className="w-3 h-3 mr-1" /> Salir</> : <><Maximize className="w-3 h-3 mr-1" /> Expandir</>}
        </Button>
      </div>
      <div className={fullscreen ? 'flex-1 min-h-0 w-full' : 'flex-1 min-h-[250px] w-full'}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} onClick={onBarClick}>
              <XAxis dataKey="km_label" tickFormatter={(val) => val.split(' ')[0]} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip formatter={(v: any) => [`${Number(v).toFixed(2)} ${unidad}`, 'Valor medio']} cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={condMedio} stroke="#f59e0b" strokeDasharray="4 2" />
              <Brush dataKey="km_label" height={30} stroke="#00C2D4" tickFormatter={(val) => val.split(' ')[0]} />
              <Bar dataKey="valor_medio" radius={[3, 3, 0, 0]} isAnimationActive={false} className="cursor-pointer hover:opacity-80 transition-opacity">
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.cumple_medio ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin datos</div>
        )}
      </div>
    </Card>
  );
}
