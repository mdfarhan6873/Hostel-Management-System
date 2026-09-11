import React from 'react';

interface ToastProps {
  notification: { type: "success" | "error"; msg: string } | null;
}

export function ToastNotification({ notification }: ToastProps) {
  if (!notification) return null;
  
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg border text-xs font-bold flex items-center gap-2.5 transition-all animate-bounce ${
        notification.type === "success"
          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
          : "bg-red-50 border-red-300 text-red-900"
      }`}
    >
      <span>{notification.type === "success" ? "✓" : "⚠"}</span>
      <span>{notification.msg}</span>
    </div>
  );
}
