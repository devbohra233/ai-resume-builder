import { cn } from '../../lib/utils';

const TONES = {
  neutral: 'bg-cream-deep/70 text-soft border-line',
  forest: 'bg-forest/[0.07] text-forest border-forest/10',
  lime: 'bg-lime-soft text-forest border-lime/60',
  clay: 'bg-orange-50 text-clay border-orange-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  dark: 'bg-forest text-cream border-forest',
};

export default function Badge({ children, tone = 'neutral', className, icon: Icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5',
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

export function Logo({ size = 'md', light = false, className }) {
  const sizes = {
    sm: { box: 'h-7 w-7 rounded-[9px]', text: 'text-xl', icon: 18 },
    md: { box: 'h-8 w-8 rounded-[10px]', text: 'text-[23px]', icon: 20 },
    lg: { box: 'h-10 w-10 rounded-[13px]', text: 'text-[30px]', icon: 24 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative flex items-center justify-center bg-forest', s.box)}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 6.5L12 18l5.5-11.5"
            stroke="#d9f24b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          'font-display leading-none tracking-tight',
          s.text,
          light ? 'text-cream' : 'text-ink'
        )}
      >
        Vitae
      </span>
    </span>
  );
}
