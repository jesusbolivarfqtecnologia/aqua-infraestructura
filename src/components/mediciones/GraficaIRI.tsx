'use client';

import * as React from 'react';
import {
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Info, Maximize, Minimize, TrendingUp } from 'lucide-react';
import type { IRI_RegistroPuntual } from '@/types';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function GraficaIRI({
  viewMode,
  setViewMode,
  isLoadingBase,
  chartData100m,
  chartData20m,
  selectedMedIds,
  medicionesConLabel,
  yearColorMap,
  condPuntual,
  maxDomain100m,
  maxDomain20m,
  formatAbscisa,
  brushIndexes,
  setBrushIndexes,
  fullscreenChart,
  setFullscreenChart,
  unidad,
}: {
  viewMode: '100m' | '20m';
  setViewMode: (v: '100m' | '20m') => void;
  isLoadingBase: boolean;
  chartData100m: Array<{ abscisa: number } & Record<string, number | undefined>>;
  chartData20m: Array<{ abscisa: number } & Record<string, number | undefined>>;
  selectedMedIds: string[];
  medicionesConLabel: Array<{ id: string; label: string; fecha: string; datos: { registros_puntual: IRI_RegistroPuntual[] } }>;
  yearColorMap: Record<string, { izq: string; der: string }>;
  condPuntual: number;
  maxDomain100m: number;
  maxDomain20m: number;
  formatAbscisa: (val: number) => string;
  brushIndexes: { startIndex: number; endIndex: number } | null;
  setBrushIndexes: (val: { startIndex: number; endIndex: number } | null) => void;
  fullscreenChart: 'line' | 'bar' | null;
  setFullscreenChart: (val: 'line' | 'bar' | null) => void;
  unidad: string;
}) {
  const CustomDot100m = (props: any) => {
    const { cx, cy, value, stroke } = props;
    if (value == null || cx == null || cy == null) return null;
    if (value > condPuntual) return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="none" />;
    return <circle cx={cx} cy={cy} r={2} fill={stroke} stroke="none" />;
  };

  const CustomDot20m = (props: any) => {
    const { cx, cy, value } = props;
    if (value == null || cx == null || cy == null) return null;
    if (value > condPuntual) return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="none" />;
    return null;
  };

  return (
    <Card className={fullscreenChart === 'line' ? 'fixed inset-0 z-[60] bg-white p-6 shadow-2xl flex flex-col' : 'p-6'}>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-lg font-heading"><TrendingUp className="inline w-5 h-5 text-[#00C2D4] mr-2" />Perfil de Medicion</h3>
          <p className="text-xs text-slate-500 mt-0.5">Limite Analizado: {condPuntual} {unidad}</p>
        </div>

        <div className="flex items-center gap-4">
          {brushIndexes && (
            <Button variant="outline" size="sm" onClick={() => setBrushIndexes(null)} className="h-7 text-xs border-[#00C2D4] text-[#00C2D4]">
              <Maximize className="w-3 h-3 mr-1" /> Restaurar Vista
            </Button>
          )}
          <div className="flex bg-slate-100 p-1 rounded-md">
            <button className={`px-3 py-1 text-xs rounded transition-all ${viewMode === '100m' ? 'bg-white shadow text-[#00C2D4] font-semibold' : 'text-slate-500'}`} onClick={() => setViewMode('100m')}>Puntual (100m)</button>
            <button className={`px-3 py-1 text-xs rounded transition-all ${viewMode === '20m' ? 'bg-white shadow text-[#00C2D4] font-semibold' : 'text-slate-500'}`} onClick={() => setViewMode('20m')}>Crudo (20m) {isLoadingBase && '...'}</button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFullscreenChart(fullscreenChart === 'line' ? null : 'line')} className="h-7 text-xs text-slate-500 hover:text-slate-800 shrink-0">
            {fullscreenChart === 'line' ? <><Minimize className="w-3 h-3 mr-1" /> Salir</> : <><Maximize className="w-3 h-3 mr-1" /> Pantalla Completa</>}
          </Button>
        </div>
      </div>

      <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 text-sm text-slate-600 mb-6 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p>
          <strong>Nota tecnica:</strong> Algunos indicadores normativos evaluan de manera distinta el <strong>Valor Puntual</strong> y el <strong>Valor Medio</strong>.
          Los datos crudos representan la medicion base del equipo.
        </p>
      </div>

      {viewMode === '100m' && (
        <div className={fullscreenChart === 'line' ? 'flex-1 w-full min-h-0' : 'h-[450px] w-full'}>
          {selectedMedIds.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">Selecciona al menos un tramo para visualizar la grafica.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData100m} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="abscisa" tickFormatter={formatAbscisa} tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={60} />
                <YAxis domain={[0, maxDomain100m]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip
                  formatter={(value: any, name: any) => {
                    const key = String(name ?? '');
                    const m = medicionesConLabel.find((x) => x.id === key);
                    return [`${Number(value).toFixed(3)} ${unidad}`, m ? m.label : key];
                  }}
                  labelFormatter={(label) => `Abscisa: ${formatAbscisa(label as number)}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Brush
                  dataKey="abscisa"
                  height={30}
                  stroke="#00C2D4"
                  tickFormatter={formatAbscisa}
                  startIndex={brushIndexes ? brushIndexes.startIndex : 0}
                  endIndex={brushIndexes ? brushIndexes.endIndex : chartData100m.length - 1}
                  onChange={(e: any) => setBrushIndexes({ startIndex: e.startIndex, endIndex: e.endIndex })}
                />
                <ReferenceArea y1={condPuntual} y2={maxDomain100m} fill="#fee2e2" fillOpacity={0.4} />
                <ReferenceLine y={condPuntual} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Limite ${condPuntual}`, position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }} />
                {medicionesConLabel.filter((m) => selectedMedIds.includes(m.id)).map((mObj) => {
                  const year = mObj.fecha.substring(0, 4);
                  const colorBase = yearColorMap[year]?.der || '#000';
                  return (
                    <Line
                      key={mObj.id}
                      type="monotone"
                      dataKey={mObj.id}
                      name={mObj.id}
                      stroke={colorBase}
                      strokeWidth={2.5}
                      dot={<CustomDot100m />}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  );
                })}
                <Legend verticalAlign="top" height={36} formatter={(value) => {
                  const m = medicionesConLabel.find((x) => x.id === value);
                  return m ? m.label : value;
                }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {viewMode === '20m' && (
        <div className={fullscreenChart === 'line' ? 'flex-1 w-full min-h-0' : 'h-[450px] w-full'}>
          {selectedMedIds.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">Selecciona al menos un tramo para visualizar la grafica.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData20m} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="abscisa" tickFormatter={formatAbscisa} tick={{ fontSize: 11 }} minTickGap={60} />
                <YAxis domain={[0, maxDomain20m]} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(v: any, name: any) => [`${Number(v).toFixed(3)} ${unidad}`, String(name ?? '')]}
                  labelFormatter={(label) => `Abscisa: ${formatAbscisa(label as number)}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Brush
                  dataKey="abscisa"
                  height={30}
                  stroke="#00C2D4"
                  tickFormatter={formatAbscisa}
                  startIndex={brushIndexes ? brushIndexes.startIndex : 0}
                  endIndex={brushIndexes ? brushIndexes.endIndex : chartData20m.length - 1}
                  onChange={(e: any) => setBrushIndexes({ startIndex: e.startIndex, endIndex: e.endIndex })}
                />
                <ReferenceArea y1={condPuntual} y2={maxDomain20m} fill="#fee2e2" fillOpacity={0.4} />
                <ReferenceLine y={condPuntual} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Limite ${condPuntual}`, position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }} />
                {medicionesConLabel.filter((m) => selectedMedIds.includes(m.id)).map((mObj) => {
                  const year = mObj.fecha.substring(0, 4);
                  const pair = yearColorMap[year] || { izq: '#60a5fa', der: '#1d4ed8' };
                  return (
                    <React.Fragment key={mObj.id}>
                      <Line type="monotone" dataKey={`${mObj.id}_izq`} name={`Medicion Izquierda - ${mObj.label}`} stroke={pair.izq} strokeWidth={2} dot={<CustomDot20m />} activeDot={{ r: 4 }} connectNulls={false} />
                      <Line type="monotone" dataKey={`${mObj.id}_der`} name={`Medicion Derecha - ${mObj.label}`} stroke={pair.der} strokeWidth={2} strokeDasharray="4 4" dot={<CustomDot20m />} activeDot={{ r: 4 }} connectNulls={false} />
                    </React.Fragment>
                  );
                })}
                <Legend verticalAlign="top" height={36} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </Card>
  );
}
