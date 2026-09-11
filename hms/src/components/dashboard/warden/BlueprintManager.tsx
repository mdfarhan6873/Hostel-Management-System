// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { format } from "date-fns";

export function BlueprintManager(props: any) {
  const {
    blueprint,
    setBlueprint,
    blocks,
    setBlocks,
    floors,
    setFloors,
    rooms,
    setRooms,
    students,
    setStudents,
    bills,
    setBills,
    notices,
    setNotices,
    roomSearch,
    setRoomSearch,
    roomBlockFilter,
    setRoomBlockFilter,
    roomFloorFilter,
    setRoomFloorFilter,
    roomOccupancyFilter,
    setRoomOccupancyFilter,
    studentSearch,
    setStudentSearch,
    studentStatusFilter,
    setStudentStatusFilter,
    studentBranchFilter,
    setStudentBranchFilter,
    studentSortFilter,
    setStudentSortFilter,
    admissionConfig,
    setAdmissionConfig,
    selectedBillingStudent,
    setSelectedBillingStudent,
    rebateAbsenceDays,
    setRebateAbsenceDays,
    dailyMessRate,
    setDailyMessRate,
    rebatePolicyRate,
    setRebatePolicyRate,
    selectedUpiAccount,
    setSelectedUpiAccount,
    upiAccounts,
    setUpiAccounts,
    newUpiForm,
    setNewUpiForm,
    showAllotmentModal,
    setShowAllotmentModal,
    allotTargetCandidate,
    setAllotTargetCandidate,
    showAddStudentModal,
    setShowAddStudentModal,
    placementMode,
    setPlacementMode,
    addStudentForm,
    setAddStudentForm,
    customBillRows,
    setCustomBillRows,
    showBlueprintCreatorModal,
    setShowBlueprintCreatorModal,
    blueprintCreateType,
    setBlueprintCreateType,
    newBlockName,
    setNewBlockName,
    newFloorName,
    setNewFloorName,
    newFloorNumber,
    setNewFloorNumber,
    newFloorBlockId,
    setNewFloorBlockId,
    newRoomNumber,
    setNewRoomNumber,
    newRoomCapacity,
    setNewRoomCapacity,
    newRoomType,
    setNewRoomType,
    newRoomBlockId,
    setNewRoomBlockId,
    newRoomFloorId,
    setNewRoomFloorId,
    showSettingsModal,
    setShowSettingsModal,
    notification,
    setNotification,
    handleFormalAllotment,
    handleSaveStudentComprehensive,
    handleAddCustomBillRow,
    handleRemoveCustomBillRow,
    customBillsGrandTotal,
    calculatedRebate,
    calculatedNetBill,
    handleSaveUpiAccount,
    setDefaultUpi,
    totalCapacityCount,
    allottedBedsCount,
    vacantBedsCount,
    waitingStudentsCount,
    showToast,
    activeTab,
    setActiveTab,
    currentUser,
    handleLogout,
    fetchSessionAndAllData,
    handleCreateBlueprint,
  } = props;

  return (
    <>
      <div className="space-y-5 animate-fadeIn">
        {/* Filter Ribbon */}
        <div className="w-full bg-white border border-slate-300 rounded-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-5 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="Search room (e.g. 204), resident name, roll number, bed ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={roomBlockFilter}
                onChange={(e) => setRoomBlockFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Blocks</option>
                <option value="block-a">Block A (Kautilya Bhavan)</option>
                <option value="block-b">Block B (Aryabhata)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={roomFloorFilter}
                onChange={(e) => setRoomFloorFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Floors</option>
                <option value="ground">Ground Floor (001-020)</option>
                <option value="1">Floor 1 (Rooms 101-120)</option>
                <option value="2">Floor 2 (Rooms 201-220)</option>
                <option value="3">Floor 3 (Rooms 301-320)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={roomOccupancyFilter}
                onChange={(e) => setRoomOccupancyFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Occupancy States</option>
                <option value="allotted">Fully Allotted</option>
                <option value="vacant">Partially Vacant</option>
                <option value="maintenance">Asset Defect / Hold</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-center justify-end gap-1">
              <button
                onClick={() => {
                  setRoomSearch("");
                  setRoomBlockFilter("all");
                  setRoomFloorFilter("all");
                  setRoomOccupancyFilter("all");
                }}
                className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Reset Filters"
              >
                <i className="fa-solid fa-arrows-rotate text-xs"></i>
              </button>
              <button
                onClick={() => setShowBlueprintCreatorModal(true)}
                className="h-8 px-2.5 flex items-center gap-1 border border-slate-900 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                title="Add to Blueprint"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span className="hidden lg:inline">Create</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded uppercase">
                PRD §3.2 &amp; §4.2
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Block Blueprint &amp; Room Matrix — Block A (Kautilya Bhavan) •
                2nd Floor
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive architectural room grid with individual furniture
              group tracking (Bed, Table, Chair IDs per PRD §3.2).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>{" "}
              Fully Allotted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>{" "}
              Partially Vacant
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>{" "}
              Maintenance / Defect
            </span>
          </div>
        </div>

        {/* Priority Queue Pool Banner */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-900 text-sm">
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                  Priority Queue Pool
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Next in Line: Manish Kumar (23ME058)
                </h3>
                <span className="font-mono text-[11px] bg-white border border-amber-200 px-1.5 py-0.5 rounded text-slate-800 font-semibold">
                  85 km • CGPA 8.82
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Eligible for Room 205 (Slot B) • Furniture:{" "}
                <span className="font-mono text-[11px] text-slate-900 font-medium">
                  BED-BA-205-B, TBL-BA-205-B, CHR-BA-205-B
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(true)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-user-plus text-[10px]"></i>
              <span>+ New Applicant Form</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAllotTargetCandidate({
                  name: "Manish Kumar",
                  rollNo: "23ME058",
                  roomSlot: "205-B",
                  distance: "85 km (Purnia)",
                  cgpa: "8.82",
                });
                setShowAllotmentModal(true);
              }}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-check text-[10px]"></i>
              <span>Allot to Room 205-B</span>
            </button>
          </div>
        </div>

        {/* Room Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Room 201 */}
          <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Room 201
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                      Double Occupancy
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Corner Wing • South Facing
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{" "}
                  2/2 Allotted
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP A
                        </span>
                        <p className="font-bold text-slate-900">Rahul Verma</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Roll:{" "}
                        <span className="font-mono font-semibold text-slate-800">
                          23CSE012
                        </span>{" "}
                        • 4th Sem (CSE)
                      </p>
                    </div>
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      BED-BA-201-A
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      TBL-BA-201-A
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      CHR-BA-201-A
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP B
                        </span>
                        <p className="font-bold text-slate-900">Amit Patel</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Roll:{" "}
                        <span className="font-mono font-semibold text-slate-800">
                          23ME044
                        </span>{" "}
                        • 4th Sem (ME)
                      </p>
                    </div>
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      BED-BA-201-B
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      TBL-BA-201-B
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      CHR-BA-201-B
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-boxes-stacked text-[11px]"></i> Assets
                Verified
              </span>
              <button
                onClick={() =>
                  alert(
                    "Audit History: Room 201 inventory signed by Caretaker on Jan 14, 2026.",
                  )
                }
                className="text-slate-900 font-semibold hover:underline"
              >
                Audit History →
              </button>
            </div>
          </div>

          {/* Room 204 (Active Focus) */}
          <div className="bg-white border-2 border-slate-900 rounded-lg p-4 flex flex-col justify-between relative">
            <div className="absolute -top-2.5 right-4 bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              Current Focus
            </div>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Room 204
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[10px] font-bold">
                      Verified Active
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Main Corridor • East Balcony
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{" "}
                  2/2 Allotted
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-white bg-slate-900 px-1 rounded">
                          GRP A
                        </span>
                        <p className="font-bold text-slate-900">Aman Verma</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        CSE (2023-27) • Roll:{" "}
                        <span className="font-mono font-semibold text-slate-800">
                          23CSE019
                        </span>
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      Key Holder
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-700 text-center">
                    <div className="bg-white py-0.5 rounded border border-slate-200">
                      BED-BA-204-A
                    </div>
                    <div className="bg-white py-0.5 rounded border border-slate-200">
                      TBL-BA-204-A
                    </div>
                    <div className="bg-white py-0.5 rounded border border-slate-200">
                      CHR-BA-204-A
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP B
                        </span>
                        <p className="font-bold text-slate-900">Rahul Kumar</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ECE (2023-27) • Roll:{" "}
                        <span className="font-mono font-semibold text-slate-800">
                          23ECE042
                        </span>
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-semibold">
                      Rebate Eligible
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-700 text-center">
                    <div className="bg-white py-0.5 rounded border border-slate-200">
                      BED-BA-204-B
                    </div>
                    <div className="bg-white py-0.5 rounded border border-slate-200">
                      TBL-BA-204-B
                    </div>
                    <div className="bg-white py-0.5 rounded border border-slate-200">
                      CHR-BA-204-B
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => setActiveTab("students")}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-800 font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Manage Residents
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Inspect Ledger
              </button>
            </div>
          </div>

          {/* Room 205 (Vacant Bed) */}
          <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Room 205
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                      Double Occupancy
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Main Corridor • Quiet Zone
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>{" "}
                  1 Bed Vacant (1/2)
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP A
                        </span>
                        <p className="font-bold text-slate-900">
                          Neeraj Sharma
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        EE (2024-28) • Roll:{" "}
                        <span className="font-mono font-semibold text-slate-800">
                          24EE008
                        </span>
                      </p>
                    </div>
                    <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      BED-BA-205-A
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      TBL-BA-205-A
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      CHR-BA-205-A
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setAllotTargetCandidate({
                      name: "Manish Kumar",
                      rollNo: "23ME058",
                      roomSlot: "205-B",
                      distance: "85 km (Purnia)",
                      cgpa: "8.82",
                    });
                    setShowAllotmentModal(true);
                  }}
                  className="p-2.5 bg-white rounded border border-dashed border-slate-400 hover:border-slate-900 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1 rounded">
                        GRP B
                      </span>
                      <p className="font-bold text-amber-900 text-xs">
                        VACANT BED SLOT
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-900 font-bold underline">
                      Click to Allot
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Furniture Ready: Bed, Table, and Chair cleaned &amp;
                    verified.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-400">
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded">
                      BED-BA-205-B
                    </span>
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded">
                      TBL-BA-205-B
                    </span>
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded">
                      CHR-BA-205-B
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Queue Match: #1 Manish Kumar
              </span>
              <button
                onClick={() => {
                  setAllotTargetCandidate({
                    name: "Manish Kumar",
                    rollNo: "23ME058",
                    roomSlot: "205-B",
                    distance: "85 km (Purnia)",
                    cgpa: "8.82",
                  });
                  setShowAllotmentModal(true);
                }}
                className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-user-plus text-[10px]"></i>
                <span>+ Allot Waiting</span>
              </button>
            </div>
          </div>

          {/* Room 208 (Prefect Single) */}
          <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Room 208
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                      Single / Prefect
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    North Wing • Attached Washroom
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{" "}
                  1/1 Allotted
                </span>
              </div>

              <div className="mt-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP A
                        </span>
                        <p className="font-bold text-slate-900">
                          Vikash Singh (Hostel Prefect)
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Civil (2022-26) • Roll:{" "}
                        <span className="font-mono font-semibold text-slate-800">
                          22CE015
                        </span>
                      </p>
                    </div>
                    <i className="fa-solid fa-award text-amber-600 text-xs"></i>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      BED-BA-208-A
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      TBL-BA-208-A
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      CHR-BA-208-A
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Disciplinary: Clean
              </span>
              <button
                onClick={() =>
                  alert(
                    "Prefect Special Allotment Memo #MEMO-PRF-2024-08 issued by Chief Warden.",
                  )
                }
                className="text-slate-900 font-semibold hover:underline"
              >
                View Allotment Memo →
              </button>
            </div>
          </div>

          {/* Room 210 (Triple Occupancy with Defect) */}
          <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between lg:col-span-2">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Room 210
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                      Triple Occupancy (3 Beds)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    East Wing Corner • Extended Layout
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{" "}
                  2/3 Allotted
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                      GRP A
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      Subham Kumar
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ECE • 2023-27
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[10px] text-slate-600">
                    BED-BA-210-A
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                      GRP B
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      Priyanshu Raj
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    CSE • 2023-27
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[10px] text-slate-600">
                    BED-BA-210-B
                  </div>
                </div>

                <div className="p-2.5 bg-red-50/60 rounded border border-dashed border-red-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-red-800 px-1 bg-red-100 rounded">
                        GRP C
                      </span>
                      <p className="font-bold text-red-800 text-xs">
                        Asset Hold
                      </p>
                    </div>
                    <i className="fa-solid fa-triangle-exclamation text-red-600 text-xs"></i>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Table Missing: Replacement logged
                  </p>
                  <div className="mt-2 pt-2 border-t border-red-200 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-800 font-semibold">
                      BED-BA-210-C
                    </span>
                    <span className="text-red-700 font-bold">TBL-MISSING</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">
                Ticket #WS-2041: Carpenter assigned to Group C desk replacement.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    alert(
                      "Dynamic Furniture Binding modal initialized for Room 210.",
                    )
                  }
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Furniture Config
                </button>
                <button
                  onClick={() =>
                    alert(
                      "Maintenance dispatched: Requisition forwarded to Estate Officer.",
                    )
                  }
                  className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Dispatch Requisition
                </button>
              </div>
            </div>
          </div>

          {/* Floor Plan Quick Selector */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Floor Plan Quick Selector
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                20 Rooms in Floor 2
              </p>
              <div className="mt-2.5 grid grid-cols-5 gap-1.5 font-mono text-[11px] text-center">
                {Array.from({ length: 20 }, (_, i) => {
                  const num = 201 + i;
                  const isFocus = num === 204;
                  const isVacant = num === 205 || num === 213 || num === 219;
                  const isDefect = num === 210;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRoomSearch(`Room ${num}`)}
                      className={`py-1 rounded font-bold transition cursor-pointer ${
                        isFocus
                          ? "bg-slate-900 text-white border border-slate-900 ring-2 ring-slate-400"
                          : isDefect
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : isVacant
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Floor 2: 42/45 Beds Occupied
              </span>
              <button
                onClick={() =>
                  alert(
                    "Downloading certified high-res Floor 2 Architectural Blueprint PDF...",
                  )
                }
                className="text-slate-900 font-semibold hover:underline"
              >
                Download Blueprint PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

