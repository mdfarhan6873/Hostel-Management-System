// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export function StudentHeader(props: any) {
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
      <header className="w-full border-b border-slate-300 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Institutional Branding Block */}
          <div className="flex items-center gap-3.5 min-w-0">
            <Image
              src="/munger.png"
              alt="GEC Munger Emblem Logo"
              width={48}
              height={48}
              className="h-12 w-auto object-contain flex-shrink-0"
              priority
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none truncate">
                  Government Engineering College, Munger
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded whitespace-nowrap">
                  Affiliated to BEU Patna
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-600 font-hindi mt-0.5">
                राजकीय अभियंत्रण महाविद्यालय, मुंगेर
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 whitespace-nowrap">
                  HOSTEL MANAGEMENT SYSTEM (HMS)
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider whitespace-nowrap">
                  STUDENT PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Right: User Credentials Profile & Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                Hi, {student?.fullName || "Rahul Kumar"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">
                Student (
                {student?.branch ? student.branch.split(" ")[0] : "ECE"},{" "}
                {student?.session || "2025–29"}){" "}
                <span className="text-slate-300 mx-0.5">•</span>{" "}
                <span className="font-mono text-slate-600 font-semibold">
                  Roll: {student?.rollNo || "22105128001"}
                </span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-300 bg-slate-50 text-slate-800 font-bold flex items-center justify-center text-sm ring-1 ring-slate-200 flex-shrink-0">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="px-2.5 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

