import { Menu } from 'lucide-react';

export function AppHeader({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden" onClick={onToggleMenu} aria-label="Abrir menu">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
