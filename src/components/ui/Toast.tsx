import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { uuid } from '@/lib/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (type: ToastType, message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (type, message) => {
    const id = uuid();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helper usable outside React components.
export const toast = {
  success: (m: string) => useToastStore.getState().push('success', m),
  error: (m: string) => useToastStore.getState().push('error', m),
  warning: (m: string) => useToastStore.getState().push('warning', m),
  info: (m: string) => useToastStore.getState().push('info', m),
};

const META: Record<ToastType, { border: string; Icon: typeof Info; iconClass: string }> = {
  success: { border: 'border-l-green-500', Icon: CheckCircle2, iconClass: 'text-green-500' },
  error: { border: 'border-l-red-500', Icon: XCircle, iconClass: 'text-red-500' },
  warning: { border: 'border-l-amber-500', Icon: AlertTriangle, iconClass: 'text-amber-500' },
  info: { border: 'border-l-maroon-600', Icon: Info, iconClass: 'text-maroon-600' },
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const { border, Icon, iconClass } = META[t.type];
        return (
          <div
            key={t.id}
            className={`toast-in flex items-start gap-3 bg-white border border-neutral-200 border-l-4 ${border} rounded-lg shadow-sm p-3`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconClass}`} />
            <p className="flex-1 text-sm text-neutral-700 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-neutral-400 hover:text-neutral-600 shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
