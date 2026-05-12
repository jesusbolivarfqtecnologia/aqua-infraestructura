import { Activity, ClipboardList, FolderGit2, Layers, Map as MapIcon } from 'lucide-react';
import { SidebarItem } from './SidebarItem';

export function Sidebar({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="px-6 pt-2 pb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Principal</div>
      <SidebarItem icon={FolderGit2} label="Proyectos" href="/proyectos" active={active === 'proyectos'} onClick={onNavigate} />
      <SidebarItem icon={MapIcon} label="Unidades & Rutas" href="/rutas" active={active === 'rutas'} onClick={onNavigate} />
      <SidebarItem icon={Layers} label="Plantillas Calzadas" href="/carriles" active={active === 'carriles'} onClick={onNavigate} />
      <SidebarItem icon={Activity} label="Indicadores" href="/indicadores" active={active === 'indicadores'} onClick={onNavigate} />

      <div className="px-6 pt-6 pb-2 text-xs font-bold tracking-wider text-[#00C2D4] uppercase">Operacion Core</div>
      <SidebarItem icon={ClipboardList} label="Mediciones" href="/mediciones" active={active === 'mediciones'} onClick={onNavigate} />
    </div>
  );
}
