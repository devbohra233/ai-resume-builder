import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary: 'bg-forest text-cream hover:bg-forest-deep border border-transparent shadow-sm',
  dark: 'bg-ink text-cream hover:bg-black border border-transparent',
  lime: 'bg-lime text-forest-deep hover:bg-[#cdec37] border border-lime/60 shadow-sm',
  outline: 'bg-paper text-ink border border-line hover:border-ink/30 hover:bg-cream/60',
  ghost: 'bg-transparent text-ink hover:bg-ink/[0.06] border border-transparent',
  soft: 'bg-forest/[0.07] text-forest hover:bg-forest/[0.12] border border-transparent',
  danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
};

const SIZES = {
  xs: 'h-8 rounded-lg px-2.5 text-[12px] gap-1.5',
  sm: 'h-9 rounded-xl px-3.5 text-[13px] gap-1.5',
  md: 'h-11 rounded-xl px-5 text-sm gap-2',
  lg: 'h-12 rounded-xl px-6 text-[15px] gap-2',
  icon: 'h-9 w-9 rounded-xl',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150 active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className
      )}
      disabled={Component === 'button' ? disabled || loading : undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Component>
  );
}
