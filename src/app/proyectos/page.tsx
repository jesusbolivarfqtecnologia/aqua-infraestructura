'use client';

import React, { useEffect, useState } from 'react';

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProyectos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proyectos');
      const json = await res.json();
      setProyectos(json.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProyectos(); }, []);

  const handleAdd = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/proyectos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
      const json = await res.json();
      if (json.error) { setError(json.error.message || 'Error'); }
      else { setNombre(''); fetchProyectos(); }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar proyecto?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) { setError(json.error.message); }
      else { fetchProyectos(); }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Proyectos</h1>
      <div className="mb-4 flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nuevo proyecto" />
        <button className="bg-cyan-500 text-white px-4 py-2 rounded" onClick={handleAdd} disabled={loading}>Crear</button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-slate-500">Cargando...</div>}
      <ul className="space-y-2">
        {proyectos.map(p => (
          <li key={p.id} className="flex items-center justify-between border rounded px-4 py-2">
            <div>
              <div className="font-medium">{p.nombre}</div>
              <div className="text-xs text-slate-500">{new Date(p.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-sm text-red-600" onClick={() => handleDelete(p.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
