import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === 'error';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4 animate-[slideDown_0.3s_ease-out]">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
          isError
            ? 'bg-amber-900/90 border-amber-600/50 text-amber-100'
            : 'bg-emerald-900/90 border-emerald-600/50 text-emerald-100'
        }`}
      >
        {isError ? (
          <AlertTriangle className="w-5 h-5 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 shrink-0" />
        )}
        <p className="text-sm flex-1">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="opacity-70 hover:opacity-100 transition-opacity shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
