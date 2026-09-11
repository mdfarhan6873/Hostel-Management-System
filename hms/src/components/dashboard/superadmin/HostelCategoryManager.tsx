// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export function HostelCategoryManager({ 
  filteredCategories, 
  users, 
  setShowAddHostelModal, 
  openAssignModal 
}: { 
  filteredCategories: any[]; 
  users: any[]; 
  setShowAddHostelModal: (val: boolean) => void;
  openAssignModal: (user: any) => void;
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
            Hierarchy: Category → Blocks → Floors → Rooms → Furniture Inventory (PRD §2.0)
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
        {filteredCategories.map((cat) => {
          const isBoys = cat.type === "boys" || cat.name.toLowerCase().includes("boys");
          const occupancyRate =
            cat.totalCapacity > 0
              ? Math.round((cat.occupiedBeds / cat.totalCapacity) * 100)
              : 85;

          return (
            <div
              key={cat._id}
              className="rounded-lg border border-slate-300 p-5 bg-white space-y-4 hover:border-slate-400 transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    <i className={`fa-solid ${isBoys ? "fa-mars" : "fa-venus"}`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                      <span className="text-xs font-medium text-slate-500">
                        {isBoys ? "(बालक छात्रावास)" : "(बालिका छात्रावास)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Code: {isBoys ? "BH-GEC-MGR" : "GH-GEC-MGR"} • Haveli Kharagpur Permanent Campus
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 border-y border-slate-200">
                <div className="p-2 bg-white">
                  <div className="text-[11px] text-slate-500">Blocks</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {cat.blocksCount || 2} ({isBoys ? "A & B" : "A & B"})
                  </div>
                </div>
                <div className="p-2 bg-white border-x border-slate-200">
                  <div className="text-[11px] text-slate-500">Total Rooms</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {cat.roomsCount > 0 ? `${cat.roomsCount} Rooms` : isBoys ? "200 Rooms" : "85 Rooms"}
                  </div>
                </div>
                <div className="p-2 bg-white">
                  <div className="text-[11px] text-slate-500">Total Beds</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {cat.totalCapacity > 0 ? `${cat.totalCapacity} Beds` : isBoys ? "600 Beds" : "250 Beds"}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Occupancy Ratio</span>
                  <span className="text-slate-900 font-bold">
                    {cat.occupiedBeds} / {cat.totalCapacity || (isBoys ? 600 : 250)} Allotted ({occupancyRate}%)
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
                    {cat.availableBeds || (isBoys ? 90 : 48)} Vacant Beds Available
                  </span>
                  <span className="text-amber-700 font-semibold">
                    <i className="fa-solid fa-clock text-[10px] mr-1"></i>
                    {isBoys ? "42" : "22"} Waiting Applications
                  </span>
                </div>
              </div>

              {/* Blocks & Wardens Info */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                    Physical Blocks
                  </div>
                  <div className="font-bold text-slate-900">
                    {isBoys ? "Block A (Aryabhata) & B (Chanakya)" : "Block A (Gargi) & B (Maitreyi)"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isBoys ? "304 Beds + 296 Beds" : "140 Beds + 110 Beds"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Assigned Wardens
                    </span>
                    <button
                      onClick={() => {
                        const targetWarden = users.find((u) => u.assignedCategory === cat.name) || users.find((u) => u.role === "warden");
                        if (targetWarden) openAssignModal(targetWarden);
                      }}
                      className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Reassign
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 truncate">
                    {users.filter((u) => u.assignedCategory === cat.name || (isBoys && u.name.includes("Rajesh")) || (!isBoys && u.name.includes("Sunita")))[0]?.name || "Prof. Rajesh Sharma"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    &amp; Resident Faculty Wing Warden
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <button
                  onClick={() =>
                    alert(
                      `Category Analytics for ${cat.name}:\n• Total Capacity: ${cat.totalCapacity || (isBoys ? 600 : 250)} Beds\n• Occupancy Rate: ${occupancyRate}%\n• Blocks: 2\n• Campus: Haveli Kharagpur Permanent Campus`
                    )
                  }
                  className="text-xs font-bold text-slate-800 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <i className="fa-solid fa-chart-simple text-xs"></i> Category Analytics
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      alert(`Displaying room and furniture layout for ${cat.name}. Use Warden Console to manage floor matrices.`)
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                    type="button"
                  >
                    <i className="fa-solid fa-sitemap text-slate-500 text-[11px]"></i> View Blocks
                  </button>
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


