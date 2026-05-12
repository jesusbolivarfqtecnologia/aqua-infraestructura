'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Layers, Map as MapIcon, Plus, Save, Trash2 } from 'lucide-react';
import type { ConfiguracionTag, Proyecto, Ruta, UnidadFuncional } from '@/types';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { InfoBanner } from '@/components/shared/InfoBanner';
import { InlineEdit } from '@/components/shared/InlineEdit';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { TagMultiSelect } from '@/components/shared/TagMultiSelect';

const generateId = () => Math.random().toString(36).substring(2, 10);

export default function UnidadesRutasPage() {
  const searchParams = useSearchParams();
  const preselectProyectoId = searchParams.get('proyectoId');

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [ufs, setUfs] = useState<UnidadFuncional[]>([]);
  const [activeUfId, setActiveUfId] = useState<string | null>(null);
  const [localRutas, setLocalRutas] = useState<Ruta[]>([]);
  const [tags, setTags] = useState<ConfiguracionTag[]>([]);
  const [nuevaUfNombre, setNuevaUfNombre] = useState('');
  const [nuevaRutaNombre, setNuevaRutaNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProject = useMemo(
    () => proyectos.find((p) => p.id === activeProjectId) || null,
    [proyectos, activeProjectId]
  );

  const fetchProyectos = async () => {
    const res = await fetch('/api/proyectos');
    const json = await res.json();
    const list = json.data || [];
    setProyectos(list);
    if (list.length > 0) {
      const nextId = preselectProyectoId || list[0].id;
      setActiveProjectId(nextId);
    }
  };

  const fetchTags = async () => {
    const res = await fetch('/api/configuracion-tags');
    const json = await res.json();
    setTags(json.data || []);
  };

  const fetchUfs = async (proyectoId: string) => {
    if (!proyectoId) return;
    const res = await fetch(`/api/unidades-funcionales?proyecto_id=${proyectoId}`);
    const json = await res.json();
    setUfs(json.data || []);
  };

  const fetchRutas = async (ufId: string) => {
    if (!ufId) return;
    const res = await fetch(`/api/rutas?unidad_funcional_id=${ufId}`);
    const json = await res.json();
    setLocalRutas(json.data || []);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProyectos(), fetchTags()])
      .catch((e) => setError(e.message || 'Error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeProjectId) fetchUfs(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (activeUfId) fetchRutas(activeUfId);
  }, [activeUfId]);

  const handleAddUF = async () => {
    if (!nuevaUfNombre.trim() || !activeProjectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/unidades-funcionales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaUfNombre, proyecto_id: activeProjectId }),
      });
      const json = await res.json();
      if (json.error) setError(json.error.message || 'Error');
      else {
        setNuevaUfNombre('');
        fetchUfs(activeProjectId);
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUF = async (id: string, nombre: string) => {
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/unidades-funcionales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      const json = await res.json();
      if (json.error) setError(json.error.message || 'Error');
      else fetchUfs(activeProjectId);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUF = async (id: string) => {
    if (!confirm('Eliminar unidad funcional?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/unidades-funcionales/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) setError(json.error.message || 'Error');
      else fetchUfs(activeProjectId);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRutaLocal = () => {
    if (!nuevaRutaNombre.trim() || !activeUfId) return;
    setLocalRutas((prev) => [
      ...prev,
      {
        id: `tmp-${generateId()}`,
        nombre: nuevaRutaNombre.trim(),
        unidad_funcional_id: activeUfId,
        carriles_tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    setNuevaRutaNombre('');
  };

  const handleDeleteRuta = async (ruta: Ruta) => {
    if (!confirm('Eliminar ruta?')) return;
    if (ruta.id.startsWith('tmp-')) {
      setLocalRutas((prev) => prev.filter((r) => r.id !== ruta.id));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rutas/${ruta.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) setError(json.error.message || 'Error');
      else fetchRutas(ruta.unidad_funcional_id);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRutasBatch = async () => {
    if (!activeUfId) return;
    setLoading(true);
    setError(null);
    try {
      for (const r of localRutas) {
        if (r.id.startsWith('tmp-')) {
          await fetch('/api/rutas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: r.nombre,
              unidad_funcional_id: activeUfId,
              carriles_tags: r.carriles_tags,
            }),
          });
        } else {
          await fetch(`/api/rutas/${r.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: r.nombre,
              carriles_tags: r.carriles_tags,
            }),
          });
        }
      }
      fetchRutas(activeUfId);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const hasProyecto = Boolean(activeProjectId);

  return (
    <AppShell active="rutas">
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-slate-500 mb-4">Cargando...</div>}

      {!hasProyecto ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <AlertTriangle className="w-12 h-12 mb-4 text-slate-300" />
          <h2 className="text-xl font-heading">Ningun proyecto seleccionado</h2>
          <p className="mt-2">Por favor, selecciona o crea un proyecto en el modulo de Proyectos.</p>
        </div>
      ) : (
        <div className="h-full flex flex-col relative animate-in fade-in">
          <div className="mb-6 shrink-0">
            <h1 className="text-2xl font-heading font-bold text-[#0A1628]">Unidades Funcionales & Rutas</h1>
            <div className="mt-2 flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Proyecto actual:</label>
              <Select value={activeProjectId} onChange={(e) => { setActiveUfId(null); setActiveProjectId(e.target.value); }}>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Select>
            </div>
            <p className="text-slate-500 text-sm mt-2">Proyecto actual: <strong className="text-[#1B3A6B]">{activeProject?.nombre}</strong></p>
          </div>

          <InfoBanner title="Jerarquia de Infraestructura">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Unidad Funcional (UF):</strong> Tramo mayor del proyecto que se evalua de forma independiente.</li>
              <li><strong>Rutas:</strong> Dentro de cada UF, define rutas especificas. A cada ruta asigna los <strong>Carriles</strong> que la componen (ej. DD, DI).</li>
            </ul>
          </InfoBanner>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Card className="flex-1 flex flex-col border-t-4 border-t-[#1B3A6B]">
              <div className="p-4 border-b bg-slate-50/80 flex items-center gap-4 shrink-0">
                <div className="flex-1 relative">
                  <Layers className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Nombre de la nueva Unidad Funcional..."
                    className="pl-10"
                    value={nuevaUfNombre}
                    onChange={(e) => setNuevaUfNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUF()}
                  />
                </div>
                <Button onClick={handleAddUF} className="shrink-0">
                  <Plus className="w-4 h-4 mr-2" /> Anadir UF
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white sticky top-0 shadow-sm z-10 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="px-6 py-3">Nombre Unidad Funcional</th>
                      <th className="px-6 py-3 text-right">Opciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ufs.map((uf) => (
                      <tr key={uf.id} className={`hover:bg-slate-50 transition-colors ${activeUfId === uf.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-[#1B3A6B]">
                          <InlineEdit value={uf.nombre} onSave={(val) => handleUpdateUF(uf.id, val)} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 flex justify-end items-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-[#0A1628] hover:bg-[#1B3A6B]"
                            onClick={() => setActiveUfId(uf.id)}
                          >
                            <MapIcon className="w-4 h-4 mr-2 text-[#00C2D4]" /> Rutas
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUF(uf.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {ufs.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center text-slate-500">Anade la primera Unidad Funcional para comenzar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <SlidePanel
            isOpen={activeUfId !== null}
            onClose={() => setActiveUfId(null)}
            title={<span>Rutas de <strong className="text-[#1B3A6B]">{ufs.find((u) => u.id === activeUfId)?.nombre}</strong></span>}
          >
            <div className="flex flex-col h-full space-y-4 p-4">
              <div className="flex gap-2 shrink-0">
                <Input
                  placeholder="Nombre de nueva ruta..."
                  value={nuevaRutaNombre}
                  onChange={(e) => setNuevaRutaNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRutaLocal()}
                />
                <Button onClick={handleAddRutaLocal}>Anadir</Button>
              </div>
              <div className="border rounded-md overflow-hidden bg-white flex-1 flex flex-col shadow-sm">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3 min-w-[120px]">Ruta</th>
                        <th className="px-4 py-3 min-w-[200px]">Carril</th>
                        <th className="px-4 py-3 text-right w-[80px]">Opciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {localRutas.map((ruta) => (
                        <tr key={ruta.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800 align-top">
                            <InlineEdit value={ruta.nombre} onSave={(val) => setLocalRutas((prev) => prev.map((r) => r.id === ruta.id ? { ...r, nombre: val } : r))} />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <TagMultiSelect
                              value={ruta.carriles_tags}
                              options={tags}
                              onChange={(vals) => setLocalRutas((prev) => prev.map((r) => r.id === ruta.id ? { ...r, carriles_tags: vals } : r))}
                            />
                          </td>
                          <td className="px-4 py-3 text-right align-top">
                            <Button variant="ghost" size="icon" className="text-red-500 h-6 w-6" onClick={() => handleDeleteRuta(ruta)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {localRutas.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No hay rutas configuradas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end shrink-0">
                  <Button onClick={handleSaveRutasBatch}>
                    <Save className="w-4 h-4 mr-2" /> Guardar Todo
                  </Button>
                </div>
              </div>
            </div>
          </SlidePanel>
        </div>
      )}
    </AppShell>
  );
}
