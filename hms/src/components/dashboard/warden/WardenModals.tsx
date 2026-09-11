// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { format } from "date-fns";

export function WardenModals(props: any) {
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
      {showAllotmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] rounded uppercase font-bold">
                  Formal Assignment Flow
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Manual Resident Room Allotment
                </h3>
                <p className="text-xs text-slate-500">
                  Assigning waiting applicant to designated vacant bed slot •
                  PRD §3.2
                </p>
              </div>
              <button
                onClick={() => setShowAllotmentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Target Candidate (Waiting Queue Verification)
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {allotTargetCandidate.name}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Roll No:{" "}
                    <span className="font-mono font-bold text-slate-800">
                      {allotTargetCandidate.rollNo}
                    </span>{" "}
                    • Verified Waiting Candidate (
                    {allotTargetCandidate.distance || "85 km"})
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                  Verified Eligible
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Target Accommodation Slot
                </label>
                <select
                  value={allotTargetCandidate.roomSlot}
                  onChange={(e) =>
                    setAllotTargetCandidate({
                      ...allotTargetCandidate,
                      roomSlot: e.target.value,
                    })
                  }
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                >
                  <option value="205-B">
                    Room 205 (Block A) — Bed Slot B (Vacant)
                  </option>
                  <option value="213-A">
                    Room 213 (Block A) — Bed Slot A (Vacant)
                  </option>
                  <option value="219-A">
                    Room 219 (Block A) — Bed Slot A (Vacant)
                  </option>
                  <option value="220-A">
                    Room 220 (Block A) — Bed Slot A (Vacant)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Fee Clearance Verification
                </label>
                <input
                  readOnly
                  type="text"
                  value="Hostel Admission Receipt #HAR-2026-901"
                  className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-slate-700"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 space-y-1.5 bg-slate-50 text-xs">
              <span className="font-bold text-slate-900 block uppercase text-[11px]">
                Furniture Group Automatic Binding (PRD §3.2)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">
                    Bed Asset ID
                  </span>
                  <span className="text-slate-900 font-bold text-xs">
                    BED-BA-
                    {allotTargetCandidate.roomSlot?.split("-")[0] || "205"}-
                    {allotTargetCandidate.roomSlot?.split("-")[1] || "B"}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">
                    Table Asset ID
                  </span>
                  <span className="text-slate-900 font-bold text-xs">
                    TBL-BA-
                    {allotTargetCandidate.roomSlot?.split("-")[0] || "205"}-
                    {allotTargetCandidate.roomSlot?.split("-")[1] || "B"}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">
                    Chair Asset ID
                  </span>
                  <span className="text-slate-900 font-bold text-xs">
                    CHR-BA-
                    {allotTargetCandidate.roomSlot?.split("-")[0] || "205"}-
                    {allotTargetCandidate.roomSlot?.split("-")[1] || "B"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Digital handover acknowledgment slip will be dispatched to
                student registered email and portal account.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAllotmentModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormalAllotment}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-circle-check text-xs"></i>
                <span>Confirm &amp; Generate Allotment Memo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-lg p-6 space-y-4 my-8 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] rounded uppercase font-bold">
                    Institutional Onboarding
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded uppercase">
                    Simultaneous Bill Generation Enabled
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Add Student (Manual / Waiting) &amp; Dispatch Initial
                  Admission Bills
                </h3>
                <p className="text-xs text-slate-500">
                  Manual student profile enrollment with category-wise bill
                  issuance and designated UPI routing.
                </p>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveStudentComprehensive(false);
              }}
              className="space-y-4 text-xs max-h-[72vh] overflow-y-auto pr-2"
            >
              {/* 1. Student Profile Particulars */}
              <div className="border border-slate-300 rounded p-3.5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fa-solid fa-user text-slate-600"></i>
                    1. PRD §3.1.1 Student Profile Particulars
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    Academic &amp; Guardian Info
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block">
                    Personal Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addStudentForm.name}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        DOB *
                      </label>
                      <input
                        type="date"
                        value={addStudentForm.dob}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            dob: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Blood Group *
                      </label>
                      <select
                        value={addStudentForm.bloodGroup}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            bloodGroup: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      >
                        <option value="B+">B +ve</option>
                        <option value="O+">O +ve</option>
                        <option value="A+">A +ve</option>
                        <option value="AB+">AB +ve</option>
                        <option value="B-">B -ve</option>
                        <option value="O-">O -ve</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Mobile No *
                      </label>
                      <input
                        type="tel"
                        required
                        value={addStudentForm.phone}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Institutional Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={addStudentForm.email}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className="sm:col-span-3">
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Permanent Residential Address *
                      </label>
                      <input
                        type="text"
                        value={addStudentForm.address}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            address: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Distance from Campus (KM) *
                      </label>
                      <input
                        type="number"
                        required
                        value={addStudentForm.distance}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            distance: Number(e.target.value),
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block mb-1">
                    Academic Details
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={addStudentForm.rollNo}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            rollNo: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        BEU Reg No
                      </label>
                      <input
                        type="text"
                        value={addStudentForm.regNo}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            regNo: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Branch *
                      </label>
                      <select
                        value={addStudentForm.branch}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            branch: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      >
                        <option value="ME">Mechanical (ME)</option>
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="ECE">Electronics (ECE)</option>
                        <option value="CE">Civil Engg (CE)</option>
                        <option value="EE">Electrical (EE)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Session
                      </label>
                      <input
                        type="text"
                        value={addStudentForm.session}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            session: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Semester &amp; CGPA
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={addStudentForm.semester}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              semester: e.target.value,
                            })
                          }
                          className="w-1/2 py-1 px-1 border border-slate-300 rounded text-center text-slate-900"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={addStudentForm.cgpa}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              cgpa: Number(e.target.value),
                            })
                          }
                          className="w-1/2 py-1 px-1 border border-slate-300 rounded text-center font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block mb-1">
                    Parent / Guardian Particulars
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Father Name *
                      </label>
                      <input
                        type="text"
                        value={addStudentForm.fatherName}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            fatherName: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Mother Name *
                      </label>
                      <input
                        type="text"
                        value={addStudentForm.motherName}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            motherName: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">
                        Parent Mobile *
                      </label>
                      <input
                        type="tel"
                        value={addStudentForm.parentPhone}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            parentPhone: e.target.value,
                          })
                        }
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Verification Documents */}
              <div className="border border-slate-300 rounded p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fa-solid fa-file-invoice text-slate-600"></i>
                    2. PRD §3.1.1 Hostel &amp; Verification Documents
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">
                      Mess Card No (Optional)
                    </label>
                    <input
                      type="text"
                      value={addStudentForm.messCard}
                      onChange={(e) =>
                        setAddStudentForm({
                          ...addStudentForm,
                          messCard: e.target.value,
                        })
                      }
                      className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">
                      Dossier / Verification Link *
                    </label>
                    <input
                      type="text"
                      value={addStudentForm.docLink}
                      onChange={(e) =>
                        setAddStudentForm({
                          ...addStudentForm,
                          docLink: e.target.value,
                        })
                      }
                      className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">
                      Aadhaar / ID Proof Ref
                    </label>
                    <input
                      type="text"
                      value={addStudentForm.aadhaar}
                      onChange={(e) =>
                        setAddStudentForm({
                          ...addStudentForm,
                          aadhaar: e.target.value,
                        })
                      }
                      className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Accommodation & Furniture Binding */}
              <div className="border border-slate-300 rounded p-3.5 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fa-solid fa-door-open text-slate-600"></i>
                    3. Accommodation &amp; Furniture Binding
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                      <input
                        type="radio"
                        name="placementMode"
                        checked={placementMode === "allotted"}
                        onChange={() => setPlacementMode("allotted")}
                        className="text-slate-900"
                      />
                      <span>Direct Allot to Room</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                      <input
                        type="radio"
                        name="placementMode"
                        checked={placementMode === "waiting"}
                        onChange={() => setPlacementMode("waiting")}
                        className="text-slate-900"
                      />
                      <span>Waiting Queue Pool</span>
                    </label>
                  </div>
                </div>

                {placementMode === "allotted" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">
                          1. Hostel Block *
                        </label>
                        <select
                          value={addStudentForm.targetBlock}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              targetBlock: e.target.value,
                            })
                          }
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="Block A (Kautilya Bhavan)">
                            Block A (Kautilya Bhavan)
                          </option>
                          <option value="Block B (Aryabhata Bhavan)">
                            Block B (Aryabhata Bhavan)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">
                          2. Floor Level *
                        </label>
                        <select
                          value={addStudentForm.targetFloor}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              targetFloor: e.target.value,
                            })
                          }
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="Ground Floor">
                            Ground Floor (001-020)
                          </option>
                          <option value="1st Floor">1st Floor (101-120)</option>
                          <option value="2nd Floor">2nd Floor (201-220)</option>
                          <option value="3rd Floor">3rd Floor (301-320)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">
                          3. Target Room *
                        </label>
                        <select
                          value={addStudentForm.targetRoom}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              targetRoom: e.target.value,
                            })
                          }
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="205">
                            Room 205 (Double - 1 Vacant)
                          </option>
                          <option value="208">
                            Room 208 (Single - Vacant)
                          </option>
                          <option value="213">
                            Room 213 (Double - 1 Vacant)
                          </option>
                          <option value="219">
                            Room 219 (Double - 2 Vacant)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">
                          4. Slot / Group *
                        </label>
                        <select
                          value={addStudentForm.targetSlot}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              targetSlot: e.target.value,
                            })
                          }
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="B">
                            Bed Slot B (Vacant - Group B)
                          </option>
                          <option value="A">Bed Slot A (Group A)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded text-xs space-y-1 mt-2">
                      <span className="font-bold text-slate-900 uppercase text-[10px] block">
                        Bound Furniture Group Assets Preview
                      </span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-center">
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[9px] text-slate-400 block uppercase">
                            Bed Asset
                          </span>
                          <span className="font-bold text-slate-900">
                            BED-BA-{addStudentForm.targetRoom}-
                            {addStudentForm.targetSlot}
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[9px] text-slate-400 block uppercase">
                            Table Asset
                          </span>
                          <span className="font-bold text-slate-900">
                            TBL-BA-{addStudentForm.targetRoom}-
                            {addStudentForm.targetSlot}
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[9px] text-slate-400 block uppercase">
                            Chair Asset
                          </span>
                          <span className="font-bold text-slate-900">
                            CHR-BA-{addStudentForm.targetRoom}-
                            {addStudentForm.targetSlot}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Centralized Initial Admission Bills Ledger */}
              <div className="border-2 border-slate-900 rounded p-4 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <i className="fa-solid fa-file-invoice-dollar text-slate-900"></i>
                      4. Initial Admission Bills &amp; Custom Charge Generator
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Generate standard and customized institutional charge
                      items with designated UPI routing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomBillRow}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>+ Add Custom Charge</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">Charge Title</th>
                        <th className="py-2 px-3 w-28">Amount (₹)</th>
                        <th className="py-2 px-3 w-32">Due Date</th>
                        <th className="py-2 px-3">Designated Receiving UPI</th>
                        <th className="py-2 px-3 text-center">Nature</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {customBillRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setCustomBillRows(
                                  customBillRows.map((r) =>
                                    r.id === row.id
                                      ? { ...r, title: newTitle }
                                      : r,
                                  ),
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-semibold text-slate-900"
                            />
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {row.subtitle}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => {
                                const newAmt = Number(e.target.value);
                                setCustomBillRows(
                                  customBillRows.map((r) =>
                                    r.id === row.id
                                      ? { ...r, amount: newAmt }
                                      : r,
                                  ),
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-mono font-bold text-slate-900"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={row.dueDate}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                setCustomBillRows(
                                  customBillRows.map((r) =>
                                    r.id === row.id
                                      ? { ...r, dueDate: newDate }
                                      : r,
                                  ),
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-[11px]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={row.upi}
                              onChange={(e) => {
                                const newUpi = e.target.value;
                                setCustomBillRows(
                                  customBillRows.map((r) =>
                                    r.id === row.id ? { ...r, upi: newUpi } : r,
                                  ),
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-xs font-bold text-slate-900"
                            >
                              <option value="hosteladmin@sbi">
                                hosteladmin@sbi (Hostel Main)
                              </option>
                              <option value="gecmess@sbi">
                                gecmess@sbi (Mess Facility)
                              </option>
                              <option value="gecdeposit@sbi">
                                gecdeposit@sbi (Caution Deposit)
                              </option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] uppercase">
                              {row.nature}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomBillRow(row.id)}
                              className="text-slate-400 hover:text-red-700 p-1"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">
                    Cumulative Total Invoiced:
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    ₹{" "}
                    {customBillsGrandTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveStudentComprehensive(true)}
                    className="px-4 py-2 border border-slate-300 bg-slate-50 text-slate-800 rounded font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Save as WAITING Candidate
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Save Student &amp; Dispatch Bills
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBlueprintCreatorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Warden Blueprint Designer (PRD §3.2)
                </h3>
                <p className="text-xs text-slate-500">
                  Build and expand your hostel category physical architecture
                </p>
              </div>
              <button
                onClick={() => setShowBlueprintCreatorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Sub-type switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setBlueprintCreateType("room")}
                className={`flex-1 py-1.5 font-semibold rounded transition ${
                  blueprintCreateType === "room"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Add Room
              </button>
              <button
                type="button"
                onClick={() => setBlueprintCreateType("floor")}
                className={`flex-1 py-1.5 font-semibold rounded transition ${
                  blueprintCreateType === "floor"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Add Floor
              </button>
              <button
                type="button"
                onClick={() => setBlueprintCreateType("block")}
                className={`flex-1 py-1.5 font-semibold rounded transition ${
                  blueprintCreateType === "block"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Add Block
              </button>
            </div>

            {/* Sub-Form: Add Room */}
            {blueprintCreateType === "room" && (
              <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Target Block *
                    </label>
                    <select
                      value={newRoomBlockId}
                      onChange={(e) => setNewRoomBlockId(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                      required
                    >
                      {blocks.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                      {blocks.length === 0 && (
                        <option value="">Block A (Default)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Target Floor *
                    </label>
                    <select
                      value={newRoomFloorId}
                      onChange={(e) => setNewRoomFloorId(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                      required
                    >
                      {floors.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name} (Floor {f.floorNumber})
                        </option>
                      ))}
                      {floors.length === 0 && (
                        <option value="">Floor 2 (Default)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 206"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Capacity (Beds) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={newRoomCapacity}
                      onChange={(e) =>
                        setNewRoomCapacity(Number(e.target.value))
                      }
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Room Type
                    </label>
                    <select
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Dormitory">Dormitory</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    Automatic Furniture Inventory Binding
                  </span>
                  <p className="text-[11px]">
                    Sequential furniture groups (Group A, Group B...) will be
                    automatically generated with tagged serial codes:{" "}
                    <span className="font-mono text-slate-900">
                      BED-{newRoomNumber || "206"}-A, TBL-
                      {newRoomNumber || "206"}-A, CHR-{newRoomNumber || "206"}-A
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBlueprintCreatorModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Form: Add Floor */}
            {blueprintCreateType === "floor" && (
              <form onSubmit={handleCreateFloor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Parent Block *
                  </label>
                  <select
                    value={newFloorBlockId}
                    onChange={(e) => setNewFloorBlockId(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                    required
                  >
                    {blocks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                    {blocks.length === 0 && <option value="">Block A</option>}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Floor Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 3rd Floor"
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Floor Level Number *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={15}
                      value={newFloorNumber}
                      onChange={(e) =>
                        setNewFloorNumber(Number(e.target.value))
                      }
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBlueprintCreatorModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Create Floor
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Form: Add Block */}
            {blueprintCreateType === "block" && (
              <form onSubmit={handleCreateBlock} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Block / Wing Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block C (Ramanujan Bhavan)"
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Will be created under your assigned hostel jurisdiction:{" "}
                    <strong>
                      {currentUser?.assignedCategory || "Boys Hostel Category"}
                    </strong>
                    .
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBlueprintCreatorModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Create Block
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Portal Diagnostics &amp; Settings
              </h4>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-slate-700">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Framework:</span>
                  <span className="font-bold text-slate-900">
                    Next.js 16 (Turbopack)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Database:</span>
                  <span className="font-bold text-emerald-700">
                    MongoDB Atlas (Healthy)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warden Identity:</span>
                  <span className="font-bold text-slate-900">
                    {currentUser?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jurisdiction:</span>
                  <span className="font-bold text-slate-900">
                    {currentUser?.assignedCategory}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

