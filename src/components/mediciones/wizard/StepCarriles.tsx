import * as React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function StepCarriles({
  carriles,
  seleccionados,
  toggleCarril,
  onPrev,
  onNext,
}: {
  carriles: Array<{ tag: string; descripcion?: string }>;
  seleccionados: string[];
  toggleCarril: (tag: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="p-6 animate-in fade-in">
      <h2 className="text-lg font-bold mb-2 border-b pb-2">2. Carriles</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {carriles.map((carril) => {
          const isSelected = seleccionados.includes(carril.tag);
          return (
            <div
              key={carril.tag}
              onClick={() => toggleCarril(carril.tag)}
              className={`p-4 rounded-lg border-2 cursor-pointer flex items-center gap-4 ${
                isSelected ? 'border-[#00C2D4] bg-[#00C2D4]/5' : 'border-slate-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#00C2D4] bg-[#00C2D4] text-[#0A1628]' : 'border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-lg block">{carril.tag}</span>
                <span className="text-xs text-slate-500">{carril.descripcion || 'Sin descripcion'}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onPrev}><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
        <Button onClick={onNext} disabled={seleccionados.length === 0}>Siguiente <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </Card>
  );
}
