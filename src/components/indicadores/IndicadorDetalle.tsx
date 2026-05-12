import * as React from 'react';
import { Clock } from 'lucide-react';
import type { Indicador } from '@/types';
import { FRECUENCIAS } from '@/types';
import { Badge } from '@/components/shared/Badge';
import { SlidePanel } from '@/components/shared/SlidePanel';

export function IndicadorDetalle({
  isOpen,
  onClose,
  indicador,
}: {
  isOpen: boolean;
  onClose: () => void;
  indicador: Indicador | null;
}) {
  if (!indicador) return null;

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="Detalle del Indicador" customWidth="w-full sm:w-[720px]">
      <div className="p-6 space-y-8">
        <div className="flex items-start gap-4 pb-6 border-b">
          <div className="w-16 h-16 rounded-xl bg-[#00C2D4]/10 flex items-center justify-center text-[#0A1628] font-bold text-2xl">
            {indicador.identificador}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{indicador.nombre}</h1>
            <Badge variant="blue">
              <Clock className="w-3 h-3 mr-1" /> {FRECUENCIAS[indicador.frecuencia].label}
            </Badge>
          </div>
        </div>
        <section className="space-y-4">
          <h3 className="text-sm font-bold border-b pb-2">Condiciones de Aceptacion</h3>
          <div className="space-y-2">
            {indicador.condiciones.map((c) => (
              <div key={c.id} className="flex justify-between p-3 bg-white border rounded shadow-sm">
                <div className="flex gap-3 items-center">
                  <Badge variant="cyan">{c.tipo}</Badge>
                  <span className="font-medium">{c.nombre}</span>
                </div>
                <div className="font-mono text-[#1B3A6B] font-bold bg-slate-100 px-3 py-1 rounded">
                  {c.operador} {c.valor} {c.operador === 'between' ? `y ${c.valor_max}` : ''} {c.unidad}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SlidePanel>
  );
}
