import { cn } from '../../lib/utils';

export function Field({ label, hint, error, required, htmlFor, children, className, aside }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink/85">
            {label}
            {required ? <span className="ml-0.5 text-clay">*</span> : null}
          </label>
          {aside}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

const base =
  'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-faint/80 outline-none transition-all duration-150 focus:border-forest/35 focus:ring-4 focus:ring-forest/[0.07] disabled:cursor-not-allowed disabled:bg-cream/50 disabled:text-soft';

export function Input({ className, ...props }) {
  return <input className={cn(base, 'h-[42px]', className)} {...props} />;
}

export function Textarea({ className, rows = 3, ...props }) {
  return <textarea rows={rows} className={cn(base, 'resize-y leading-relaxed', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(base, 'h-[42px] appearance-none pr-9', className)} {...props}>
      {children}
    </select>
  );
}
