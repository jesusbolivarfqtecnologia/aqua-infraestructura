import { Suspense } from 'react';
import { AppShell } from '@/components/layout';
import RutasClient from './RutasClient';

export default function UnidadesRutasPage() {
  return (
    <Suspense fallback={<AppShell active="rutas"><div className="text-slate-500">Cargando...</div></AppShell>}>
      <RutasClient />
    </Suspense>
  );
}