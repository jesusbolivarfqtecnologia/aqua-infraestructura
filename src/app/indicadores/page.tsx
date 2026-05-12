'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Eye, Grid, List, Plus, Search, Trash2 } from 'lucide-react';
import type { Indicador } from '@/types';
import { FRECUENCIAS } from '@/types';
import { AppShell } from '@/components/layout';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InfoBanner } from '@/components/shared/InfoBanner';
import { Input } from '@/components/shared/Input';
import { IndicadorDetalle, IndicadorForm } from '@/components/indicadores';
import type { IndicadorFormData } from '@/components/indicadores/IndicadorForm';

export default function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [viewMode, setViewMode] = useState<'lista' | 'tarjetas'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIndicador, setSelectedIndicador] = useState<Indicador | null>(null);
  const [indicadorToDelete, setIndicadorToDelete] = useState<Indicador | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/indicadores');
      const json = await res.json();
      setIndicadores(json.data || []);
    } catch (e: any) {
      setError(e.message || 'Error al cargar indicadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicadores();
  }, []);

  const handleSave = async (payload: IndicadorFormData, id?: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(id ? `/api/indicadores/${id}` : '/api/indicadores', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        await fetchIndicadores();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/indicadores/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) setError(json.error.message || 'Error');
      else await fetchIndicadores();
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(
    () =>
      indicadores.filter((i) =>
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.identificador.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [indicadores, searchTerm]
  );

  const existingIdentifiers = useMemo(
    () => indicadores.map((i) => i.identificador.toLowerCase()),
    [indicadores]
  );

  return (
    <AppShell active="indicadores">
      <div className="space-y-6 animate-in fade-in h-full flex flex-col">
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Indicadores Normativos</h1>
            <p className="text-slate-500 text-sm">Gestion de parametros y limites tecnicos.</p>
          </div>
          <Button onClick={() => { setSelectedIndicador(null); setIsFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo Indicador
          </Button>
        </div>

        <InfoBanner title="Definicion de Indicadores Contractuales">
          En este modulo se configuran los limites y metas tecnicas segun los anexos del contrato o
          normatividad. El sistema evaluara los datos crudos contra valores puntuales y medios definidos aqui.
        </InfoBanner>

        <div className="flex justify-between items-center bg-white p-2 rounded-lg border shadow-sm shrink-0">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input placeholder="Buscar..." className="pl-9 h-10 border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
            <button className={`p-2 rounded ${viewMode === 'lista' ? 'bg-white shadow text-[#00C2D4]' : 'text-slate-500'}`} onClick={() => setViewMode('lista')}><List className="w-4 h-4" /></button>
            <button className={`p-2 rounded ${viewMode === 'tarjetas' ? 'bg-white shadow text-[#00C2D4]' : 'text-slate-500'}`} onClick={() => setViewMode('tarjetas')}><Grid className="w-4 h-4" /></button>
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {loading && <div className="text-slate-500">Cargando...</div>}

        <div className="flex-1 overflow-y-auto pb-8">
          {viewMode === 'lista' ? (
            <Card className="overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 w-16">ID</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Frecuencia</th>
                    <th className="p-3 text-center">Condiciones</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredData.map((ind) => (
                    <tr key={ind.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#1B3A6B]">{ind.identificador}</td>
                      <td className="p-3 font-medium">{ind.nombre}</td>
                      <td className="p-3"><Badge>{FRECUENCIAS[ind.frecuencia].label}</Badge></td>
                      <td className="p-3 text-center"><span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-100 font-bold">{ind.condiciones.length}</span></td>
                      <td className="p-3 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedIndicador(ind); setIsDetailOpen(true); }}><Eye className="w-4 h-4 text-blue-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedIndicador(ind); setIsFormOpen(true); }}><Edit2 className="w-4 h-4 text-slate-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setIndicadorToDelete(ind)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((ind) => (
                <Card key={ind.id} className="p-5 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-4">{ind.identificador} - {ind.nombre}</h3>
                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setSelectedIndicador(ind); setIsDetailOpen(true); }}>Ver</Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setSelectedIndicador(ind); setIsFormOpen(true); }}>Editar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <IndicadorForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          indicadorEdit={selectedIndicador}
          onSave={handleSave}
          isSaving={saving}
          existingIdentifiers={existingIdentifiers}
        />
        <IndicadorDetalle isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} indicador={selectedIndicador} />
        <ConfirmDialog
          isOpen={indicadorToDelete !== null}
          title="Eliminar"
          message="Seguro?"
          onClose={() => setIndicadorToDelete(null)}
          onConfirm={() => { if (indicadorToDelete) handleDelete(indicadorToDelete.id); setIndicadorToDelete(null); }}
        />
      </div>
    </AppShell>
  );
}
