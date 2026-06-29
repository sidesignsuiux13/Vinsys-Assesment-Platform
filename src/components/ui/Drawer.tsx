import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Drawer({ isOpen, onClose, title, children, footer, width = 400 }: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={onClose} />
      <div
        className="absolute inset-y-0 right-0 bg-white border-l border-neutral-200 shadow-sm flex flex-col"
        style={{ width, maxWidth: '100vw' }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 px-5 py-4 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
