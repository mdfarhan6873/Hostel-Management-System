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
    <header className="w-full z-40 bg-white border-b border-slate-300 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Image
              src="/munger.png"
              alt="GEC Munger Official Emblem"
              width={48}
              height={48}
              className="h-12 w-auto object-contain flex-shrink-0"
              priority
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Government Engineering College, Munger
                </span>
                <span className="text-xs font-semibold text-slate-600 font-hindi">
                  / राजकीय अभियंत्रण महाविद्यालय, मुंगेर
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                HOSTEL MANAGEMENT SYSTEM (HMS) • WARDEN PORTAL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:flex sm:flex-col sm:justify-center">
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {currentUser?.name || "Prof. R. K. Singh"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Warden:{" "}
                {currentUser?.assignedCategory || "Boys Hostel (Block A & B)"} •
                Dept. of Mechanical
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800 flex-shrink-0">
              {currentUser?.name
                ? currentUser.name.slice(0, 2).toUpperCase()
                : "WS"}
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center justify-between pt-2">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "blueprint", label: "Blueprint & Rooms Matrix" },
              { id: "students", label: "Students & Allotments" },
              { id: "admission", label: "Publish Admission Form" },
              { id: "billing", label: "Billing & Mess Rebate" },
              { id: "upi", label: "UPI Payment Accounts" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border border-slate-900 bg-slate-900 text-white"
                    : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 border border-slate-200 rounded font-semibold text-slate-700">
              AY 2025-26 • EVEN SEM
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              BIOMETRIC SYNC ACTIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}


