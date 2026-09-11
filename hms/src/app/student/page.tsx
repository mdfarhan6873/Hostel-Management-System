"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StudentPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<{ status: string; message: string } | null>(null);

  // Student Data
  const [student, setStudent] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Leave Form
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    handwrittenApplicationUrl: "",
  });

  // Selected Bill Receipt Modal
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<any>(null);

  // Toast
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const data = await res.json();

      if (res.status === 403) {
        setAccessError({
          status: data.status || "WAITING",
          message:
            data.message ||
            "Access to the Student Self-Service Portal is strictly restricted to actively ALLOTTED residents.",
        });
        return;
      }

      if (!res.ok || !data.success) {
        router.push("/");
        return;
      }

      setStudent(data.student);
      setBills(data.bills || []);
      setLeaves(data.leaves || []);
      setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error connecting to student services");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Payment Handler
  const handlePayBill = async (billId: string) => {
    try {
      const res = await fetch("/api/student/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, paymentMethod: "UPI FastPay / BharatQR" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      showToast("success", "Payment verified! Official institutional receipt issued.");
      fetchStudentData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Submit Leave Request
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/student/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Leave application failed");

      showToast("success", "Leave application submitted with handwritten application link!");
      setShowLeaveModal(false);
      setLeaveForm({ startDate: "", endDate: "", reason: "", handwrittenApplicationUrl: "" });
      fetchStudentData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-emerald-400 font-medium tracking-wide">
          Verifying Student Residential Credentials...
        </p>
      </div>
    );
  }

  // Access Restricted Screen for Unallotted / Waiting / Evicted students
  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-bold">
            ⚠
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                accessError.status === "WAITING"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              Application Status: {accessError.status}
            </span>
            <h2 className="text-xl font-bold text-white mt-3">Portal Access Restricted</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-left">
            {accessError.message}
          </p>
          <div className="text-xs text-slate-500">
            For inquiry or status verification, please contact the Chief Warden Office, Government Engineering College, Munger.
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Return to Landing Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md text-sm font-semibold flex items-center gap-3 border transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-200"
              : "bg-red-950/90 border-red-500/60 text-red-200"
          }`}
        >
          <span>{notification.type === "success" ? "✓" : "⚠"}</span>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/10 p-1 flex items-center justify-center border border-emerald-500/30 shadow-inner">
              <Image
                src="/munger.png"
                alt="GEC Munger Emblem"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Resident Student Portal
                </span>
                <span className="text-xs text-slate-400 font-mono">GEC Munger</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Government Engineering College, Munger
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{student?.fullName}</span>
              <span className="text-xs text-emerald-400 font-mono">Roll: {student?.rollNo}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 transition shadow-sm flex items-center gap-1.5"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* SECTION 1: OFFICIAL INSTITUTIONAL RESIDENCY ID CARD */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Title & Institutional Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md text-2xs font-extrabold uppercase bg-emerald-500 text-slate-950">
                  VERIFIED RESIDENT
                </span>
                <span className="text-xs text-slate-400 font-mono">Session: {student?.session}</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Hostel Residency & Asset Card</h2>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 block text-3xs uppercase">MESS CARD NO</span>
                <span className="text-emerald-400 font-bold">{student?.messCardNo || "MESS-2026-081"}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 block text-3xs uppercase">REGISTRATION NO</span>
                <span className="text-white font-bold">{student?.registrationNo}</span>
              </div>
            </div>
          </div>

          {/* Student & Room Allocation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            {/* Personal & Academic Info */}
            <div className="space-y-3 text-xs">
              <div className="text-slate-400 font-semibold uppercase tracking-wider">Resident Details</div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div>
                  <span className="text-slate-400 block text-2xs">FULL NAME</span>
                  <span className="text-white font-bold text-sm">{student?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs">BRANCH & DISCIPLINE</span>
                  <span className="text-slate-200 font-medium">{student?.branch}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <div>
                    <span className="text-slate-400 block text-2xs">ROLL NUMBER</span>
                    <span className="text-emerald-400 font-bold">{student?.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">BLOOD GROUP</span>
                    <span className="text-rose-400 font-bold">{student?.bloodGroup || "O+"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs">PERMANENT ADDRESS</span>
                  <span className="text-slate-300 text-2xs">{student?.completeAddress}</span>
                </div>
              </div>
            </div>

            {/* Room Location Info */}
            <div className="space-y-3 text-xs">
              <div className="text-slate-400 font-semibold uppercase tracking-wider">Residential Location</div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-2xs">HOSTEL COMPLEX</span>
                    <span className="text-white font-bold">{student?.hostelId?.name || "Boys Hostel"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-2xs">BLOCK WING</span>
                    <span className="text-slate-200 font-bold">{student?.blockId?.name || "Block A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-400 block text-2xs">FLOOR</span>
                    <span className="text-slate-300">
                      {student?.floorId?.name || "Ground Floor"} ({student?.floorId?.floorNumber ?? 0})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-2xs">ROOM NUMBER</span>
                    <span className="text-emerald-400 font-bold text-base">
                      Room {student?.roomId?.roomNumber || "101"}
                    </span>
                  </div>
                </div>

                <div className="text-2xs text-slate-400 italic pt-1">
                  Furniture Allotment Group: <b className="text-slate-200">{student?.furnitureGroupName}</b>
                </div>
              </div>
            </div>

            {/* Unique Furniture Asset IDs per PRD */}
            <div className="space-y-3 text-xs">
              <div className="text-slate-400 font-semibold uppercase tracking-wider">
                Assigned Furniture Asset IDs
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 text-3xs font-bold block uppercase">ASSIGNED BED ID</span>
                    <span className="font-mono text-white font-extrabold text-sm">
                      {student?.assignedBedId || "BED-BA-101-A"}
                    </span>
                  </div>
                  <span className="text-lg">🛏️</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-3xs font-bold block uppercase">STUDY TABLE ID</span>
                    <span className="font-mono text-slate-200 font-bold text-xs">
                      {student?.assignedTableId || "TAB-BA-101-A"}
                    </span>
                  </div>
                  <span className="text-lg">🪵</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-3xs font-bold block uppercase">CHAIR ASSET ID</span>
                    <span className="font-mono text-slate-200 font-bold text-xs">
                      {student?.assignedChairId || "CHR-BA-101-A"}
                    </span>
                  </div>
                  <span className="text-lg">🪑</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: HOSTEL & MESS BILLING LEDGER */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white">Fee & Mess Billing Ledger</h3>
              <p className="text-xs text-slate-400 mt-1">
                View your monthly or custom period bills, check leave-based rebate deductions, and pay online.
              </p>
            </div>

            {stats?.totalPendingDues > 0 ? (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                <span className="text-amber-400 text-sm">⚠</span>
                <div>
                  <span className="text-3xs text-amber-400 font-bold block uppercase">TOTAL PENDING DUES</span>
                  <span className="text-lg font-mono font-extrabold text-white">
                    ₹{stats.totalPendingDues}
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
                <span className="text-emerald-400 text-sm">✔</span>
                <span className="text-xs font-bold text-emerald-400">All Dues Cleared</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Bill Details</th>
                  <th className="px-5 py-3.5">Billing Period</th>
                  <th className="px-5 py-3.5">Base Fee</th>
                  <th className="px-5 py-3.5">Leave Rebate Credit</th>
                  <th className="px-5 py-3.5">Net Payable</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action / Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bills.length > 0 ? (
                  bills.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{b.title}</div>
                        <span className="text-2xs uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {b.billType}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                        {b.billingPeriod}
                      </td>
                      <td className="px-5 py-4 font-mono">₹{b.baseAmount}</td>
                      <td className="px-5 py-4 font-mono text-amber-400">
                        {b.rebateAmount > 0 ? (
                          <span>-₹{b.rebateAmount} ({b.leaveDaysRebate} days leave)</span>
                        ) : (
                          <span className="text-slate-500">₹0</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                        ₹{b.netAmount}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(b.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider ${
                            b.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {b.status === "PENDING" ? (
                          <button
                            onClick={() => handlePayBill(b._id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition text-xs"
                          >
                            Pay ₹{b.netAmount} Online
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedReceiptBill(b)}
                            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-300 rounded-xl transition text-xs font-mono font-semibold"
                          >
                            📄 Receipt: {b.receiptNumber || "REC-PAID"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-500 italic">
                      No bills issued for your residency ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: LEAVE APPLICATION & MESS REBATE */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white">Leave Application & Mess Rebate Credit</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apply for residential leave with dates, reason, and your handwritten application document to claim mess rebate.
              </p>
            </div>

            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2"
            >
              <span>+</span> Apply for Residential Leave
            </button>
          </div>

          {/* Leave History Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-white">
                        {new Date(leave.startDate).toLocaleDateString()} to{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider ${
                          leave.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : leave.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : "bg-red-500/20 text-red-400 border border-red-500/40"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-2">
                      <div className="flex justify-between font-mono text-2xs text-slate-400">
                        <span>Sanctioned Duration:</span>
                        <span className="text-emerald-400 font-bold">{leave.daysCount} Days</span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 italic text-2xs">
                        "{leave.reason}"
                      </div>

                      {/* Handwritten Application link */}
                      {leave.handwrittenApplicationUrl && (
                        <div className="pt-1">
                          <a
                            href={leave.handwrittenApplicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
                          >
                            📄 View Attached Handwritten Application
                          </a>
                        </div>
                      )}

                      {leave.status === "APPROVED" && (
                        <div className="text-2xs text-emerald-400 font-semibold">
                          ✔ Verified for mess fee rebate deduction on subsequent billing cycle.
                        </div>
                      )}

                      {leave.status === "REJECTED" && leave.rejectionReason && (
                        <div className="text-2xs text-red-400 font-semibold">
                          Rejection Reason: {leave.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-3xs text-slate-500 flex justify-between font-mono">
                    <span>Applied on: {new Date(leave.createdAt).toLocaleDateString()}</span>
                    <span>Reviewer: {leave.reviewedBy?.name || "Warden Office"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-slate-500 text-xs italic">
                No leave applications recorded. Click "+ Apply for Residential Leave" to submit.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: APPLY FOR RESIDENTIAL LEAVE */}
      {/* ========================================================================= */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Apply for Residential Leave</h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit your absence schedule along with your handwritten application document for mess rebate sanction.
            </p>

            <form onSubmit={handleApplyLeave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the purpose of leave (family function, medical, semester break)..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Handwritten Application link input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Handwritten Application Document (URL / Drive Link)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or image link of your signed letter"
                  value={leaveForm.handwrittenApplicationUrl}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, handwrittenApplicationUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-3xs text-slate-500 mt-1 block">
                  Attach a link or scan of your handwritten letter with parental countersignature.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL INSTITUTIONAL RECEIPT */}
      {/* ========================================================================= */}
      {selectedReceiptBill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl animate-scaleUp">
            {/* Header with seal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Image
                  src="/munger.png"
                  alt="GEC Munger Emblem"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Government Engineering College, Munger</h4>
                  <p className="text-2xs text-emerald-400 font-mono">Hostel Management & Mess Administration</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-2xs font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PAID RECEIPT
              </span>
            </div>

            {/* Receipt Details */}
            <div className="py-6 space-y-4 text-xs">
              <div className="flex justify-between font-mono pb-2 border-b border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-3xs">RECEIPT NUMBER</span>
                  <span className="text-emerald-400 font-bold">{selectedReceiptBill.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-3xs">PAYMENT DATE</span>
                  <span className="text-slate-200">
                    {new Date(selectedReceiptBill.paidAt || selectedReceiptBill.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-3xs">STUDENT NAME</span>
                  <span className="text-white font-bold">{student?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-3xs">ROLL NUMBER</span>
                  <span className="text-slate-200 font-mono">{student?.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-3xs">ASSIGNED BED ID</span>
                  <span className="text-emerald-300 font-mono">{student?.assignedBedId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-3xs">BILLING PERIOD</span>
                  <span className="text-slate-200 font-mono font-bold">{selectedReceiptBill.billingPeriod}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>Base Amount:</span>
                  <span className="font-mono">₹{selectedReceiptBill.baseAmount}</span>
                </div>
                {selectedReceiptBill.rebateAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Leave Rebate Credit ({selectedReceiptBill.leaveDaysRebate} days):</span>
                    <span className="font-mono">-₹{selectedReceiptBill.rebateAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-slate-800">
                  <span>Net Settled Amount:</span>
                  <span className="text-emerald-400 font-mono">₹{selectedReceiptBill.netAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono text-3xs pt-1">
                  <span>Transaction ID: {selectedReceiptBill.transactionId || "UPI/Settled"}</span>
                  <span>Payment Mode: {selectedReceiptBill.paymentMethod || "Online UPI"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReceiptBill(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
              >
                🖨️ Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
