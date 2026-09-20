"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white flex flex-col py-8 px-4 flex-shrink-0">
      {/* OPERATIONS */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4 px-3">
          Operations
        </h3>
        <nav className="space-y-1">
          <Link 
            href="/Dashboard/Admin" 
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive('/Dashboard/Admin') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <i className={`fa-solid fa-wrench w-5 text-center text-sm ${isActive('/Dashboard/Admin') ? 'text-gray-700' : 'text-gray-400'}`}></i>
            <span className="text-[14px]">Command Center</span>
          </Link>
          <Link 
            href="/Dashboard/Admin/analytics" 
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive('/Dashboard/Admin/analytics') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <i className={`fa-solid fa-chart-column w-5 text-center text-sm ${isActive('/Dashboard/Admin/analytics') ? 'text-gray-700' : 'text-gray-400'}`}></i>
            <span className="text-[14px]">Analytics</span>
          </Link>
        </nav>
      </div>

      {/* ADMINISTRATION */}
      <div>
        <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-4 px-3">
          Administration
        </h3>
        <nav className="space-y-1">
          <Link 
            href="/Dashboard/Admin/users" 
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive('/Dashboard/Admin/users') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <i className={`fa-solid fa-user-group w-5 text-center text-sm ${isActive('/Dashboard/Admin/users') ? 'text-gray-700' : 'text-gray-400'}`}></i>
            <span className="text-[14px]">Users</span>
          </Link>
          <Link 
            href="/Dashboard/Admin/settings" 
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive('/Dashboard/Admin/settings') 
                ? 'text-gray-900 font-bold' 
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <i className={`fa-solid fa-gear w-5 text-center text-sm ${isActive('/Dashboard/Admin/settings') ? 'text-gray-700' : 'text-gray-400'}`}></i>
            <span className="text-[14px]">Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
