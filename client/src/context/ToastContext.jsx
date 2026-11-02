import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);
let counter = 0;

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: 'text-moss',
  error: 'text-red-600',
  info: 'text-forest',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = (counter += 1);
      setToasts((current) => [...current.slice(-3), { id, message, type }]);
      window.setTimeout(() => dismiss(id), type === 'error' ? 5200 : 3600);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 no-print">
        {toasts.map((item) => {
          const Icon = ICONS[item.type] || Info;
          return (
            <div
              key={item.id}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-paper/95 px-4 py-3 shadow-card backdrop-blur animate-slide-in"
            >
              <Icon className={cn('mt-0.5 h-[18px] w-[18px] shrink-0', STYLES[item.type])} />
              <p className="flex-1 text-sm text-ink/90">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-0.5 text-faint transition hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
