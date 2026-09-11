// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { format } from "date-fns";

export function UpiAccountsManager(props: any) {
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
                UPI Requisitions &amp; Gateways
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Warden UPI Payment Accounts &amp; Dynamic QR Gateway
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage designated SBI / NPCI Virtual Private Addresses (VPA) and
              QR endpoints for student fee collection, mess dues, and caution
              deposits.
            </p>
          </div>
          <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 border border-slate-300 rounded font-semibold text-slate-700">
            {upiAccounts.length} CONFIGURED ACCOUNTS
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Default Active Account
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {upiAccounts.find((a) => a.isDefault)?.title ||
                  "Mess Facility Account"}
              </div>
              <span className="font-mono text-xs text-emerald-700 font-bold">
                {upiAccounts.find((a) => a.isDefault)?.vpa || "gecmess@sbi"}
              </span>
            </div>
            <i className="fa-solid fa-circle-check text-emerald-600 text-xl"></i>
          </div>

          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Supported Payment Rails
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                BHIM UPI / SBI QR
              </div>
              <span className="text-[11px] text-slate-500">
                Zero Transaction Surcharge
              </span>
            </div>
            <i className="fa-solid fa-building-columns text-slate-800 text-xl"></i>
          </div>

          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Gateway Reconciliations
              </span>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">
                100% Verified
              </div>
              <span className="text-[11px] text-slate-500">
                Instant Webhook Feed
              </span>
            </div>
            <i className="fa-solid fa-cloud-arrow-up text-emerald-600 text-xl"></i>
          </div>
        </div>

        {/* 2-Column Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Configured Accounts List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Configured Destination Accounts
              </h3>
              <span className="font-mono text-[11px] text-slate-500">
                {upiAccounts.length} Registered Accounts
              </span>
            </div>

            {upiAccounts.map((acc) => (
              <div
                key={acc.id}
                className={`p-4 bg-white rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 border transition ${
                  acc.isDefault
                    ? "border-2 border-slate-900"
                    : "border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded border border-slate-300 bg-slate-50 flex flex-col items-center justify-center flex-shrink-0 text-center">
                    <i className="fa-solid fa-qrcode text-lg text-slate-800"></i>
                    <span className="font-mono text-[8px] uppercase text-slate-500 leading-none">
                      SBI QR
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {acc.title}
                      </h4>
                      {acc.isDefault && (
                        <span className="px-1.5 py-0.2 bg-slate-900 text-white font-mono text-[9px] font-bold rounded uppercase">
                          Default Dispatched
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Payee Name:{" "}
                      <strong className="text-slate-800">{acc.payee}</strong>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-xs text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {acc.vpa}
                      </span>
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                        {acc.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  {!acc.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setDefaultUpi(acc.vpa)}
                      className="text-xs text-slate-900 font-bold hover:underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>{" "}
                      Live Gateway
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        alert(`Editing parameters for ${acc.title}`)
                      }
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Edit
                    </button>
                    {!acc.isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          setUpiAccounts(
                            upiAccounts.filter((a) => a.id !== acc.id),
                          );
                          showToast("success", `Account ${acc.title} removed.`);
                        }}
                        className="px-2 py-1 border border-slate-300 text-red-600 rounded text-xs font-semibold hover:bg-red-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Add New Account Form */}
          <div className="lg:col-span-5 bg-white border border-slate-300 rounded-lg p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Add New UPI Account
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Register an institutional VPA / UPI address to enable instant
                student QR checkout.
              </p>
            </div>

            <form onSubmit={handleSaveUpiAccount} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Account Title / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mess Fee Account, Electricity & DG Fund"
                  value={newUpiForm.title}
                  onChange={(e) =>
                    setNewUpiForm({ ...newUpiForm, title: e.target.value })
                  }
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Payee Name (as registered with Bank) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warden Boys Hostel GEC Munger"
                  value={newUpiForm.payee}
                  onChange={(e) =>
                    setNewUpiForm({ ...newUpiForm, payee: e.target.value })
                  }
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. wardenboys@sbi"
                    value={newUpiForm.vpa}
                    onChange={(e) =>
                      setNewUpiForm({ ...newUpiForm, vpa: e.target.value })
                    }
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={newUpiForm.category}
                    onChange={(e) =>
                      setNewUpiForm({ ...newUpiForm, category: e.target.value })
                    }
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none"
                  >
                    <option value="mess">Mess Operations</option>
                    <option value="hostel">
                      Hostel Rent &amp; Maintenance
                    </option>
                    <option value="caution">Security Caution Deposit</option>
                    <option value="amenity">Gym &amp; Amenities Fund</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded p-3 space-y-1.5 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider block text-[11px]">
                    QR Code Source
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    Auto-Generated Dynamic QR
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  The portal automatically generates standardized NPCI UPI QR
                  codes compatible with Google Pay, PhonePe, Paytm, and BHIM
                  app.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="makeDefaultCheckbox"
                  checked={newUpiForm.makeDefault}
                  onChange={(e) =>
                    setNewUpiForm({
                      ...newUpiForm,
                      makeDefault: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-slate-900"
                />
                <label
                  htmlFor="makeDefaultCheckbox"
                  className="text-slate-700 cursor-pointer"
                >
                  Make this the default UPI destination for newly dispatched
                  invoices
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="reset"
                  onClick={() =>
                    setNewUpiForm({
                      title: "",
                      payee: "",
                      vpa: "",
                      category: "mess",
                      makeDefault: false,
                    })
                  }
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                >
                  Save UPI Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

