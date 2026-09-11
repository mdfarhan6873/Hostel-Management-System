// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { format } from "date-fns";

export function StudentRoster(props: any) {
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
        {/* Filter Toolbar */}
        <div className="w-full bg-white border border-slate-300 rounded-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-4 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search resident by name, roll no, room, phone..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Statuses (555)</option>
                <option value="allotted">Allotted Residents (510)</option>
                <option value="waiting">Waiting Priority Queue (42)</option>
                <option value="disciplinary">Disciplinary Notice (3)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={studentBranchFilter}
                onChange={(e) => setStudentBranchFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Branches</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics &amp; Comm (ECE)</option>
                <option value="ME">Mechanical Engg (ME)</option>
                <option value="CE">Civil Engg (CE)</option>
                <option value="EE">Electrical Engg (EE)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={studentSortFilter}
                onChange={(e) => setStudentSortFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
              >
                <option value="room">Sort: Room Number</option>
                <option value="distance">Sort: Distance (Farthest)</option>
                <option value="merit">Sort: BEU CGPA Merit</option>
                <option value="date">Sort: Allotment Date</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <i className="fa-solid fa-user-plus text-[10px]"></i>
                <span>+ Add Student</span>
              </button>
              <button
                onClick={() =>
                  alert("Exporting Complete Active Resident Master Roll CSV...")
                }
                className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Export CSV"
              >
                <i className="fa-solid fa-download text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Waiting Priority Queue Pool Table */}
        <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-3 bg-amber-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-700 text-white font-mono text-[10px] font-bold rounded uppercase">
                PRD §3.3 &amp; §3.4 Priority Pool
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Waiting Priority Queue (Distance &amp; BEU Merit Ranking)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">
                42 Candidates in Round 2 • 90 Vacancies in Block A/B
              </span>
              <button
                onClick={() =>
                  alert(
                    "Automated Batch Allotment executing: Top 5 distance-verified candidates assigned to Floor 2 & 3 vacancies!",
                  )
                }
                className="px-2.5 py-1 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition cursor-pointer"
              >
                Auto-Allot Top 5
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Applicant Name</th>
                  <th className="py-2.5 px-4">Roll / Reg No</th>
                  <th className="py-2.5 px-4">Branch &amp; Sem</th>
                  <th className="py-2.5 px-4">Permanent Address</th>
                  <th className="py-2.5 px-4">Distance</th>
                  <th className="py-2.5 px-4">BEU CGPA</th>
                  <th className="py-2.5 px-4 text-right">Allocation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    #01
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Manish Kumar
                  </td>
                  <td className="py-3 px-4 font-mono">23ME058</td>
                  <td className="py-3 px-4">Mechanical • 4th Sem</td>
                  <td className="py-3 px-4 text-slate-500">
                    Purnia, Bihar (854301)
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-200">
                      85 km
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    8.82
                  </td>
                  <td className="py-3 px-4 text-right">
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
                      className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Allot to Room 205 (Bed B)
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    #02
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Sandeep Anand
                  </td>
                  <td className="py-3 px-4 font-mono">23CE031</td>
                  <td className="py-3 px-4">Civil • 4th Sem</td>
                  <td className="py-3 px-4 text-slate-500">
                    Bhagalpur, Bihar (812002)
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-200">
                      62 km
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    8.45
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setAllotTargetCandidate({
                          name: "Sandeep Anand",
                          rollNo: "23CE031",
                          roomSlot: "213-A",
                          distance: "62 km (Bhagalpur)",
                          cgpa: "8.45",
                        });
                        setShowAllotmentModal(true);
                      }}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Allot to Room 213 (Bed A)
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    #03
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Saurav Pathak
                  </td>
                  <td className="py-3 px-4 font-mono">24CSE014</td>
                  <td className="py-3 px-4">CSE • 2nd Sem</td>
                  <td className="py-3 px-4 text-slate-500">
                    Jamui, Bihar (811307)
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-200">
                      48 km
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    8.91
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setAllotTargetCandidate({
                          name: "Saurav Pathak",
                          rollNo: "24CSE014",
                          roomSlot: "219-A",
                          distance: "48 km (Jamui)",
                          cgpa: "8.91",
                        });
                        setShowAllotmentModal(true);
                      }}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Allot to Room 219 (Bed A)
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Allotted Residents Master Roll */}
        <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Active Hostel Residents Roster
              </h3>
              <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                510 Enrolled
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Showing active enrolled personnel</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Resident Name &amp; Contact</th>
                  <th className="py-2.5 px-4">Roll / Reg No</th>
                  <th className="py-2.5 px-4">Branch &amp; Batch</th>
                  <th className="py-2.5 px-4">
                    Assigned Accommodation &amp; Assets
                  </th>
                  <th className="py-2.5 px-4">Mess Status</th>
                  <th className="py-2.5 px-4">Fee Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Student 1: Aman Verma */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">Aman Verma</p>
                    <span className="text-[11px] text-slate-500 block">
                      +91 98351 22910 • aman.v@ug.gecmunger.ac.in
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    23CSE019
                  </td>
                  <td className="py-3 px-4">CSE • 4th Sem (2023-27)</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      Room 204 • Bed A (Block A)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      TBL-BA-204-A • CHR-BA-204-A
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      Active / Present
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-700">
                      Paid (₹5,100)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setAllotTargetCandidate({
                          name: "Aman Verma",
                          rollNo: "23CSE019",
                          roomSlot: "204-A",
                        });
                        setShowAllotmentModal(true);
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Reassign
                    </button>
                    <button
                      onClick={() =>
                        alert(
                          "Downloading Official Allotment Slip for Aman Verma (23CSE019)...",
                        )
                      }
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                      title="Download Slip"
                    >
                      <i className="fa-solid fa-download text-[11px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Student 2: Rahul Kumar (Rebate Active) */}
                <tr className="hover:bg-slate-50 bg-slate-50/50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">Rahul Kumar</p>
                    <span className="text-[11px] text-slate-500 block">
                      +91 94719 33021 • rahul.k@ug.gecmunger.ac.in
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    23ECE042
                  </td>
                  <td className="py-3 px-4">ECE • 4th Sem (2023-27)</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      Room 204 • Bed B (Block A)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      TBL-BA-204-B • CHR-BA-204-B
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-bold">
                      Rebate Active (10 Days)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">
                      ₹4,260{" "}
                      <span className="text-emerald-700 text-[11px]">
                        (Rebate -₹840)
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setActiveTab("billing")}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 cursor-pointer"
                    >
                      Ledger
                    </button>
                    <button
                      onClick={() =>
                        alert(
                          "Downloading Official Allotment Slip for Rahul Kumar (23ECE042)...",
                        )
                      }
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <i className="fa-solid fa-download text-[11px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Student 3: Amit Patel */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">Amit Patel</p>
                    <span className="text-[11px] text-slate-500 block">
                      +91 97120 44921 • amit.p@ug.gecmunger.ac.in
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    23ME044
                  </td>
                  <td className="py-3 px-4">Mechanical • 4th Sem</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      Room 201 • Bed B (Block A)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      TBL-BA-201-B • CHR-BA-201-B
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      Active / Present
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-700">
                      Paid (₹5,100)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setAllotTargetCandidate({
                          name: "Amit Patel",
                          rollNo: "23ME044",
                          roomSlot: "201-B",
                        });
                        setShowAllotmentModal(true);
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Reassign
                    </button>
                    <button
                      onClick={() => alert("Downloading Allotment Slip...")}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <i className="fa-solid fa-download text-[11px]"></i>
                    </button>
                  </td>
                </tr>

                {/* Student 4: Vikash Singh */}
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">
                      Vikash Singh (Hostel Prefect)
                    </p>
                    <span className="text-[11px] text-slate-500 block">
                      +91 99312 88471 • vikash.s@ug.gecmunger.ac.in
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    22CE015
                  </td>
                  <td className="py-3 px-4">Civil • 6th Sem (2022-26)</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      Room 208 • Single (Block A)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      TBL-BA-208-A • ALM-BA-208-A
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      Duty Exemption
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-700">
                      Paid (Prefect Grant)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        alert(
                          "Prefect Dossier: Clean record, authorized for gate curfew exemption.",
                        )
                      }
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer font-semibold"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>

                {/* Student 5: Rajesh Ranjan (Disciplinary Notice) */}
                <tr className="hover:bg-slate-50 bg-red-50/20">
                  <td className="py-3 px-4">
                    <p className="font-bold text-red-800">Rajesh Ranjan</p>
                    <span className="text-[11px] text-slate-500 block">
                      +91 91223 99401 • rajesh.r@ug.gecmunger.ac.in
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-red-800">
                    23ME089
                  </td>
                  <td className="py-3 px-4">Mechanical • 4th Sem</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">
                      Room 112 • Bed A (Block A)
                    </span>
                    <span className="font-mono text-[11px] text-red-700 font-semibold">
                      Disciplinary Hold
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold">
                      Late Curfew Breach
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-red-700">
                      Fine ₹500 Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        alert(
                          "Issuing formal disciplinary show-cause notice to Rajesh Ranjan (ME)...",
                        )
                      }
                      className="px-2.5 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 cursor-pointer"
                    >
                      Notice
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

