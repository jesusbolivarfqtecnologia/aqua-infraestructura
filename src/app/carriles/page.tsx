'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ConfiguracionTag } from '@/types';
import { AppShell } from '@/components/layout';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { InfoBanner } from '@/components/shared/InfoBanner';
import { InlineEdit } from '@/components/shared/InlineEdit';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';

export default function PlantillasCalzadasPage() {
  const [tags, setTags] = useState<ConfiguracionTag[]>([]);
  const [nuevoTag, setNuevoTag] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'bifurcado' | 'unico'>('bifurcado');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/configuracion-tags');
      const json = await res.json();
      setTags(json.data || []);
    } catch (e: any) {
      setError(e.message || 'Error al cargar tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = async () => {
    if (!nuevoTag.trim() || !nuevaDesc.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/configuracion-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: nuevoTag.trim().toUpperCase(),
          descripcion: nuevaDesc.trim(),
          tipo: nuevoTipo,
        }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        setNuevoTag('');
        setNuevaDesc('');
        fetchTags();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, payload: Partial<ConfiguracionTag>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/configuracion-tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        fetchTags();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar tag?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/configuracion-tags/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        fetchTags();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="carriles">
      <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[#0A1628]">Plantillas de Carriles</h1>
        <p className="text-slate-500 text-sm">Configuracion maestra de los tags de carriles.</p>
      </div>

      <InfoBanner title="Diccionario de Carriles">
        Aqui defines el catalogo de carriles que podran ser asignados a las rutas. Por ejemplo, el
        acronimo "DD" puede significar "Calzada Derecha - Carril Derecho". Si configuras una regla
        como "Unico" para vias de una sola calzada, el sistema no permitira mezclarlo con etiquetas
        de vias bifurcadas en la misma ruta.
      </InfoBanner>

      <Card className="p-4 bg-white">
        <div className="flex flex-wrap items-end gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Acronimo</label>
            <Input placeholder="Ej: DD" value={nuevoTag} onChange={(e) => setNuevoTag(e.target.value)} />
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Descripcion</label>
            <Input placeholder="Ej: Calzada Derecha - Carril Derecho" value={nuevaDesc} onChange={(e) => setNuevaDesc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Regla</label>
            <Select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value as 'bifurcado' | 'unico')}>
              <option value="bifurcado">Bifurcado (Multiples calzadas)</option>
              <option value="unico">Unico (Calzada sencilla)</option>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" /> Anadir Carril
          </Button>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-slate-500 mb-4">Cargando...</div>}

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3 w-32">Tag</th>
                <th className="px-4 py-3">Descripcion</th>
                <th className="px-4 py-3 w-40">Tipo</th>
                <th className="px-4 py-3 text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-[#1B3A6B]">
                    <InlineEdit value={tag.tag} onSave={(val) => handleUpdate(tag.id, { tag: val.toUpperCase() })} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <InlineEdit value={tag.descripcion} onSave={(val) => handleUpdate(tag.id, { descripcion: val })} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={tag.tipo === 'bifurcado' ? 'blue' : 'amber'}>
                      {tag.tipo === 'bifurcado' ? 'Bifurcado' : 'Unico'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(tag.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No hay tags configurados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </AppShell>
  );
}
