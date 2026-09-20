// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";

interface WardenHeaderProps {
  currentUser: any;
  handleLogout: () => void;
  activeTab: string;
  setActiveTab: (
    tab: "blueprint" | "students" | "admission" | "billing" | "upi",
  ) => void;
}

export function WardenHeader({
  currentUser,
  handleLogout,
  activeTab,
  setActiveTab,
}: WardenHeaderProps) {
  return (
    <header className="w-full z-40 sticky top-0">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

      {/* Main header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
            <div className="flex items-center gap-3.5">
              <div className="relative flex-shrink-0 bg-white/10 rounded-xl p-1.5 backdrop-blur-sm ring-1 ring-white/20">
                <Image
                  src="/logo.webp"
                  alt="GEC Munger Official Emblem"
                  width={48}
                  height={48}
                  className="h-11 w-auto object-contain flex-shrink-0"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                    Government Engineering College, Munger
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-hindi">
                    / राजकीय अभियंत्रण महाविद्यालय, मुंगेर
                  </span>
                </div>
                <p className="text-[10px] font-bold text-amber-400/90 tracking-wider uppercase mt-0.5">
                  HOSTEL MANAGEMENT SYSTEM (HMS) • WARDEN PORTAL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:flex sm:flex-col sm:justify-center">
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {currentUser?.name || "Prof. R. K. Singh"}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Warden:{" "}
                  {currentUser?.assignedCategory || "Boys Hostel (Block A & B)"} •
                  Dept. of Mechanical
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-xs text-slate-900 flex-shrink-0 ring-2 ring-amber-400/30">
                {currentUser?.name
                  ? currentUser.name.slice(0, 2).toUpperCase()
                  : "WS"}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs rounded-md border border-slate-600 hover:bg-red-500/20 hover:border-red-400/60 text-slate-300 hover:text-red-300 font-semibold transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center justify-between pt-2.5">
            <nav className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: "blueprint", label: "Blueprint & Rooms Matrix", icon: "fa-solid fa-layer-group" },
                { id: "students", label: "Students & Allotments", icon: "fa-solid fa-users" },
                { id: "admission", label: "Publish Admission Form", icon: "fa-solid fa-file-pen" },
                { id: "billing", label: "Billing & Mess Rebate", icon: "fa-solid fa-receipt" },
                { id: "upi", label: "UPI Payment Accounts", icon: "fa-solid fa-building-columns" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm shadow-white/10"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <i className={`${tab.icon} text-[10px]`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
              <span className="font-mono text-[11px] bg-slate-800/80 px-2.5 py-1 border border-slate-700 rounded font-semibold text-slate-300">
                AY 2025-26 • EVEN SEM
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
                BIOMETRIC SYNC ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
