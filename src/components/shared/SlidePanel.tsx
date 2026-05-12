import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function SlidePanel({
  isOpen,
  onClose,
  title,
  customWidth = 'sm:w-[500px] lg:w-[600px]',
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  customWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/30 z-40 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-full ${customWidth} bg-white shadow-2xl z-50 border-l border-slate-200 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h2 className="font-heading text-lg font-bold text-[#0A1628]">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">{children}</div>
      </div>
    </>
  );
}
