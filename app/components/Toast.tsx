import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: "bg-zinc-900 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10",
    error: "bg-zinc-900 border-red-500/20 text-red-400 shadow-red-500/10",
    info: "bg-zinc-900 border-violet-500/20 text-violet-400 shadow-violet-500/10",
  };

  const icons = {
    success: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
        <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    info: (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15">
        <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none px-4 max-w-full">
      <div className={`pointer-events-auto flex items-center gap-3 rounded-full border px-3 py-2.5 shadow-2xl backdrop-blur-md ${colors[type]}`}>
        <div className="shrink-0">{icons[type]}</div>
        <p className="text-sm font-semibold text-zinc-200 truncate pr-2">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto shrink-0 rounded-full p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
