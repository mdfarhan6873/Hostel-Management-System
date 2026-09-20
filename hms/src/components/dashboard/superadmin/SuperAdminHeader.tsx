// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";

interface SuperAdminHeaderProps {
  currentUser: any;
  handleLogout: () => void;
}

export function SuperAdminHeader({ currentUser, handleLogout }: SuperAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* College Emblem & Institutional Title */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="relative flex-shrink-0 bg-white/10 rounded-xl p-1.5 backdrop-blur-sm ring-1 ring-white/20">
                <Image
                  src="/logo.webp"
                  alt="GEC Munger Official Emblem"
                  width={56}
                  height={56}
                  className="h-14 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                    Government Engineering College, Munger
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Govt. of Bihar
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  राजकीय अभियंत्रण महाविद्यालय, मुंगेर
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-amber-400/90">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                    Hostel Management System (HMS) • Super Admin Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Super Admin Profile & Status */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">
                  {currentUser?.name || "Dr. A. K. Sharma"}
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <i className="fa-solid fa-shield-halved text-[10px]"></i> Authorized System Root
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  title="Logout from Super Admin Console"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 border border-slate-600 hover:bg-red-500/20 hover:border-red-400/60 hover:text-red-300 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
