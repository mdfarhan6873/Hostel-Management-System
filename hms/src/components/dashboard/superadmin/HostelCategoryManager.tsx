// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export function HostelCategoryManager({ 
  filteredCategories, 
  users, 
  setShowAddHostelModal, 
  openAssignModal,
  openEditModal,
  openDeleteModal
}: { 
  filteredCategories: any[]; 
  users: any[]; 
  setShowAddHostelModal: (val: boolean) => void;
  openAssignModal: (user: any) => void;
  openEditModal?: (cat: any) => void;
  openDeleteModal?: (type: "category" | "warden", item: any) => void;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-300 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-white border border-slate-300 text-slate-800 text-sm">
              <i className="fa-solid fa-building-columns"></i>
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Hostel Categories &amp; Physical Infrastructure
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage top-level accommodation categories and demographic allocation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700">
            {filteredCategories.length} Operational Categories
          </span>
          <button
            onClick={() => setShowAddHostelModal(true)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:border-slate-400 transition cursor-pointer"
            type="button"
          >
            + New Category
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <i className="fa-solid fa-hotel text-3xl mb-3 text-slate-300"></i>
            <h3 className="text-sm font-semibold text-slate-700">No Hostel Categories Found</h3>
            <p className="text-xs mt-1">Get started by adding a new hostel category to the system.</p>
          </div>
        )}
        {filteredCategories.map((cat) => {
          const isBoys = cat.type === "boys" || cat.name?.toLowerCase().includes("boys");
          const isGirls = cat.type === "girls" || cat.name?.toLowerCase().includes("girls");
          const totalCapacity = cat.totalCapacity || 0;
          const occupiedBeds = cat.occupiedBeds || 0;
          const availableBeds = cat.availableBeds !== undefined ? cat.availableBeds : Math.max(0, totalCapacity - occupiedBeds);
          const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
          const assignedWardens = users.filter((u) => u.assignedCategory === cat.name && u.role === "warden");

          return (
            <div
              key={cat._id}
              className="rounded-lg border border-slate-300 p-5 bg-white space-y-4 hover:border-slate-400 transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    <i className={`fa-solid ${isBoys ? "fa-mars" : isGirls ? "fa-venus" : "fa-venus-mars"}`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                      <span className="text-xs font-medium text-slate-500">
                        {isBoys ? "(बालक छात्रावास)" : isGirls ? "(बालिका छात्रावास)" : "(सह-शिक्षा / स्टाफ)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Code: {cat.code || (isBoys ? "BH-GEC-MGR" : isGirls ? "GH-GEC-MGR" : "CH-GEC-MGR")} • Government Engineering College HMS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                  {openEditModal && (
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Category Details"
                    >
                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                  )}
                  {openDeleteModal && (
                    <button
                      onClick={() => openDeleteModal("category", cat)}
                      className="p-1 text-slate-400 hover:text-red-700 rounded hover:bg-red-50 transition cursor-pointer"
                      title="Delete Category"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 border-y border-slate-200">
                <div className="p-2 bg-white">
                  <div className="text-[11px] text-slate-500">Blocks</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {cat.blocksCount || 0} Blocks
                  </div>
                </div>
                <div className="p-2 bg-white border-x border-slate-200">
                  <div className="text-[11px] text-slate-500">Total Rooms</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {cat.roomsCount || 0} Rooms
                  </div>
                </div>
                <div className="p-2 bg-white">
                  <div className="text-[11px] text-slate-500">Total Capacity</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {totalCapacity} Beds
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Occupancy Ratio</span>
                  <span className="text-slate-900 font-bold">
                    {occupiedBeds} / {totalCapacity} Allotted ({occupancyRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, occupancyRate)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span className="text-emerald-700 font-semibold">
                    <i className="fa-solid fa-circle-check text-[10px] mr-1"></i>
                    {availableBeds} Vacant Beds Available
                  </span>
                  <span className="text-slate-500 font-medium">
                    {totalCapacity === 0 ? "Pending Infrastructure Setup by Warden" : "Operational Allocation"}
                  </span>
                </div>
              </div>

              {/* Assigned Wardens Info */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-user-shield text-slate-700"></i> Assigned Warden(s)
                  </span>
                  {assignedWardens.length > 0 ? (
                    <button
                      onClick={() => openAssignModal(assignedWardens[0])}
                      className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Reassign
                    </button>
                  ) : null}
                </div>
                {assignedWardens.length > 0 ? (
                  <div className="font-bold text-slate-900">
                    {assignedWardens.map((w) => w.name).join(", ")}
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      {assignedWardens[0]?.email} • {assignedWardens[0]?.mobile}
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic flex items-center justify-between">
                    <span>No Warden assigned to this category yet.</span>
                    <button
                      onClick={() => {
                        const firstUnassigned = users.find((u) => u.role === "warden");
                        if (firstUnassigned) openAssignModal(firstUnassigned);
                      }}
                      className="text-[11px] text-blue-700 font-bold hover:underline not-italic cursor-pointer"
                    >
                      + Assign Warden
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  {openEditModal && (
                    <button
                      onClick={() => openEditModal(cat)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                      type="button"
                    >
                      <i className="fa-solid fa-pen text-slate-500 text-[10px]"></i> Edit
                    </button>
                  )}
                  {openDeleteModal && (
                    <button
                      onClick={() => openDeleteModal("category", cat)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-white border border-slate-300 rounded hover:bg-red-50 hover:border-red-300 transition cursor-pointer flex items-center gap-1"
                      type="button"
                    >
                      <i className="fa-solid fa-trash-can text-red-500 text-[10px]"></i> Delete
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const targetWarden = users.find((u) => u.assignedCategory === cat.name) || users.find((u) => u.role === "warden");
                      if (targetWarden) openAssignModal(targetWarden);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                    type="button"
                  >
                    <i className="fa-solid fa-user-gear text-[11px]"></i> Assign Warden
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
