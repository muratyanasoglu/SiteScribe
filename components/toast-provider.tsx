'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'default';

type ToastItem = {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (message: string, options?: { description?: string; variant?: ToastVariant; duration?: number }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: { description?: string; variant?: ToastVariant; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const variant = options?.variant ?? 'default';
      const duration = options?.duration ?? 4000;
      setToasts((prev) => [...prev, { id, message, description: options?.description, variant, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4 sm:max-w-[380px]"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
    default: null,
  };
  const styles = {
    success: 'border-emerald-200 bg-emerald-50/95 dark:border-emerald-900 dark:bg-emerald-950/95',
    error: 'border-red-200 bg-red-50/95 dark:border-red-900 dark:bg-red-950/95',
    info: 'border-primary/30 bg-primary/5',
    default: 'border-border bg-card',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all duration-200',
        styles[item.variant]
      )}
    >
      {icons[item.variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.message}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors -mt-0.5 -mr-0.5"
        aria-label="Kapat"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
