'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Map as MapIcon, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { InfoBanner } from '@/components/shared/InfoBanner';
import { InlineEdit } from '@/components/shared/InlineEdit';
import { Input } from '@/components/shared/Input';

interface Proyecto {
  id: string;
  nombre: string;
  created_at: string;
}

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProyectos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proyectos');
      const json = await res.json();
      setProyectos(json.data || []);
    } catch (e: any) {
      setError(e.message || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  const handleAdd = async () => {
    if (!nuevoNombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        setNuevoNombre('');
        fetchProyectos();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, nombre: string) => {
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proyectos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        fetchProyectos();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar proyecto?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) {
        setError(json.error.message || 'Error');
      } else {
        fetchProyectos();
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="proyectos">
      <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628]">Proyectos</h1>
          <p className="text-slate-500 text-sm">Gestion de concesiones viales principales.</p>
        </div>
      </div>

      <InfoBanner title="Que es un Proyecto?">
        Un proyecto representa el contrato principal o la concesion vial general. Sirve como el contenedor de mas alto nivel donde se agruparan las Unidades Funcionales (UF) y, posteriormente, las rutas a evaluar. Agrega proyectos para separar las metricas por concesion.
      </InfoBanner>

      <Card className="p-4 bg-white">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Nombre del nuevo proyecto..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" /> Anadir Proyecto
          </Button>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-slate-500 mb-4">Cargando...</div>}

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3 w-28">ID</th>
                <th className="px-4 py-3">Nombre del Proyecto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proyectos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {p.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <InlineEdit value={p.nombre} onSave={(val) => handleUpdate(p.id, val)} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/rutas?proyectoId=${p.id}`)}
                    >
                      <MapIcon className="w-4 h-4 mr-2" /> Entrar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {proyectos.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No hay proyectos registrados.
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
