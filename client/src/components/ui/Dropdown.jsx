import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export default function Dropdown({ trigger, items = [], align = 'right', className, menuClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] rounded-2xl border border-line bg-paper p-1.5 shadow-card animate-pop',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
          role="menu"
        >
          {items.map((item, index) =>
            item.type === 'separator' ? (
              <div key={`sep-${index}`} className="my-1 h-px bg-line" />
            ) : item.type === 'label' ? (
              <div
                key={`label-${index}`}
                className="truncate px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wide text-faint"
              >
                {item.label}
              </div>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] transition disabled:opacity-40',
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-ink/85 hover:bg-cream'
                )}
              >
                {item.icon ? <item.icon className="h-[15px] w-[15px] shrink-0 opacity-70" /> : null}
                <span className="flex-1">{item.label}</span>
                {item.shortcut ? <span className="text-[11px] text-faint">{item.shortcut}</span> : null}
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
