"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WardenSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white flex flex-col py-8 px-4 flex-shrink-0 border-r border-gray-100">
      {/* OPERATIONS */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4 px-3">
          Operations
        </h3>
        <nav className="space-y-1">
          <Link
            href="/Dashboard/Warden"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive("/Dashboard/Warden")
                ? "text-gray-900 font-bold bg-gray-50/80"
                : "text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50/50"
            }`}
          >
            <i
              className={`fa-solid fa-wrench w-5 text-center text-sm ${
                isActive("/Dashboard/Warden") ? "text-blue-600" : "text-gray-400"
              }`}
            ></i>
            <span className="text-[14px]">Command Center</span>
          </Link>

          <Link
            href="/Dashboard/Warden/blueprint"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive("/Dashboard/Warden/blueprint")
                ? "text-gray-900 font-bold bg-gray-50/80"
                : "text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50/50"
            }`}
          >
            <i
              className={`fa-solid fa-layer-group w-5 text-center text-sm ${
                isActive("/Dashboard/Warden/blueprint") ? "text-blue-600" : "text-gray-400"
              }`}
            ></i>
            <span className="text-[14px]">Hostel Blueprint</span>
          </Link>

          <Link
            href="/Dashboard/Warden/forms-notices"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              pathname.startsWith("/Dashboard/Warden/forms-notices")
                ? "text-gray-900 font-bold bg-gray-50/80"
                : "text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50/50"
            }`}
          >
            <i
              className={`fa-solid fa-clipboard-list w-5 text-center text-sm ${
                pathname.startsWith("/Dashboard/Warden/forms-notices")
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            ></i>
            <span className="text-[14px]">Forms & Notices</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
