import * as React from 'react';
import { AlertTriangle, Check, ChevronLeft, Save } from 'lucide-react';
import type { DatosIRI, Ruta } from '@/types';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function StepConfirmacion({
  parsedData,
  rutaActiva,
  proyectoNombre,
  ufNombre,
  indicadorNombre,
  fecha,
  carriles,
  onPrev,
  onSave,
}: {
  parsedData: { datos: DatosIRI; registrosBase: any[] };
  rutaActiva: Ruta | null;
  proyectoNombre: string;
  ufNombre: string;
  indicadorNombre: string;
  fecha: string;
  carriles: string[];
  onPrev: () => void;
  onSave: () => void;
}) {
  const estadoGlobal = parsedData.datos.estadisticas.cumple_global;
  return (
    <Card className="p-6 animate-in fade-in">
      <h2 className="text-lg font-bold mb-6 border-b pb-2">4. Confirmacion Final</h2>
      <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block">Proyecto:</span>
            <span className="font-semibold">{proyectoNombre || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">UF:</span>
            <span className="font-semibold">{ufNombre || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Ruta:</span>
            <span className="font-semibold">{rutaActiva?.nombre || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Indicador:</span>
            <span className="font-semibold">{indicadorNombre || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Fecha:</span>
            <span className="font-semibold">{fecha || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Carriles:</span>
            <span className="font-semibold">{carriles.length ? carriles.join(', ') : 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Registros base:</span>
            <span className="font-semibold">{parsedData.datos.estadisticas.total_registros_base}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Estado global:</span>
            <span className={`font-semibold ${estadoGlobal ? 'text-emerald-700' : 'text-red-700'}`}>
              {estadoGlobal ? 'CUMPLE' : 'INCUMPLE'}
            </span>
          </div>
        </div>
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            estadoGlobal
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-red-100 text-red-800 border-red-200'
          }`}
        >
          {estadoGlobal ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          <h4 className="font-bold text-lg">
            Estado Global: {estadoGlobal ? 'CUMPLE' : 'INCUMPLE'}
          </h4>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onPrev}><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
        <Button onClick={onSave} className="px-8"><Save className="w-5 h-5 mr-2" /> GUARDAR</Button>
      </div>
    </Card>
  );
}
