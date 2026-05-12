import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'sm' | 'icon';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#00C2D4] text-[#0A1628] hover:bg-[#00A1B0] font-bold shadow-sm',
    secondary: 'bg-[#1B3A6B] text-white hover:bg-[#1B3A6B]/90 shadow-sm',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-xs',
    icon: 'h-9 w-9',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
