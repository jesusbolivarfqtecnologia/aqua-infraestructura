import * as React from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import type { CondicionIndicador, FrecuenciaKey, Indicador } from '@/types';
import { FRECUENCIAS } from '@/types';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { CondicionesEditor } from './CondicionesEditor';

export type IndicadorFormData = {
  nombre: string;
  identificador: string;
  concepto_medicion: string;
  normatividad: string;
  metodo_medida: string;
  frecuencia: FrecuenciaKey;
  unidad_medida: string;
  tiempo_correccion_valor: number | null;
  tiempo_correccion_unidad: string;
  condiciones: CondicionIndicador[];
};

export function IndicadorForm({
  isOpen,
  onClose,
  indicadorEdit,
  onSave,
  isSaving,
  existingIdentifiers,
}: {
  isOpen: boolean;
  onClose: () => void;
  indicadorEdit: Indicador | null;
  onSave: (payload: IndicadorFormData, id?: string) => Promise<void>;
  isSaving?: boolean;
  existingIdentifiers: string[];
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<IndicadorFormData>({
    nombre: '',
    identificador: '',
    concepto_medicion: '',
    normatividad: '',
    metodo_medida: '',
    frecuencia: 'MENSUAL',
    unidad_medida: '',
    tiempo_correccion_valor: null,
    tiempo_correccion_unidad: 'N/A',
    condiciones: [],
  });

  React.useEffect(() => {
    if (isOpen) {
      if (indicadorEdit) {
        setForm({
          nombre: indicadorEdit.nombre,
          identificador: indicadorEdit.identificador,
          concepto_medicion: indicadorEdit.concepto_medicion,
          normatividad: indicadorEdit.normatividad,
          metodo_medida: indicadorEdit.metodo_medida,
          frecuencia: indicadorEdit.frecuencia,
          unidad_medida: indicadorEdit.unidad_medida,
          tiempo_correccion_valor: indicadorEdit.tiempo_correccion_valor,
          tiempo_correccion_unidad: indicadorEdit.tiempo_correccion_unidad,
          condiciones: indicadorEdit.condiciones || [],
        });
      } else {
        setForm({
          nombre: '',
          identificador: '',
          concepto_medicion: '',
          normatividad: '',
          metodo_medida: '',
          frecuencia: 'MENSUAL',
          unidad_medida: '',
          tiempo_correccion_valor: null,
          tiempo_correccion_unidad: 'N/A',
          condiciones: [],
        });
      }
      setError(null);
    }
  }, [isOpen, indicadorEdit]);

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.identificador.trim()) {
      setError('Nombre e identificador son obligatorios.');
      return;
    }
    if (!form.condiciones || form.condiciones.length === 0) {
      setError('Agregue al menos 1 condicion.');
      return;
    }

    const nextId = form.identificador.trim().toLowerCase();
    const hasDuplicate = existingIdentifiers.some((id) => id === nextId && id !== indicadorEdit?.identificador?.toLowerCase());
    if (hasDuplicate) {
      setError(`Identificador "${form.identificador}" ya existe.`);
      return;
    }

    setError(null);
    await onSave(
      {
        ...form,
        identificador: form.identificador.trim().toUpperCase(),
        unidad_medida: form.unidad_medida.trim(),
      },
      indicadorEdit?.id
    );
    onClose();
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={indicadorEdit ? 'Editar Indicador' : 'Nuevo Indicador'}
      customWidth="w-full sm:w-[680px]"
    >
      <div className="p-6 space-y-8 pb-24">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#1B3A6B] border-b pb-2">Identificacion</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold block mb-1">Nombre</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">ID</label>
              <Input value={form.identificador} onChange={(e) => setForm({ ...form, identificador: e.target.value.toUpperCase() })} />
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#1B3A6B] border-b pb-2">Parametros</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Frecuencia</label>
              <Select value={form.frecuencia} onChange={(e) => setForm({ ...form, frecuencia: e.target.value as FrecuenciaKey })}>
                {Object.entries(FRECUENCIAS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Unidad (Global)</label>
              <Input value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} />
            </div>
          </div>
        </section>

        <CondicionesEditor
          condiciones={form.condiciones}
          onChange={(next) => setForm({ ...form, condiciones: next })}
          unidadMedida={form.unidad_medida}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end gap-3 z-10">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" /> Guardar
        </Button>
      </div>
    </SlidePanel>
  );
}
