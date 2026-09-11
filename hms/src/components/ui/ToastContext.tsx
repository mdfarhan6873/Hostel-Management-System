"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  createdAt: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Keep maximum 4 visible toasts to prevent screen crowding
        const updated = [...prev, newToast];
        return updated.slice(-4);
      });
    },
    []
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast("success", message, title, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast("error", message, title, duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast("warning", message, title, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast("info", message, title, duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration || 4000);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update progress every 50ms
    const totalDuration = toast.duration || 4000;

    const timer = setInterval(() => {
      remainingTimeRef.current -= interval;
      const pct = Math.max(0, (remainingTimeRef.current / totalDuration) * 100);
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        clearInterval(timer);
        onDismiss();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, toast.duration, onDismiss]);

  const config = {
    success: {
      bg: "bg-white",
      border: "border-emerald-300",
      progressBg: "bg-emerald-600",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: "fa-solid fa-circle-check",
      titleColor: "text-emerald-950",
      defaultTitle: "Success",
    },
    error: {
      bg: "bg-white",
      border: "border-red-300",
      progressBg: "bg-red-600",
      iconBg: "bg-red-100 text-red-700",
      icon: "fa-solid fa-circle-exclamation",
      titleColor: "text-red-950",
      defaultTitle: "Error",
    },
    warning: {
      bg: "bg-white",
      border: "border-amber-300",
      progressBg: "bg-amber-500",
      iconBg: "bg-amber-100 text-amber-800",
      icon: "fa-solid fa-triangle-exclamation",
      titleColor: "text-amber-950",
      defaultTitle: "Attention",
    },
    info: {
      bg: "bg-white",
      border: "border-blue-300",
      progressBg: "bg-blue-600",
      iconBg: "bg-blue-100 text-blue-700",
      icon: "fa-solid fa-circle-info",
      titleColor: "text-blue-950",
      defaultTitle: "Notice",
    },
  }[toast.type];

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.border} ${config.bg} shadow-lg shadow-slate-900/5 p-3.5 transition-all duration-200 transform translate-y-0 opacity-100 animate-slideInRight`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-7 w-7 rounded-lg ${config.iconBg} flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}
        >
          <i className={config.icon}></i>
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className={`text-xs font-bold ${config.titleColor}`}>
            {toast.title || config.defaultTitle}
          </div>
          <div className="text-xs text-slate-700 font-medium leading-relaxed break-words mt-0.5">
            {toast.message}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 p-1 rounded transition cursor-pointer flex-shrink-0"
          title="Dismiss notification"
          type="button"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      {/* Progress timer indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className={`h-full ${config.progressBg} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
