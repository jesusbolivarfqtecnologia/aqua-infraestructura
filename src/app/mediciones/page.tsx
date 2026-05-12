'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Indicador, Medicion, Proyecto, Ruta } from '@/types';
import { AppShell } from '@/components/layout';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { InfoBanner } from '@/components/shared/InfoBanner';
import { Select } from '@/components/shared/Select';
import { formatFecha } from '@/lib/utils/formatters';

export default function MedicionesPage() {
  const router = useRouter();
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [rutasMap, setRutasMap] = useState<Record<string, Ruta>>({});
  const [filters, setFilters] = useState({ proyectoId: '', indicadorId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Medicion | null>(null);

  const indicadorMap = useMemo(
    () => indicadores.reduce((acc, i) => ({ ...acc, [i.id]: i }), {} as Record<string, Indicador>),
    [indicadores]
  );

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [medRes, projRes, indRes] = await Promise.all([
        fetch('/api/mediciones'),
        fetch('/api/proyectos'),
        fetch('/api/indicadores'),
      ]);
      const medJson = await medRes.json();
      const projJson = await projRes.json();
      const indJson = await indRes.json();

      if (medJson.error) throw new Error(medJson.error.message || 'Error al cargar mediciones');
      if (projJson.error) throw new Error(projJson.error.message || 'Error al cargar proyectos');
      if (indJson.error) throw new Error(indJson.error.message || 'Error al cargar indicadores');

      const medList: Medicion[] = medJson.data || [];
      setMediciones(medList);
      setProyectos(projJson.data || []);
      setIndicadores(indJson.data || []);

      const routeIds = Array.from(new Set(medList.map((m) => m.ruta_id)));
      if (routeIds.length > 0) {
        const routeEntries = await Promise.all(
          routeIds.map(async (id) => {
            const res = await fetch(`/api/rutas/${id}`);
            const json = await res.json();
            if (json.data) return [id, json.data] as const;
            return null;
          })
        );
        const nextMap: Record<string, Ruta> = {};
        routeEntries.forEach((entry) => {
          if (entry) nextMap[entry[0]] = entry[1];
        });
        setRutasMap(nextMap);
      }
    } catch (e: any) {
      setError(e.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return mediciones.filter((m) => {
      if (filters.proyectoId && m.proyecto_id !== filters.proyectoId) return false;
      if (filters.indicadorId && m.indicador_id !== filters.indicadorId) return false;
      return true;
    });
  }, [mediciones, filters]);

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mediciones/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || 'Error');
      await fetchAll();
    } catch (e: any) {
      setError(e.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="mediciones">
      <div className="space-y-6 animate-in fade-in h-full flex flex-col">
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#0A1628]">Mediciones</h1>
            <p className="text-slate-500 text-sm">Carga y visualizacion de mediciones IRI.</p>
          </div>
          <Button onClick={() => router.push('/mediciones/nueva')}>
            <Plus className="w-4 h-4 mr-2" /> Cargar Medicion
          </Button>
        </div>

        <InfoBanner title="Registro de Mediciones">
          En este modulo se cargan los archivos CSV de campo y se visualiza el cumplimiento por tramo.
        </InfoBanner>

        <div className="bg-white p-3 rounded-lg border shadow-sm flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Proyecto</label>
            <Select value={filters.proyectoId} onChange={(e) => setFilters((f) => ({ ...f, proyectoId: e.target.value }))}>
              <option value="">Todos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </Select>
          </div>
          <div className="min-w-[220px]">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Indicador</label>
            <Select value={filters.indicadorId} onChange={(e) => setFilters((f) => ({ ...f, indicadorId: e.target.value }))}>
              <option value="">Todos</option>
              {indicadores.map((i) => (
                <option key={i.id} value={i.id}>{i.identificador} - {i.nombre}</option>
              ))}
            </Select>
          </div>
          <Button variant="outline" onClick={() => setFilters({ proyectoId: '', indicadorId: '' })}>Limpiar</Button>
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {loading && <div className="text-slate-500">Cargando...</div>}

        <div className="flex-1 overflow-y-auto pb-8">
          <Card className="overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Ruta</th>
                  <th className="p-3">Carril(es)</th>
                  <th className="p-3">Indicador</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((m) => {
                  const indicador = indicadorMap[m.indicador_id];
                  const rutaNombre = rutasMap[m.ruta_id]?.nombre || `Ruta ${m.ruta_id.slice(0, 6)}`;
                  const cumple = m.datos?.estadisticas?.cumple_global;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{formatFecha(m.fecha)}</td>
                      <td className="p-3">{rutaNombre}</td>
                      <td className="p-3">{m.carriles_seleccionados.join(', ')}</td>
                      <td className="p-3">{indicador ? `${indicador.identificador} - ${indicador.nombre}` : 'N/A'}</td>
                      <td className="p-3 text-center">
                        <Badge variant={cumple ? 'green' : 'red'}>{cumple ? 'CUMPLE' : 'INCUMPLE'}</Badge>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/mediciones/${m.id}`)}>
                          <Eye className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(m)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <EmptyState title="Sin mediciones" description="Aun no hay registros cargados." />
            )}
          </Card>
        </div>

        <ConfirmDialog
          isOpen={toDelete !== null}
          title="Eliminar Medicion"
          message="Seguro que deseas eliminar esta medicion?"
          onClose={() => setToDelete(null)}
          onConfirm={() => { if (toDelete) handleDelete(toDelete.id); setToDelete(null); }}
        />
      </div>
    </AppShell>
  );
}
