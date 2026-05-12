'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';

export function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-body overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1628] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-[#0A1628]">
          <div className="flex items-center gap-2 text-[#00C2D4]">
            <div className="w-8 h-8 rounded bg-[#1B3A6B] flex items-center justify-center font-bold">AQ</div>
            <span className="font-heading font-bold text-lg tracking-wide text-white">
              AQUA<span className="text-[#00C2D4]">-Infra</span>
            </span>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Sidebar active={active} onNavigate={() => setIsMobileMenuOpen(false)} />
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
