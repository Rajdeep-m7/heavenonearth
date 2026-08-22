"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; tone: "success" | "error" | "info"; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((tone: Toast["tone"], message: string) => {
    const id = nextId++;
    setToasts((current) => [...current, { id, tone, message }]);
    // Errors linger — the reader probably needs to act on them.
    const ttl = tone === "error" ? 7000 : 3500;
    setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      ttl,
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  const tones = {
    success: "border-teal/30 bg-white text-ink",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-black/10 bg-white text-ink",
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-[14px] shadow-lift ${tones[toast.tone]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
