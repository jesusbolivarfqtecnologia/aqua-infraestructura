import * as React from 'react';
import type { Indicador, Proyecto, Ruta, UnidadFuncional } from '@/types';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';

export function StepContexto({
  form,
  setForm,
  proyectos,
  ufs,
  rutas,
  indicadores,
  maxFecha,
  ultimaMedicion,
  onNext,
}: {
  form: { proyecto_id: string; uf_id: string; ruta_id: string; indicador_id: string; fecha: string };
  setForm: (next: { proyecto_id: string; uf_id: string; ruta_id: string; indicador_id: string; fecha: string }) => void;
  proyectos: Proyecto[];
  ufs: UnidadFuncional[];
  rutas: Ruta[];
  indicadores: Indicador[];
  maxFecha?: string;
  ultimaMedicion?: { fecha: string; dias: number; vencida: boolean } | null;
  onNext: () => void;
}) {
  const canNext = Boolean(form.proyecto_id && form.uf_id && form.ruta_id && form.indicador_id && form.fecha);

  return (
    <Card className="p-6 animate-in fade-in">
      <h2 className="text-lg font-bold mb-6 border-b pb-2">1. Contexto</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Proyecto</label>
            <Select
              value={form.proyecto_id}
              onChange={(e) => setForm({ ...form, proyecto_id: e.target.value, uf_id: '', ruta_id: '' })}
            >
              <option value="">Seleccione...</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">UF</label>
            <Select
              value={form.uf_id}
              onChange={(e) => setForm({ ...form, uf_id: e.target.value, ruta_id: '' })}
              disabled={!form.proyecto_id}
            >
              <option value="">Seleccione...</option>
              {ufs.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Ruta</label>
            <Select
              value={form.ruta_id}
              onChange={(e) => setForm({ ...form, ruta_id: e.target.value })}
              disabled={!form.uf_id}
            >
              <option value="">Seleccione...</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Indicador</label>
            <Select
              value={form.indicador_id}
              onChange={(e) => setForm({ ...form, indicador_id: e.target.value })}
            >
              <option value="">Seleccione...</option>
              {indicadores.map((i) => (
                <option key={i.id} value={i.id}>{i.identificador} - {i.nombre}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Fecha</label>
            <Input
              type="date"
              max={maxFecha}
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>
        </div>
      </div>
      {ultimaMedicion && (
        <div
          className={`mt-6 p-3 rounded-md border text-sm ${
            ultimaMedicion.vencida
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <span className="font-semibold">Ultima medicion:</span> {ultimaMedicion.fecha} (hace {ultimaMedicion.dias} dias)
          {ultimaMedicion.vencida ? ' - Vencida' : ' - Vigente'}
        </div>
      )}
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={!canNext}>Siguiente</Button>
      </div>
    </Card>
  );
}
