// @ts-nocheck
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export function StudentProfileTab(props: any) {
  const {
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    loading,
    setLoading,
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
    currentTab,
    setCurrentTab,
    studentData,
    setStudentData,
    admissionStatus,
    setAdmissionStatus,
    admissionFormState,
    setAdmissionFormState,
    leaveFormState,
    setLeaveFormState,
    isSubmittingLeave,
    setIsSubmittingLeave,
    showPaymentModal,
    setShowPaymentModal,
    activePayment,
    setActivePayment,
    showReceiptModal,
    setShowReceiptModal,
    selectedReceipt,
    setSelectedReceipt,
    showSettingsModal,
    setShowSettingsModal,
    handleLogout,
    handleAdmissionSubmit,
    handleLeaveSubmit,
    handleInitiatePayment,
    handleVerifyPayment,
    handleDownloadReceipt,
    handleDownloadPDF,
    isAllotted,
    isWaiting,
    isCancelled,
    activeLeave,
    handleSaveProfileChanges,
  } = props;

  return (
    <>
      <div className="mt-4 flex-1 space-y-6 animate-fadeIn">
        {/* Allotment / Waiting Room State Section */}
        {isAllotted ? (
          <section className="border border-slate-200 rounded-md bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Room &amp; Furniture Asset Allotment
                </h2>
                <p className="text-xs text-slate-500">
                  Physical accommodation coordinates and assigned individual
                  inventory items
                </p>
              </div>
              <div className="text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-700">
                Warden:{" "}
                <span className="font-bold text-slate-900">
                  {wardenInfo?.name || "Prof. R. K. Singh"}
                </span>{" "}
                ({wardenInfo?.mobile || "+91 94312 34567"})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Hostel &amp; Wing
                </span>
                <p className="font-bold text-slate-900">
                  {student?.hostelId?.name || "Boys Hostel"} (बालक छात्रावास)
                </p>
                <p className="text-slate-600 mt-0.5">
                  {student?.blockId?.name || "Block A (Aryabhata Bhavan)"}
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Floor &amp; Room Number
                </span>
                <p className="font-bold text-slate-900">
                  Room {student?.roomId?.roomNumber || "101"} (
                  {student?.floorId?.name || "Ground Floor"})
                </p>
                <p className="text-slate-600 mt-0.5">
                  {student?.roomId?.roomType || "Double"} Occupancy (
                  {student?.roomId?.capacity || 2} Persons)
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Assigned Roommate
                </span>
                <p className="font-bold text-slate-900">
                  {roommate?.name || "Rahul Kumar Singh"}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {roommate?.branch || "ECE"} ({roommate?.session || "2025-29"})
                  • {roommate?.groupName || "Group B"}
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Supervising Warden
                </span>
                <p className="font-bold text-slate-900">
                  {wardenInfo?.name || "Prof. R. K. Singh"}
                </p>
                <p className="text-slate-600 mt-0.5">
                  Associate Professor, Mechanical
                </p>
              </div>
            </div>

            {/* Assigned Physical Assets */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  Assigned Physical Assets —{" "}
                  {student?.furnitureGroupName || "Furniture Group A"}{" "}
                  (Individually Tagged)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Asset Verification Complete
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 border border-slate-200 rounded bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Bed Unit A
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Solid Oak Bed Frame
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800">
                    {student?.assignedBedId || "BED-BA-101-A"}
                  </span>
                </div>

                <div className="p-2.5 border border-slate-200 rounded bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Study Table A
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard Study Desk
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800">
                    {student?.assignedTableId || "TAB-BA-101-A"}
                  </span>
                </div>

                <div className="p-2.5 border border-slate-200 rounded bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Study Chair A
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Ergonomic Study Chair
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800">
                    {student?.assignedChairId || "CHR-BA-101-A"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="border border-slate-200 rounded-md bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Hostel Waiting Pool &amp; Clearance Protocol
                </h2>
                <p className="text-xs text-slate-500">
                  Official allotment queue managed strictly by distance &amp;
                  merit criteria
                </p>
              </div>
              <div className="text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-700">
                Verification Officer:{" "}
                <span className="font-bold text-slate-900">
                  Prof. R. K. Singh
                </span>{" "}
                (Warden)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Queue Position
                </span>
                <p className="text-base font-bold text-amber-700">
                  #{queuePosition} in Verified Pool
                </p>
                <p className="text-slate-600 mt-0.5">
                  Boys Hostel (Block A &amp; B)
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Verification Status
                </span>
                <p className="font-bold text-slate-900">
                  Completed &amp; Approved
                </p>
                <p className="text-slate-600 mt-0.5">
                  Verified by Chief Warden
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Fee Obligation
                </span>
                <p className="font-bold text-slate-900">
                  No Advance Seat Fee Required
                </p>
                <p className="text-slate-600 mt-0.5">
                  Rent bill generated upon bed grant
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 border border-slate-200 bg-slate-50 rounded text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-semibold block mb-1">
                Notice from the Warden Office:
              </strong>
              Your hostel admission documents have been physically checked and
              marked valid. You are currently positioned at rank #
              {queuePosition}. Physical room allocation will proceed as final
              year students conclude exit formalities.
            </div>
          </section>
        )}

        {/* Student Particulars 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Profile Card */}
          <section className="border border-slate-200 rounded-md bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                  Academic Information
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Verified
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">College Roll No</dt>
                  <dd className="font-mono font-semibold text-slate-800">
                    {student?.rollNo || "22105128001"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">BEU Registration No</dt>
                  <dd className="font-mono font-semibold text-slate-800">
                    {student?.registrationNo || "22105128001/GEC"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Department</dt>
                  <dd className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
                    {student?.branch || "Computer Science & Engg"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Academic Session</dt>
                  <dd className="font-semibold text-slate-800">
                    {student?.session || "2025 - 2029"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Current Semester</dt>
                  <dd className="font-semibold text-slate-800">4th Semester</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-500">Hostel Mess ID</dt>
                  <dd className="font-mono font-semibold text-sky-800">
                    {student?.messCardNo || "MESS-2026-081"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
              Records synchronised with GEC Munger Academic Section.
            </div>
          </section>

          {/* Personal Particulars Card */}
          <section className="border border-slate-200 rounded-md bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Personal Particulars
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Student
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Full Legal Name</dt>
                  <dd className="font-semibold text-slate-800">
                    {student?.fullName}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Institutional Email</dt>
                  <dd
                    className="font-mono text-slate-800 truncate max-w-[170px]"
                    title={student?.email}
                  >
                    {student?.email}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Primary Contact</dt>
                  <dd className="font-mono font-medium text-slate-800">
                    {student?.mobile}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Blood Group</dt>
                  <dd className="font-bold text-rose-700">
                    {student?.bloodGroup || "O+"} (Positive)
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Gender / Category</dt>
                  <dd className="font-medium text-slate-800">General (EWS)</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-500">Aadhaar Status</dt>
                  <dd className="font-semibold text-emerald-700">
                    Verified (UIDAI)
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Emergency Medical Contact on file with Campus Dispensary.
            </div>
          </section>

          {/* Guardian & Domicile Card */}
          <section className="border border-slate-200 rounded-md bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Guardian &amp; Domicile
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Registered
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Father's Name</dt>
                  <dd className="font-semibold text-slate-800">
                    {student?.parents?.fatherName || "Mr. Rajesh Kumar"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Mother's Name</dt>
                  <dd className="font-semibold text-slate-800">
                    {student?.parents?.motherName || "Mrs. Sunita Devi"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Parent Helpline</dt>
                  <dd className="font-mono font-medium text-slate-800">
                    {student?.parents?.parentMobile || "+91 98765 11223"}
                  </dd>
                </div>
                <div className="py-1 border-b border-slate-100">
                  <dt className="text-slate-500 mb-0.5">
                    Permanent Residential Address
                  </dt>
                  <dd className="text-slate-800 font-normal leading-relaxed text-[11px]">
                    {student?.completeAddress ||
                      "Vill - Bariarpur, Post - Bariarpur, Dist - Munger, Bihar - 811211"}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-500">Distance from Campus</dt>
                  <dd className="font-semibold text-slate-800">~24.5 km</dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Official communications are delivered to parent SMS helpline.
            </div>
          </section>
        </div>
      </div>
    </>
  );
}


