import React from "react";

export function SuperAdminControls({
  categories = [],
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  userRoleFilter,
  setUserRoleFilter,
  setShowAddHostelModal,
  setShowAddUserModal,
}: {
  categories?: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (val: string) => void;
  setShowAddHostelModal: (val: boolean) => void;
  setShowAddUserModal: (val: boolean) => void;
}) {
  const totalCategories = categories.length;
  let totalCapacity = 0;
  let totalAllotted = 0;
  categories.forEach((cat) => {
    totalCapacity += cat.totalCapacity || 0;
    totalAllotted += cat.occupiedBeds || 0;
  });
  const totalVacant = Math.max(0, totalCapacity - totalAllotted);
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalAllotted / totalCapacity) * 100) : 0;

  return (
    <>
      <nav aria-label="Primary Navigation" className="flex items-center justify-between border-b border-slate-200 pb-3" data-purpose="view-tabs">
        <div className="flex items-center gap-3">
          <button className="sketch-pill px-6 py-2 text-sm font-bold bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-50 focus:outline-none transition flex items-center gap-2 cursor-pointer" type="button">
            <i className="fa-solid fa-gauge text-xs"></i>
            <span>Dashboard</span>
          </button>
          <button className="sketch-pill px-6 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:text-slate-900 hover:border-slate-400 focus:outline-none transition flex items-center gap-2 cursor-pointer" type="button" onClick={() => alert('Navigating to Detailed HMS Analytics & Occupancy Telemetry.')}>
            <i className="fa-solid fa-chart-pie text-xs text-slate-400"></i>
            <span>Analytics</span>
          </button>
        </div>
        {/* Campus Status & Connection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mt-4 sm:mt-0 lg:ml-auto w-full sm:w-auto">
          <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            MongoDB Atlas Connected
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <i className="fa-solid fa-server text-slate-400"></i>
            Government Engineering College HMS
          </div>
        </div>
      </nav>

      <section className="space-y-3" data-purpose="search-and-controls">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <i className="fa-solid fa-magnifying-glass text-sm"></i>
            </div>
            <input 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition" 
              placeholder="Search hostel categories, wardens, roles..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button className="sketch-pill inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer" onClick={() => setShowAddHostelModal(true)} type="button">
              <i className="fa-solid fa-hotel text-slate-600 text-xs"></i>
              <span>+ Add Hostel Category</span>
            </button>
            <button className="sketch-pill inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-2 border-slate-900 hover:bg-slate-50 transition cursor-pointer" onClick={() => setShowAddUserModal(true)} type="button">
              <i className="fa-solid fa-user-plus text-xs"></i>
              <span>+ Add Warden</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-300" id="cascading-filter-toolbar">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
              <i className="fa-solid fa-filter text-slate-500 text-[11px]"></i> Filters:
            </span>
            <label className="sr-only" htmlFor="filter-hostel-category">Demographic Type</label>
            <select className="rounded-md border border-slate-300 text-xs py-1.5 pl-2.5 pr-8 bg-white text-slate-800 font-medium focus:border-slate-900 focus:ring-0 cursor-pointer" id="filter-hostel-category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Demographic Types</option>
              <option value="boys">Boys (बालक)</option>
              <option value="girls">Girls (बालिका)</option>
              <option value="coed">Staff / Co-ed</option>
            </select>
            <label className="sr-only" htmlFor="filter-user-role">User Role</label>
            <select className="rounded-md border border-slate-300 text-xs py-1.5 pl-2.5 pr-8 bg-white text-slate-800 font-medium focus:border-slate-900 focus:ring-0 cursor-pointer" id="filter-user-role" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="warden">Warden</option>
              <option value="viewer">Viewer</option>
            </select>
            <button className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 py-1 rounded border border-transparent hover:border-slate-200 transition inline-flex items-center gap-1 cursor-pointer" type="button" onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setUserRoleFilter("all"); }}>
              <i className="fa-solid fa-arrows-rotate text-[10px]"></i> Reset
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 border-t lg:border-t-0 pt-2 lg:pt-0">
            <span className="inline-flex items-center gap-1.5"><strong className="text-slate-900">Total Categories:</strong> {totalCategories}</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-slate-900">Capacity:</strong> {totalCapacity} Beds</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700"><i className="fa-solid fa-circle text-[8px]"></i> <strong>Allotted:</strong> {totalAllotted} ({occupancyPercent}%)</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 text-blue-700"><i className="fa-regular fa-circle text-[8px]"></i> <strong>Vacant:</strong> {totalVacant} Beds</span>
          </div>
        </div>
      </section>
    </>
  );
}
