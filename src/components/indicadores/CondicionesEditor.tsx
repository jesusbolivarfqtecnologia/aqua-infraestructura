import * as React from 'react';
import { Check, Plus, X } from 'lucide-react';
import type { CondicionIndicador, OperadorCondicion, TipoCondicion } from '@/types';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';

const generateId = () => Math.random().toString(36).substring(2, 10);

export function CondicionesEditor({
  condiciones,
  onChange,
  unidadMedida,
}: {
  condiciones: CondicionIndicador[];
  onChange: (next: CondicionIndicador[]) => void;
  unidadMedida?: string;
}) {
  const [isAddingCond, setIsAddingCond] = React.useState(false);
  const [newCond, setNewCond] = React.useState<Partial<CondicionIndicador>>({
    nombre: '',
    tipo: 'PUNTUAL',
    operador: '<=',
    valor: 0,
    unidad: '',
  });

  React.useEffect(() => {
    setNewCond((prev) => ({ ...prev, unidad: unidadMedida || prev.unidad || '' }));
  }, [unidadMedida]);

  const handleAddCondicion = () => {
    if (!newCond.nombre?.trim()) return;
    const cond: CondicionIndicador = {
      id: generateId(),
      nombre: newCond.nombre.trim(),
      tipo: newCond.tipo as TipoCondicion,
      operador: newCond.operador as OperadorCondicion,
      valor: Number(newCond.valor),
      valor_max: newCond.operador === 'between' ? Number(newCond.valor_max) : undefined,
      unidad: newCond.unidad || unidadMedida || '',
    };
    onChange([...(condiciones || []), cond]);
    setIsAddingCond(false);
    setNewCond({ nombre: '', tipo: 'PUNTUAL', operador: '<=', valor: 0, unidad: unidadMedida || '' });
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-sm font-bold text-[#1B3A6B]">Condiciones</h3>
        {!isAddingCond && (
          <Button size="sm" variant="outline" onClick={() => setIsAddingCond(true)}>
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        )}
      </div>
      <div className="border rounded-md bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Operador</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Unidad</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {condiciones?.map((c) => (
              <tr key={c.id}>
                <td className="p-2 font-medium">{c.nombre}</td>
                <td className="p-2">
                  <Badge variant="cyan">{c.tipo}</Badge>
                </td>
                <td className="p-2 font-mono">{c.operador}</td>
                <td className="p-2">{c.operador === 'between' ? `${c.valor} - ${c.valor_max}` : c.valor}</td>
                <td className="p-2">{c.unidad}</td>
                <td className="p-2 text-right">
                  <button onClick={() => onChange(condiciones.filter((x) => x.id !== c.id))}>
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
            {isAddingCond && (
              <tr className="bg-blue-50/50">
                <td className="p-1">
                  <Input className="h-7 text-xs" value={newCond.nombre || ''} onChange={(e) => setNewCond({ ...newCond, nombre: e.target.value })} />
                </td>
                <td className="p-1">
                  <Select
                    className="h-7 text-xs"
                    value={newCond.tipo}
                    onChange={(e) => setNewCond({ ...newCond, tipo: e.target.value as TipoCondicion })}
                  >
                    <option value="PUNTUAL">PUNTUAL</option>
                    <option value="MEDIO">MEDIO</option>
                    <option value="GENERAL">GENERAL</option>
                  </Select>
                </td>
                <td className="p-1">
                  <Select
                    className="h-7 text-xs"
                    value={newCond.operador}
                    onChange={(e) => setNewCond({ ...newCond, operador: e.target.value as OperadorCondicion })}
                  >
                    <option value="<=">{'<='}</option>
                    <option value=">=">{'>='}</option>
                    <option value="between">between</option>
                  </Select>
                </td>
                <td className="p-1">
                  <Input
                    className="h-7 text-xs w-16 inline-block"
                    type="number"
                    value={newCond.valor ?? ''}
                    onChange={(e) => setNewCond({ ...newCond, valor: Number(e.target.value) })}
                  />
                  {newCond.operador === 'between' && (
                    <Input
                      className="h-7 text-xs w-16 inline-block ml-1"
                      type="number"
                      value={newCond.valor_max ?? ''}
                      onChange={(e) => setNewCond({ ...newCond, valor_max: Number(e.target.value) })}
                    />
                  )}
                </td>
                <td className="p-1">
                  <Input className="h-7 text-xs w-12" value={newCond.unidad || ''} onChange={(e) => setNewCond({ ...newCond, unidad: e.target.value })} />
                </td>
                <td className="p-1 text-right flex gap-1">
                  <button onClick={handleAddCondicion} className="text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsAddingCond(false)} className="text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
