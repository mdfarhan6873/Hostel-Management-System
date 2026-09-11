"use client";

import React from "react";

interface ToastProps {
  notification: { type: "success" | "error" | "warning" | "info"; msg: string } | null;
}

export function ToastNotification({ notification }: ToastProps) {
  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isError = notification.type === "error";
  const isWarning = notification.type === "warning";

  const config = isSuccess
    ? {
        border: "border-emerald-300",
        icon: "fa-solid fa-circle-check text-emerald-700",
        iconBg: "bg-emerald-100",
        title: "Success",
        titleColor: "text-emerald-950",
      }
    : isWarning
    ? {
        border: "border-amber-300",
        icon: "fa-solid fa-triangle-exclamation text-amber-800",
        iconBg: "bg-amber-100",
        title: "Notice",
        titleColor: "text-amber-950",
      }
    : isError
    ? {
        border: "border-red-300",
        icon: "fa-solid fa-circle-exclamation text-red-700",
        iconBg: "bg-red-100",
        title: "Error",
        titleColor: "text-red-950",
      }
    : {
        border: "border-blue-300",
        icon: "fa-solid fa-circle-info text-blue-700",
        iconBg: "bg-blue-100",
        title: "Information",
        titleColor: "text-blue-950",
      };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full px-4 sm:px-0 pointer-events-none animate-slideInRight">
      <div
        className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.border} bg-white shadow-xl p-3.5 flex items-start gap-3`}
      >
        <div
          className={`h-7 w-7 rounded-lg ${config.iconBg} flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}
        >
          <i className={config.icon}></i>
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <div className={`text-xs font-bold ${config.titleColor}`}>{config.title}</div>
          <div className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
            {notification.msg}
          </div>
        </div>
      </div>
    </div>
  );
}
