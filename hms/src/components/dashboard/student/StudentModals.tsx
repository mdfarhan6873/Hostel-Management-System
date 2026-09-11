// @ts-nocheck
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export function StudentModals(props: any) {
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
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-md w-full max-w-md p-6 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-building-columns text-slate-800 text-sm"></i>
                <h4 className="text-sm font-bold text-slate-900">
                  Hostel Fee Payment via UPI / QR
                </h4>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-4 text-center">
              {/* SVG Mock UPI QR Code */}
              <div className="p-3 border border-slate-200 rounded inline-block bg-slate-50 mb-3">
                <svg
                  className="w-44 h-44 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 100 100"
                >
                  <rect
                    fill="#0f172a"
                    height="30"
                    width="30"
                    x="0"
                    y="0"
                  ></rect>
                  <rect
                    fill="#ffffff"
                    height="22"
                    width="22"
                    x="4"
                    y="4"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="14"
                    width="14"
                    x="8"
                    y="8"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="30"
                    width="30"
                    x="70"
                    y="0"
                  ></rect>
                  <rect
                    fill="#ffffff"
                    height="22"
                    width="22"
                    x="74"
                    y="4"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="14"
                    width="14"
                    x="78"
                    y="8"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="30"
                    width="30"
                    x="0"
                    y="70"
                  ></rect>
                  <rect
                    fill="#ffffff"
                    height="22"
                    width="22"
                    x="4"
                    y="74"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="14"
                    width="14"
                    x="8"
                    y="78"
                  ></rect>
                  <rect fill="#0f172a" height="6" width="6" x="36" y="8"></rect>
                  <rect
                    fill="#0f172a"
                    height="6"
                    width="10"
                    x="48"
                    y="8"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="6"
                    width="18"
                    x="40"
                    y="20"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="18"
                    width="6"
                    x="8"
                    y="40"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="12"
                    width="8"
                    x="20"
                    y="44"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="28"
                    width="28"
                    x="36"
                    y="36"
                  ></rect>
                  <rect
                    fill="#ffffff"
                    height="16"
                    width="16"
                    x="42"
                    y="42"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="8"
                    width="8"
                    x="46"
                    y="46"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="8"
                    width="8"
                    x="72"
                    y="38"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="6"
                    width="10"
                    x="84"
                    y="42"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="6"
                    width="14"
                    x="72"
                    y="56"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="10"
                    width="10"
                    x="38"
                    y="72"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="16"
                    width="8"
                    x="54"
                    y="76"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="6"
                    width="18"
                    x="72"
                    y="72"
                  ></rect>
                  <rect
                    fill="#0f172a"
                    height="10"
                    width="10"
                    x="80"
                    y="84"
                  ></rect>
                </svg>
              </div>

              <p className="text-xs font-semibold text-slate-800">
                Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM)
              </p>
              <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                <span>UPI VPA:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  hosteladmin@sbi
                </span>
              </div>

              <div className="mt-3 border border-slate-200 bg-slate-50 p-2.5 rounded text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-medium text-slate-800">
                    {student?.fullName} ({student?.rollNo})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono text-slate-800">
                    {targetPayBill?.title ||
                      "Autumn 2026 Mess Charges (Jul–Nov)"}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200 text-slate-900">
                  <span>Payable Amount:</span>
                  <span className="text-emerald-700">
                    ₹{targetPayBill?.netAmount || "14,500.00"}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-left">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Enter 12-Digit Bank UTR / Transaction ID after payment:
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. 408129581923"
                  className="w-full text-xs font-mono rounded border border-slate-300 py-1.5 px-2.5 focus:border-slate-800 focus:ring-0"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition cursor-pointer"
              >
                Verify &amp; Submit UTR
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-md w-full max-w-lg p-6 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Image
                  src="/munger.png"
                  alt="GEC Munger Emblem"
                  width={32}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Government Engineering College, Munger
                  </h4>
                  <p className="text-[10px] text-slate-500 font-hindi">
                    राजकीय अभियंत्रण महाविद्यालय, मुंगेर • e-Receipt
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-4 border border-slate-200 rounded p-4 text-xs space-y-3 bg-white">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Receipt Serial No.
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedReceipt.receiptNumber ||
                      `HMS-BL-2026-0${selectedReceipt._id?.slice(-2) || "03"}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Date Generated
                  </span>
                  <span className="font-medium text-slate-700">
                    {new Date(
                      selectedReceipt.paidAt || Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    Student Name
                  </span>
                  <strong className="text-slate-900">
                    {student?.fullName}
                  </strong>{" "}
                  ({student?.branch?.split(" ")[0] || "ECE"}{" "}
                  {student?.session || "2025–29"})
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    Roll / Registration
                  </span>
                  <strong className="text-slate-900 font-mono">
                    {student?.rollNo} /{" "}
                    {student?.registrationNo || "22105128001"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    Room Coordinates
                  </span>
                  <span className="text-slate-800">
                    {student?.hostelId?.name || "Boys Hostel"},{" "}
                    {student?.blockId?.name || "Block A"}, Room{" "}
                    {student?.roomId?.roomNumber || "101"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    Payment Mode &amp; UTR
                  </span>
                  <span className="font-mono text-slate-800">
                    {selectedReceipt.paymentMethod || "UPI"} (UTR:{" "}
                    {selectedReceipt.transactionId || "408129581923"})
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <div className="flex justify-between py-1">
                  <span className="text-slate-700 font-medium">
                    {selectedReceipt.title}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{selectedReceipt.netAmount?.toLocaleString()}.00
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Payment Officially Reconciled &amp; Audited</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-900">
                  AC-REC-OK
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-download text-[10px]"></i>
                <span>Download / Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-md w-full max-w-md p-6 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">
                Portal Settings &amp; Preferences
              </h4>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SMS Alert Notification Phone
                </label>
                <input
                  type="text"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 font-mono py-1.5 px-2.5 focus:border-slate-800 focus:ring-0"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Hostel mess bills &amp; gate logs are transmitted to this
                  number.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Language Preference
                </label>
                <select
                  value={settingsLang}
                  onChange={(e) => setSettingsLang(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 py-1.5 px-2.5 focus:border-slate-800 focus:ring-0 bg-white"
                >
                  <option value="English (Primary)">English (Primary)</option>
                  <option value="हिन्दी (Hindi)">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-[11px] font-semibold text-slate-700 mb-2">
                  Hostel Jurisdiction &amp; Status
                </p>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">
                      {student?.hostelId?.name || "Boys Hostel"} •{" "}
                      {student?.blockId?.name || "Block A"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Warden: {wardenInfo?.name || "Prof. R. K. Singh"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isAllotted
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-amber-800 bg-amber-50 border-amber-300"
                    }`}
                  >
                    {isAllotted ? "Allotted" : "Waiting"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast("success", "Preferences saved successfully.");
                  setShowSettingsModal(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


