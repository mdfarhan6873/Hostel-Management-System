// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export function StudentFooter(props: any) {
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
      <footer className="w-full border-t border-slate-300 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 rounded border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Account Settings & Preferences"
            >
              <svg
                className="w-5 h-5 text-slate-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                Hostel Desk Portal
              </span>{" "}
              • Haveli Kharagpur, Munger, Bihar 811211
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>
              Emergency Contact:{" "}
              <span className="font-mono font-medium text-slate-800">
                +91 94312 34567
              </span>{" "}
              (Hostel Warden)
            </span>
            <span className="text-slate-300">|</span>
            <span>© 2026 GEC Munger HMS</span>
          </div>
        </div>
      </footer>
    </>
  );
}

