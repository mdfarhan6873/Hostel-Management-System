// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export function StateIndicatorBanner(props: any) {
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
      <div className="mt-4">
        {isAllotted ? (
          <div className="border border-emerald-200 bg-emerald-50/70 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white">
                ALLOTTED (आबंटित)
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Official Campus Hostel Allotment Active
                </p>
                <p className="text-[11px] text-slate-600">
                  {student?.hostelId?.name || "Boys Hostel Category"} (Haveli
                  Kharagpur Permanent Campus) • Allotment Term: Spring 2026
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-900 self-start sm:self-auto">
              Allocation ID:{" "}
              <span className="text-slate-900">
                {student?.messCardNo ||
                  `HST-MGR-2026-B${student?.roomId?.roomNumber || "204"}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="border border-amber-300 bg-amber-50/80 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-amber-600 text-white">
                WAITING FOR ALLOTMENT (प्रतीक्षारत)
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Application Verified &amp; Queued for Room Allocation
                </p>
                <p className="text-[11px] text-slate-700">
                  Boys Hostel Waiting Pool • Application ID: APP-2026-B-089
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-amber-950 self-start sm:self-auto bg-amber-100/70 px-2.5 py-1 border border-amber-300 rounded">
              Current Queue Rank: #{queuePosition}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

