// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export function StudentBillsTab(props: any) {
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
        {/* 1. Billing Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Current Outstanding */}
          <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Outstanding
              </span>
              {totalOutstanding === 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <i className="fa-solid fa-circle-check text-[10px]"></i>{" "}
                  Cleared
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                  <i className="fa-solid fa-clock text-[10px]"></i> Due
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-mono font-bold text-slate-900">
                ₹{totalOutstanding}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {totalOutstanding === 0
                  ? "No overdue bills for Spring 2026"
                  : `${pendingBillsList.length} invoice(s) awaiting payment`}
              </p>
            </div>
          </div>

          {/* Metric 2: Total Fees Paid this Session */}
          <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Paid (Session)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                2025–26
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-mono font-bold text-slate-900">
                ₹{totalPaid.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rent + Mess Diet Fee + Deposit
              </p>
            </div>
          </div>

          {/* Metric 3: Total Mess Rebate Saved */}
          <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Mess Rebate Saved
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                70% Rule Applied
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-mono font-bold text-emerald-700">
                -₹{totalRebate.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Approved leave mess rebate deduction
              </p>
            </div>
          </div>

          {/* Metric 4: Caution Money */}
          <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Hostel Caution Money
              </span>
              <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                Refundable
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-mono font-bold text-slate-900">
                ₹5,000
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Held in college account (No dues pending)
              </p>
            </div>
          </div>
        </div>

        {/* 2. Upcoming Cycle / Pending Invoices Section */}
        {pendingBillsList.length > 0 ? (
          pendingBillsList.map((pendingBill) => (
            <section
              key={pendingBill._id}
              className="border border-slate-200 rounded-md bg-white p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    {pendingBill.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Billing Period: {pendingBill.billingPeriod} • Hostels
                    Office, Haveli Kharagpur Campus
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-900 border border-sky-300 rounded self-start sm:self-auto">
                  Due Date: {new Date(pendingBill.dueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 p-4 border border-slate-200 rounded-md bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {pendingBill._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded">
                      Invoice Pending
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {pendingBill.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Base Amount: ₹{pendingBill.baseAmount}{" "}
                    {pendingBill.rebateAmount > 0 &&
                      `• Leave Rebate Credit: -₹${pendingBill.rebateAmount}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto">
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Payable
                    </span>
                    <span className="font-mono text-lg font-bold text-slate-900">
                      ₹{pendingBill.netAmount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetPayBill(pendingBill);
                        setShowPaymentModal(true);
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-qrcode text-xs"></i>
                      <span>Pay via UPI QR</span>
                    </button>
                    <button
                      onClick={() =>
                        alert(
                          `Invoice Breakdown:\n• Title: ${pendingBill.title}\n• Period: ${pendingBill.billingPeriod}\n• Base Amount: ₹${pendingBill.baseAmount}\n• Rebate Deduction: -₹${pendingBill.rebateAmount}\n• Net Payable: ₹${pendingBill.netAmount}`,
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 hover:bg-white text-slate-700 transition cursor-pointer"
                    >
                      Breakdown
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ))
        ) : (
          <section className="border border-slate-200 rounded-md bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  Upcoming Allotment &amp; Mess Billing Cycle
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Advance invoice for Autumn 2026 term • Hostels Office, Haveli
                  Kharagpur Campus
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-900 border border-sky-300 rounded self-start sm:self-auto">
                Upcoming Due Date: 15 July 2026
              </span>
            </div>

            <div className="mt-4 p-4 border border-slate-200 rounded-md bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    HMS-ADV-2026-AUT
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded">
                    Invoice Generated
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Autumn 2026 Mess Charges (Jul–Nov) &amp; Hostel Maintenance
                  Fee
                </p>
                <p className="text-[11px] text-slate-500">
                  Base Mess Rate: ₹180/day × 70 billing days (₹12,600) +
                  Amenities &amp; Electricity (₹1,900)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto">
                <div className="text-right sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Payable
                  </span>
                  <span className="font-mono text-lg font-bold text-slate-900">
                    ₹14,500
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTargetPayBill(null);
                      setShowPaymentModal(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-qrcode text-xs"></i>
                    <span>Pay via UPI QR</span>
                  </button>
                  <button
                    onClick={() =>
                      alert(
                        "Cycle Breakdown:\n• Mess Food Charge: ₹12,600\n• Room Electricity: ₹1,200\n• Water & RO Filter: ₹400\n• Wi-Fi & Maintenance: ₹300\nTotal: ₹14,500",
                      )
                    }
                    className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 hover:bg-white text-slate-700 transition cursor-pointer"
                  >
                    Breakdown
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Mess Rebate Leave Deduction Engine Card */}
        <section className="border border-slate-200 rounded-md bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Approved Leave Mess Rebate Ledger (PRD §3.5)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated deduction rule applied when continuous sanctioned
                hostel absence ≥ 5 days
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
              Total Saved: ₹{totalRebate.toLocaleString()}
            </span>
          </div>

          <div className="mt-4 border border-slate-200 rounded-md overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-900">
                  Application #LVE-2026-081: Holi Festival &amp; Academic Recess
                </span>
                <span className="block text-[11px] text-slate-500">
                  Leave Duration: 23 Mar 2026 to 01 Apr 2026 (10 Days
                  Sanctioned)
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                Deduction Processed
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-white">
              <div className="p-2.5 border border-slate-200 rounded">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Sanctioned Absence
                </span>
                <p className="font-bold text-slate-900">10 Days Continuous</p>
                <p className="text-[10px] text-slate-500">
                  Threshold: ≥ 5 days met
                </p>
              </div>
              <div className="p-2.5 border border-slate-200 rounded">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Standard Mess Rate
                </span>
                <p className="font-mono font-bold text-slate-900">
                  ₹180.00 / day
                </p>
                <p className="text-[10px] text-slate-500">
                  Gross = 10 × ₹180 = ₹1,800
                </p>
              </div>
              <div className="p-2.5 border border-slate-200 rounded">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Institutional Rebate (70%)
                </span>
                <p className="font-mono font-bold text-emerald-700">
                  - ₹1,260.00
                </p>
                <p className="text-[10px] text-slate-500">
                  30% establishment retained
                </p>
              </div>
              <div className="p-2.5 border border-slate-200 rounded">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Warden Approval
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {wardenInfo?.name || "Prof. R. K. Singh"}
                </p>
                <p className="text-[10px] text-slate-500">
                  Signed &amp; Approved
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border-t border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <i className="fa-solid fa-circle-info text-emerald-700 mt-0.5"></i>
              <div>
                <strong className="font-semibold text-emerald-900">
                  Direct Bill Reconciliation:
                </strong>{" "}
                The ₹1,260 mess rebate was deducted automatically from Spring
                2026 Mess Charges (Bill #HMS-BL-2026-03).
              </div>
            </div>
          </div>
        </section>

        {/* 4. Payment History & Official Receipts Table */}
        <section className="border border-slate-200 rounded-md bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                Payment History &amp; Official Receipts (PRD §3.5)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete audited record of transactions reconciled by GEC Munger
                Finance Section
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>
                Showing {bills.length > 0 ? bills.length : 3} Transactions
              </span>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">Bill ID</th>
                  <th className="py-2.5 px-3 font-semibold">
                    Description / Particulars
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Gross</th>
                  <th className="py-2.5 px-3 font-semibold">Rebate</th>
                  <th className="py-2.5 px-3 font-semibold">Net Paid</th>
                  <th className="py-2.5 px-3 font-semibold">
                    Mode &amp; Gateway
                  </th>
                  <th className="py-2.5 px-3 font-semibold">
                    Transaction / UTR
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Render Real Bills from DB */}
                {bills.map((bill, index) => (
                  <tr key={bill._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-medium text-slate-900">
                      {bill.receiptNumber || `HMS-BL-2026-0${index + 1}`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {bill.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Period: {bill.billingPeriod} •{" "}
                        {bill.billType?.toUpperCase()}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      ₹{bill.baseAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                      {bill.rebateAmount > 0
                        ? `-₹${bill.rebateAmount.toLocaleString()}`
                        : "₹0"}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      ₹{bill.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                        <i className="fa-solid fa-mobile-screen-button text-[10px] text-slate-500"></i>{" "}
                        {bill.paymentMethod || "UPI (hosteladmin@sbi)"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {bill.transactionId || `40812958192${index}`}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(
                        bill.paidAt || bill.dueDate,
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {bill.status === "PAID" ? (
                        <button
                          onClick={() => openReceipt(bill)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-file-invoice text-[10px]"></i>{" "}
                          Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTargetPayBill(bill);
                            setShowPaymentModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-900 text-white hover:bg-black inline-flex items-center gap-1 cursor-pointer"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Standard Mock Fallback Rows if DB has few bills */}
                {bills.length === 0 && (
                  <>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">
                        HMS-BL-2026-03
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          Spring 2026 Mess Charges (Feb–May)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          100 Days Mess Diet Billing
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">₹18,000</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                        -₹1,260
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹16,740
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <i className="fa-solid fa-mobile-screen-button text-[10px] text-slate-500"></i>{" "}
                          UPI (hosteladmin@sbi)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        408129581923
                      </td>
                      <td className="py-3 px-3 text-slate-600">05 Feb 2026</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            openReceipt({
                              receiptNumber: "HMS-BL-2026-03",
                              title: "Spring 2026 Mess Charges",
                              netAmount: 16740,
                              paidAt: new Date("2026-02-05"),
                              transactionId: "408129581923",
                              paymentMethod: "UPI",
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-file-invoice text-[10px]"></i>{" "}
                          Receipt
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">
                        HMS-BL-2026-01
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          4th Sem Hostel Seat Rent &amp; Amenities
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Room 101, Boys Hostel Block A
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">₹5,630</td>
                      <td className="py-3 px-3 font-mono text-slate-400">₹0</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹5,630
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <i className="fa-solid fa-qrcode text-[10px] text-slate-500"></i>{" "}
                          UPI QR
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        401928374821
                      </td>
                      <td className="py-3 px-3 text-slate-600">10 Jan 2026</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            openReceipt({
                              receiptNumber: "HMS-BL-2026-01",
                              title: "4th Sem Hostel Seat Rent",
                              netAmount: 5630,
                              paidAt: new Date("2026-01-10"),
                              transactionId: "401928374821",
                              paymentMethod: "UPI QR",
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-file-invoice text-[10px]"></i>{" "}
                          Receipt
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">
                        HMS-BL-2025-CAU
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          One-Time Hostel Caution Deposit
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Security Deposit (Refundable upon exit clearance)
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">₹5,000</td>
                      <td className="py-3 px-3 font-mono text-slate-400">₹0</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹5,000
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <i className="fa-solid fa-building-columns text-[10px] text-slate-500"></i>{" "}
                          NetBanking (SBI)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        329104829104
                      </td>
                      <td className="py-3 px-3 text-slate-600">02 Aug 2025</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            openReceipt({
                              receiptNumber: "HMS-BL-2025-CAU",
                              title: "One-Time Hostel Caution Deposit",
                              netAmount: 5000,
                              paidAt: new Date("2025-08-02"),
                              transactionId: "329104829104",
                              paymentMethod: "NetBanking",
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-file-invoice text-[10px]"></i>{" "}
                          Receipt
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

