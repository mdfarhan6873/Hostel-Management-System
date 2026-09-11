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
    <header className="bg-white border-b border-slate-300 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* College Emblem & Institutional Title */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative flex-shrink-0">
              <Image
                src="/munger.png"
                alt="GEC Munger Official Emblem"
                width={56}
                height={56}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Government Engineering College, Munger
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                  Govt. of Bihar
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                राजकीय अभियंत्रण महाविद्यालय, मुंगेर
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-slate-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hostel Management System (HMS) • Super Admin Portal
                </span>
              </div>
            </div>
          </div>

          {/* Right: Super Admin Profile & Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900">
                {currentUser?.name || "Dr. A. K. Sharma"}
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-emerald-700">
                <i className="fa-solid fa-shield-halved text-[10px]"></i> Authorized System Root
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                title={currentUser?.email}
                className="h-10 w-10 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-900 font-bold text-sm select-none"
              >
                SA
              </div>
              <button
                onClick={handleLogout}
                title="Logout from Super Admin Console"
                className="px-3 py-1.5 rounded text-xs font-semibold text-red-700 bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


