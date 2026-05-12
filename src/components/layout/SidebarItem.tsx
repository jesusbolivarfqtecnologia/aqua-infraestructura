import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
        active
          ? 'bg-[#1B3A6B] text-white border-r-4 border-[#00C2D4]'
          : 'text-slate-400 hover:bg-[#0A1628]/50 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-[#00C2D4]' : ''}`} />
      {label}
    </Link>
  );
}
