'use client';

import * as React from 'react';
import { Bar, BarChart, Brush, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { BarChart2, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

type KmBarDatum = {
  km_label: string;
  from_m: number;
  to_m: number;
  [key: string]: number | boolean | string | undefined;
};

type KmBarSeries = {
  id: string;
  label: string;
  color: string;
};

export function GraficaBarrasKm({
  data,
  series,
  condMedio,
  unidad,
  onBarClick,
  fullscreen,
  setFullscreen,
}: {
  data: KmBarDatum[];
  series: KmBarSeries[];
  condMedio: number;
  unidad: string;
  onBarClick: (payload: { from_m: number; to_m: number }) => void;
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
}) {
  const handleBarClick = (entry: any) => {
    const payload = entry?.payload as KmBarDatum | undefined;
    if (!payload) return;
    onBarClick(payload);
  };

  const useComplianceColors = series.length === 1;
  const onlySeriesId = series[0]?.id;

  const formatValue = (value: any) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 'N/A';
    return `${num.toFixed(2)} ${unidad}`;
  };

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
        {series.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">Selecciona al menos un tramo para visualizar la grafica.</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
              <XAxis dataKey="km_label" tickFormatter={(val) => val.split(' ')[0]} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip
                formatter={(v: any, name: any) => [formatValue(v), String(name ?? 'Valor medio')]}
                cursor={{ fill: 'transparent' }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <ReferenceLine
                y={condMedio}
                stroke="#f59e0b"
                strokeDasharray="4 2"
                label={{ value: `Limite ${condMedio}`, position: 'left', offset: 12, fontSize: 11, fill: '#f59e0b' }}
              />
              <Brush dataKey="km_label" height={30} stroke="#00C2D4" tickFormatter={(val) => val.split(' ')[0]} />
              {series.length > 1 && <Legend verticalAlign="top" height={24} />}
              {series.map((serie) => (
                <Bar
                  key={serie.id}
                  dataKey={serie.id}
                  name={serie.label}
                  radius={[3, 3, 0, 0]}
                  fill={useComplianceColors ? undefined : serie.color}
                  isAnimationActive={false}
                  onClick={handleBarClick}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {useComplianceColors && serie.id === onlySeriesId
                    ? data.map((entry, index) => (
                      <Cell
                        key={`${serie.id}-${index}`}
                        fill={entry[`${serie.id}_cumple`] ? '#10b981' : '#ef4444'}
                      />
                    ))
                    : null}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin datos</div>
        )}
      </div>
    </Card>
  );
}
