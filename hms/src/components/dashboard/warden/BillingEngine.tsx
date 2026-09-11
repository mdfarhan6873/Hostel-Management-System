// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { format } from "date-fns";

export function BillingEngine(props: any) {
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded uppercase">
                PRD §3.5 &amp; §4.4
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Warden Billing Operations &amp; Leave Rebate Deduction Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculate student invoices, cross-reference gate pass absence
              records, and enforce automatic 70% mess fee rebates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 border border-slate-300 rounded font-semibold text-slate-700">
              CYCLE: FEB 2026
            </span>
            <button
              onClick={() =>
                showToast(
                  "success",
                  "Batch billing notification triggered for all 510 active residents via SMS & Student Portal!",
                )
              }
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
              <span>Batch Dispatch Invoices</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Total Invoiced (Feb 2026)
            </span>
            <div className="text-xl font-mono font-bold text-slate-900 mt-1">
              ₹25,84,200
            </div>
            <span className="text-[11px] text-slate-500">
              510 active hostel billings
            </span>
          </div>
          <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Collected via SBI / UPI QR
            </span>
            <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
              ₹21,90,000
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              84.7% settlement rate
            </span>
          </div>
          <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Mess Rebates Applied
            </span>
            <div className="text-xl font-mono font-bold text-amber-800 mt-1">
              ₹58,800
            </div>
            <span className="text-[11px] text-slate-500">
              70 approved absence passes
            </span>
          </div>
          <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Outstanding Dues
            </span>
            <div className="text-xl font-mono font-bold text-red-700 mt-1">
              ₹3,35,400
            </div>
            <span className="text-[11px] text-red-700 font-medium">
              66 students pending
            </span>
          </div>
        </div>

        {/* 2-Column Calculator + Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Calculator */}
          <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-calculator text-slate-800 text-sm"></i>
                <h3 className="text-sm font-bold text-slate-900">
                  Interactive Rebate Deduction Engine
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] rounded font-bold">
                PRD §4.4 Active
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
              <label className="font-semibold text-slate-700 uppercase tracking-wider block">
                Select Resident to Calculate Fee
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedBillingStudent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedBillingStudent(val);
                    if (val === "rahul") {
                      setRebateAbsenceDays(10);
                    } else {
                      setRebateAbsenceDays(0);
                    }
                  }}
                  className="py-1.5 px-2 bg-white border border-slate-300 rounded text-slate-900 font-medium focus:outline-none"
                >
                  <option value="rahul">
                    Rahul Kumar (23ECE042) • Room 204
                  </option>
                  <option value="aman">Aman Verma (23CSE019) • Room 204</option>
                  <option value="amit">Amit Patel (23ME044) • Room 201</option>
                  <option value="vikash">
                    Vikash Singh (22CE015) • Room 208
                  </option>
                </select>

                <input
                  readOnly
                  value={
                    selectedBillingStudent === "rahul"
                      ? "Pass #GP-8831: 10 Days Sanctioned (Rebate Eligible)"
                      : "No sanctioned >5 days leave on file"
                  }
                  className="py-1.5 px-2 bg-white border border-slate-300 rounded font-mono text-slate-700 text-[11px]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Deposit To UPI Account (Dispatched QR &amp; VPA)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedUpiAccount}
                    onChange={(e) => setSelectedUpiAccount(e.target.value)}
                    className="py-1.5 px-2 bg-white border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none"
                  >
                    {upiAccounts.map((acc) => (
                      <option key={acc.id} value={acc.vpa}>
                        {acc.title} ({acc.vpa})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs">
                    <span className="text-slate-500">Destination VPA:</span>
                    <span className="font-bold text-slate-900">
                      {selectedUpiAccount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Approved Absence Days
                </label>
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={rebateAbsenceDays}
                  onChange={(e) => setRebateAbsenceDays(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Daily Mess Rate (₹)
                </label>
                <input
                  type="number"
                  value={dailyMessRate}
                  onChange={(e) => setDailyMessRate(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Rebate Policy Rate
                </label>
                <select
                  value={rebatePolicyRate}
                  onChange={(e) => setRebatePolicyRate(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                >
                  <option value={0.7}>70% (PRD §4.4 Standard)</option>
                  <option value={1.0}>100% (Academic Recess)</option>
                  <option value={0.5}>50% (Partial Sanction)</option>
                </select>
              </div>
            </div>

            {/* Itemized Calculation Box */}
            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold uppercase tracking-wider text-slate-700">
                Fee Composition &amp; Leave Rebate Deductions (Month: February
                2026)
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">
                    Standard Monthly Mess Diet (30 Days @ ₹{dailyMessRate}/day)
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹3,600.00
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">
                    Hostel Maintenance &amp; Room Rent (Fixed)
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹1,500.00
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      Approved Leave Rebate Applied (PRD §4.4)
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      - ₹{calculatedRebate.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Sanctioned Absence: {rebateAbsenceDays} Continuous Days (
                      {dailyMessRate}/day ×{" "}
                      {(rebatePolicyRate * 100).toFixed(0)}%)
                    </span>
                    <span className="font-mono">
                      {rebateAbsenceDays} × ₹{dailyMessRate} ×{" "}
                      {rebatePolicyRate * 100}%
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      Net Payable Bill
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Standard before rebate: ₹5,100.00
                    </span>
                  </div>
                  <span className="font-mono text-xl font-bold text-slate-900">
                    ₹{calculatedNetBill.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-slate-900"
                />
                <span>SMS / Email Demand Note to Guardian</span>
              </label>
              <button
                onClick={() =>
                  showToast(
                    "success",
                    `Discounted Bill (₹${calculatedNetBill.toFixed(2)}) dispatched to Student Portal with UPI QR route (${selectedUpiAccount})!`,
                  )
                }
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span>Generate &amp; Dispatch Bill</span>
              </button>
            </div>
          </div>

          {/* Right Column: Ledger */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Fee Ledger &amp; QR Reconciliations
              </h3>
              <button
                onClick={() =>
                  showToast("success", "SBI webhook records refreshed!")
                }
                className="text-xs text-slate-700 font-semibold hover:underline flex items-center gap-1"
              >
                <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                <span>Sync SBI Portal</span>
              </button>
            </div>

            <div className="border border-slate-300 rounded-lg bg-white divide-y divide-slate-100 text-xs">
              <div className="p-3 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Aman Verma (23CSE019)
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹5,100.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>SBI UPI Ref: 405298109281</span>
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase text-[10px]">
                    Paid &amp; Settled
                  </span>
                </div>
              </div>

              <div className="p-3 hover:bg-slate-50 transition bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Amit Patel (23ME044)
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹5,100.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>HDFC NetBanking: #TXN-77192</span>
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase text-[10px]">
                    Paid &amp; Settled
                  </span>
                </div>
              </div>

              <div className="p-3 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Rahul Kumar (23ECE042)
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹4,260.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Pass #GP-8831 Rebate Applied (-₹840)</span>
                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded font-bold uppercase text-[10px]">
                    Dispatched
                  </span>
                </div>
              </div>

              <div className="p-3 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-800">
                    Rajesh Ranjan (23ME089)
                  </span>
                  <span className="font-mono font-bold text-red-700">
                    ₹5,600.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Regular Fee + ₹500 Curfew Fine</span>
                  <span className="px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold uppercase text-[10px]">
                    Overdue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

