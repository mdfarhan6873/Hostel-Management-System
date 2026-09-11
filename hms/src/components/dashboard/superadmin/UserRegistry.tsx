// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export function UserRegistry({
  filteredUsers,
  setShowAddUserModal,
  openAssignModal,
  handleToggleUserStatus,
  userFilter,
  setUserFilter,
  searchQuery,
  setSearchQuery
}: {
  filteredUsers: any[];
  setShowAddUserModal: (val: boolean) => void;
  openAssignModal: (user: any) => void;
  handleToggleUserStatus: (user: any) => void;
  userFilter: string;
  setUserFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-300 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-white border border-slate-300 text-slate-800 text-sm">
              <i className="fa-solid fa-users-gear"></i>
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Institutional Personnel &amp; Roles Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Wardens, Viewers, and System Administrators (PRD §3.1)
          </p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="rounded-full px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black transition cursor-pointer self-start sm:self-auto"
          type="button"
        >
          + Add New User
        </button>
      </div>

      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-slate-500 focus:ring-0 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white focus:border-slate-500 focus:ring-0 text-slate-700 font-semibold"
          >
            <option value="all">All Personnel</option>
            <option value="warden">Wardens Only</option>
            <option value="viewer">Viewers Only</option>
            <option value="superadmin">Super Admins</option>
          </select>
          <button className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer">
            <i className="fa-solid fa-filter"></i>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-white border-b border-slate-300 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6" scope="col">Name &amp; Contact</th>
              <th className="py-3 px-4" scope="col">Role</th>
              <th className="py-3 px-4" scope="col">Assigned Category / Jurisdiction</th>
              <th className="py-3 px-4" scope="col">Email</th>
              <th className="py-3 px-4" scope="col">Mobile</th>
              <th className="py-3 px-4 text-center" scope="col">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={user._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-white border border-slate-300 text-slate-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {initials || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {user.designation || (user.role === "superadmin" ? "Principal / Institutional Head" : "Hostel Warden")}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {user.role === "superadmin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-white border border-slate-900 text-slate-900">
                          <i className="fa-solid fa-shield text-[10px]"></i> Super Admin
                        </span>
                      ) : user.role === "warden" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-800">
                          <i className="fa-solid fa-user-shield text-[10px]"></i> Warden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-600">
                          <i className="fa-solid fa-eye text-[10px]"></i> Viewer
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {user.role === "superadmin" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-800">
                          All Hostels (Entire Campus)
                        </span>
                      ) : user.role === "warden" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-800">
                            {user.assignedCategory || "Boys Hostel Category"}
                          </span>
                          <button
                            onClick={() => openAssignModal(user)}
                            className="text-slate-500 hover:text-slate-900 text-xs p-1 cursor-pointer"
                            title="Reassign Category"
                          >
                            <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-600">
                          Campus-Wide (Read-Only)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{user.email}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{user.mobile}</td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          user.status !== "INACTIVE"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {user.status || "ACTIVE"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1 whitespace-nowrap">
                      {user.role === "warden" && (
                        <button
                          onClick={() => openAssignModal(user)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                          title="Assign / Reassign Category"
                        >
                          <i className="fa-solid fa-arrows-rotate"></i>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          alert(`Editing profile for ${user.name} (${user.email}). Credentials and scopes are managed in Root Vault.`)
                        }
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="Edit User Details"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {user.role !== "superadmin" && (
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className="p-1.5 text-slate-400 hover:text-red-700 rounded hover:bg-slate-100 transition cursor-pointer"
                          title="Toggle Active Status"
                        >
                          <i className="fa-solid fa-ban"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-xs text-slate-500 italic">
                  No users found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> registered personnel under Super Admin authority
        </div>
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 rounded border border-slate-300 text-slate-400 cursor-not-allowed bg-white">
            Previous
          </button>
          <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold">1</span>
          <button className="px-2.5 py-1 rounded border border-slate-300 text-slate-400 cursor-not-allowed bg-white">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}


