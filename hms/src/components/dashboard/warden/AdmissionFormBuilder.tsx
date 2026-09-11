// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { format } from "date-fns";

export function AdmissionFormBuilder(props: any) {
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
                PRD §3.3 &amp; §4.3
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Warden Form Management &amp; Admission Windows
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure public admission cycles, upload regulatory fee
              documents, and track candidate pipeline.
            </p>
          </div>
          <button
            onClick={() =>
              showToast(
                "success",
                "New admission intake window template initialized",
              )
            }
            className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <i className="fa-solid fa-circle-plus text-xs"></i>
            <span>Create New Intake Window</span>
          </button>
        </div>

        {/* 2-Column Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Form Configuration */}
          <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Admission Cycle Configuration
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold rounded uppercase">
                Status: Published &amp; Accepting
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  "success",
                  "Admission window parameters saved & live public registration portal updated!",
                );
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Admission Window Title
                </label>
                <input
                  type="text"
                  value={admissionConfig.title}
                  onChange={(e) =>
                    setAdmissionConfig({
                      ...admissionConfig,
                      title: e.target.value,
                    })
                  }
                  className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Target Hostel Blocks
                  </label>
                  <select
                    value={admissionConfig.targetBlocks}
                    onChange={(e) =>
                      setAdmissionConfig({
                        ...admissionConfig,
                        targetBlocks: e.target.value,
                      })
                    }
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Block A & B (Boys)">
                      Boys Hostel: Block A &amp; Block B
                    </option>
                    <option value="Block A (Boys)">
                      Boys Hostel: Block A (Kautilya) Only
                    </option>
                    <option value="Block B (Boys)">
                      Boys Hostel: Block B (Aryabhata) Only
                    </option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Eligible Academic Years
                  </label>
                  <input
                    type="text"
                    value={admissionConfig.eligibility}
                    onChange={(e) =>
                      setAdmissionConfig({
                        ...admissionConfig,
                        eligibility: e.target.value,
                      })
                    }
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Window Opening Date
                  </label>
                  <input
                    type="date"
                    value={admissionConfig.openDate}
                    onChange={(e) =>
                      setAdmissionConfig({
                        ...admissionConfig,
                        openDate: e.target.value,
                      })
                    }
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={admissionConfig.deadline}
                    onChange={(e) =>
                      setAdmissionConfig({
                        ...admissionConfig,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Allotment Guidelines &amp; Public Note
                </label>
                <textarea
                  rows={3}
                  value={admissionConfig.notes}
                  onChange={(e) =>
                    setAdmissionConfig({
                      ...admissionConfig,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900 leading-relaxed"
                />
              </div>

              {/* Document Bindings */}
              <div className="border border-slate-200 rounded p-3 space-y-2 bg-slate-50">
                <span className="font-semibold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Regulatory Document Bindings
                </span>
                {admissionConfig.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-file-pdf text-red-600 text-sm"></i>
                      <span className="font-medium text-slate-800">{doc}</span>
                    </div>
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      Verified Attached
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Admission Round Paused: Public form marked inactive.",
                    )
                  }
                  className="px-3 py-1.5 border border-red-300 text-red-700 font-semibold rounded hover:bg-red-50 transition cursor-pointer"
                >
                  Pause Submissions
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-floppy-disk text-xs"></i>
                  <span>Save &amp; Update Live Form</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Student Portal Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Live Student Portal Preview
              </h3>
              <span className="font-mono text-[11px] text-slate-500">
                Read-Only Preview
              </span>
            </div>

            <div className="bg-white border-2 border-slate-300 rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold inline-block mb-1">
                    ONLINE REGISTRATION OPEN
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {admissionConfig.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hostel: {admissionConfig.targetBlocks}
                  </p>
                </div>
                <i className="fa-solid fa-bullhorn text-slate-800 text-xl"></i>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {admissionConfig.notes}
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Eligibility Criteria:</span>
                  <span className="font-semibold text-slate-900">
                    {admissionConfig.eligibility}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Application Deadline:</span>
                  <span className="font-mono font-bold text-red-700">
                    {admissionConfig.deadline} (11:59 PM)
                  </span>
                </div>
              </div>

              {/* Application Count Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Applications Received:{" "}
                    <strong className="text-slate-900">148</strong>
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    106 Verified / 42 Waiting
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex border border-slate-200">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: "71.6%" }}
                    title="Allotted"
                  ></div>
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: "28.4%" }}
                    title="Waiting"
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      "https://gecmunger.ac.in/hms/apply/spring-2026-boys-round2",
                    );
                    showToast(
                      "success",
                      "Public Registration URL copied to clipboard!",
                    );
                  }}
                  className="w-full py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-copy text-xs"></i>
                  <span>Copy Public Student Registration Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

