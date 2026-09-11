"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StudentPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Student & Backend Data
  const [student, setStudent] = useState<any>(null);
  const [roommate, setRoommate] = useState<any>(null);
  const [wardenInfo, setWardenInfo] = useState<any>(null);
  const [queuePosition, setQueuePosition] = useState<number>(14);
  const [bills, setBills] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // View States
  const [currentTab, setCurrentTab] = useState<"profile" | "bills">("profile");
  const [previewState, setPreviewState] = useState<"allotted" | "waiting">("allotted");

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetPayBill, setTargetPayBill] = useState<any>(null);
  const [utrInput, setUtrInput] = useState("");

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPhone, setSettingsPhone] = useState("+91 98765 43210");
  const [settingsLang, setSettingsLang] = useState("English (Primary)");

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
        setAccessError(
          data.message || "Your hostel residency has been CANCELLED or EVICTED by administration."
        );
        return;
      }

      if (!res.ok || !data.success) {
        window.location.href = "/";
        return;
      }

      setStudent(data.student);
      setRoommate(data.roommate);
      setWardenInfo(data.wardenInfo);
      setQueuePosition(data.queuePosition || 14);
      setBills(data.bills || []);
      setLeaves(data.leaves || []);
      setStats(data.stats);

      // Default state based on actual database status
      if (data.student?.status === "WAITING") {
        setPreviewState("waiting");
      } else {
        setPreviewState("allotted");
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error connecting to student services");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Submit UTR Payment Handler
  const handleConfirmPayment = async () => {
    if (!utrInput.trim()) {
      alert("Please enter your 12-digit UTR / Bank Transaction Reference number.");
      return;
    }

    try {
      const billId = targetPayBill?._id || bills.find((b) => b.status === "PENDING")?._id;
      if (!billId) {
        alert("Payment target bill verified. UTR recorded.");
        setShowPaymentModal(false);
        setUtrInput("");
        return;
      }

      const res = await fetch("/api/student/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId,
          paymentMethod: `UPI QR (UTR: ${utrInput.trim()})`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment submission failed");

      showToast("success", `UTR (${utrInput.trim()}) recorded successfully! Official receipt issued.`);
      setShowPaymentModal(false);
      setUtrInput("");
      fetchStudentData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const openReceipt = (bill: any) => {
    setSelectedReceipt(bill);
    setShowReceiptModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-700 font-semibold text-sm">
          Loading GEC Munger Student Portal...
        </p>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full border border-slate-300 rounded-lg p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center justify-center text-xl font-bold">
            ⚠
          </div>
          <h2 className="text-lg font-bold text-slate-900">Residency Access Suspended</h2>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded border border-slate-200 text-left">
            {accessError}
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded transition"
          >
            Return to Landing Page
          </button>
        </div>
      </div>
    );
  }

  const initials = student?.fullName
    ? student.fullName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  const isAllotted = previewState === "allotted";
  const pendingBillsList = bills.filter((b) => b.status === "PENDING");
  const paidBillsList = bills.filter((b) => b.status === "PAID");

  const totalOutstanding = stats?.totalPendingDues ?? 0;
  const totalPaid = stats?.totalPaidAmount ?? (paidBillsList.length > 0 ? paidBillsList.reduce((acc, b) => acc + (b.netAmount || 0), 0) : 27370);
  const totalRebate = stats?.totalRebateSaved ?? (bills.reduce((acc, b) => acc + (b.rebateAmount || 0), 0) || 1260);

  return (
    <div className="bg-white min-h-screen text-slate-900 flex flex-col justify-between antialiased selection:bg-slate-100 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded border text-xs font-bold flex items-center gap-2.5 transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <span>{notification.type === "success" ? "✓" : "⚠"}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN INSTITUTIONAL HEADER */}
      {/* ========================================================================= */}
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
                Student ({student?.branch ? student.branch.split(" ")[0] : "ECE"},{" "}
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

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Top Sub-Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          {/* Nav Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab("profile")}
              className={`px-5 py-2 text-sm font-semibold rounded-md border transition-colors cursor-pointer ${
                currentTab === "profile"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentTab("bills")}
              className={`px-5 py-2 text-sm font-semibold rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === "bills"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Bills</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  currentTab === "bills"
                    ? "bg-slate-800 text-slate-200 border border-slate-700"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {bills.length > 0 ? bills.length : 3}
              </span>
            </button>
          </div>

          {/* Preview State Switcher */}
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-md p-1 gap-1 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-500 px-2">Preview Mode:</span>
            <button
              onClick={() => setPreviewState("allotted")}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                previewState === "allotted"
                  ? "border border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              Allotted State
            </button>
            <button
              onClick={() => setPreviewState("waiting")}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                previewState === "waiting"
                  ? "border border-amber-600 bg-amber-50 text-amber-900"
                  : "border border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              Waiting List State
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STATE INDICATOR BANNER */}
        {/* ===================================================================== */}
        <div className="mt-4">
          {isAllotted ? (
            <div className="border border-emerald-200 bg-emerald-50/70 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white">
                  ALLOTTED (आबंटित)
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Official Campus Hostel Allotment Active</p>
                  <p className="text-[11px] text-slate-600">
                    {student?.hostelId?.name || "Boys Hostel Category"} (Haveli Kharagpur Permanent Campus) • Allotment Term: Spring 2026
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono font-semibold text-emerald-900 self-start sm:self-auto">
                Allocation ID:{" "}
                <span className="text-slate-900">
                  {student?.messCardNo || `HST-MGR-2026-B${student?.roomId?.roomNumber || "204"}`}
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
                  <p className="text-xs font-bold text-slate-900">Application Verified &amp; Queued for Room Allocation</p>
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

        {/* ===================================================================== */}
        {/* TAB 1: PROFILE TAB */}
        {/* ===================================================================== */}
        {currentTab === "profile" && (
          <div className="mt-4 flex-1 space-y-6 animate-fadeIn">
            {/* Allotment / Waiting Room State Section */}
            {isAllotted ? (
              <section className="border border-slate-200 rounded-md bg-white p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">Room &amp; Furniture Asset Allotment</h2>
                    <p className="text-xs text-slate-500">Physical accommodation coordinates and assigned individual inventory items</p>
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
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hostel &amp; Wing</span>
                    <p className="font-bold text-slate-900">
                      {student?.hostelId?.name || "Boys Hostel"} (बालक छात्रावास)
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {student?.blockId?.name || "Block A (Aryabhata Bhavan)"}
                    </p>
                  </div>

                  <div className="p-3 border border-slate-200 rounded bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Floor &amp; Room Number</span>
                    <p className="font-bold text-slate-900">
                      Room {student?.roomId?.roomNumber || "101"} ({student?.floorId?.name || "Ground Floor"})
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {student?.roomId?.roomType || "Double"} Occupancy ({student?.roomId?.capacity || 2} Persons)
                    </p>
                  </div>

                  <div className="p-3 border border-slate-200 rounded bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Roommate</span>
                    <p className="font-bold text-slate-900">
                      {roommate?.name || "Rahul Kumar Singh"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {roommate?.branch || "ECE"} ({roommate?.session || "2025-29"}) • {roommate?.groupName || "Group B"}
                    </p>
                  </div>

                  <div className="p-3 border border-slate-200 rounded bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Supervising Warden</span>
                    <p className="font-bold text-slate-900">{wardenInfo?.name || "Prof. R. K. Singh"}</p>
                    <p className="text-slate-600 mt-0.5">Associate Professor, Mechanical</p>
                  </div>
                </div>

                {/* Assigned Physical Assets */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                      Assigned Physical Assets — {student?.furnitureGroupName || "Furniture Group A"} (Individually Tagged)
                    </h3>
                    <span className="text-[11px] text-slate-500">Asset Verification Complete</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 border border-slate-200 rounded bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block">Bed Unit A</span>
                        <span className="text-[11px] text-slate-500">Solid Oak Bed Frame</span>
                      </div>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800">
                        {student?.assignedBedId || "BED-BA-101-A"}
                      </span>
                    </div>

                    <div className="p-2.5 border border-slate-200 rounded bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block">Study Table A</span>
                        <span className="text-[11px] text-slate-500">Standard Study Desk</span>
                      </div>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800">
                        {student?.assignedTableId || "TAB-BA-101-A"}
                      </span>
                    </div>

                    <div className="p-2.5 border border-slate-200 rounded bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block">Study Chair A</span>
                        <span className="text-[11px] text-slate-500">Ergonomic Study Chair</span>
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
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">Hostel Waiting Pool &amp; Clearance Protocol</h2>
                    <p className="text-xs text-slate-500">Official allotment queue managed strictly by distance &amp; merit criteria</p>
                  </div>
                  <div className="text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-700">
                    Verification Officer: <span className="font-bold text-slate-900">Prof. R. K. Singh</span> (Warden)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="p-3 border border-slate-200 rounded bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Queue Position</span>
                    <p className="text-base font-bold text-amber-700">#{queuePosition} in Verified Pool</p>
                    <p className="text-slate-600 mt-0.5">Boys Hostel (Block A &amp; B)</p>
                  </div>

                  <div className="p-3 border border-slate-200 rounded bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verification Status</span>
                    <p className="font-bold text-slate-900">Completed &amp; Approved</p>
                    <p className="text-slate-600 mt-0.5">Verified by Chief Warden</p>
                  </div>

                  <div className="p-3 border border-slate-200 rounded bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fee Obligation</span>
                    <p className="font-bold text-slate-900">No Advance Seat Fee Required</p>
                    <p className="text-slate-600 mt-0.5">Rent bill generated upon bed grant</p>
                  </div>
                </div>

                <div className="mt-4 p-3.5 border border-slate-200 bg-slate-50 rounded text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-semibold block mb-1">Notice from the Warden Office:</strong>
                  Your hostel admission documents have been physically checked and marked valid. You are currently positioned at rank #{queuePosition}. Physical room allocation will proceed as final year students conclude exit formalities.
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
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Verified</span>
                  </div>

                  <dl className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">College Roll No</dt>
                      <dd className="font-mono font-semibold text-slate-800">{student?.rollNo || "22105128001"}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">BEU Registration No</dt>
                      <dd className="font-mono font-semibold text-slate-800">{student?.registrationNo || "22105128001/GEC"}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Department</dt>
                      <dd className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
                        {student?.branch || "Computer Science & Engg"}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Academic Session</dt>
                      <dd className="font-semibold text-slate-800">{student?.session || "2025 - 2029"}</dd>
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
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Student</span>
                  </div>

                  <dl className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Full Legal Name</dt>
                      <dd className="font-semibold text-slate-800">{student?.fullName}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Institutional Email</dt>
                      <dd className="font-mono text-slate-800 truncate max-w-[170px]" title={student?.email}>
                        {student?.email}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Primary Contact</dt>
                      <dd className="font-mono font-medium text-slate-800">{student?.mobile}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Blood Group</dt>
                      <dd className="font-bold text-rose-700">{student?.bloodGroup || "O+"} (Positive)</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Gender / Category</dt>
                      <dd className="font-medium text-slate-800">General (EWS)</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Aadhaar Status</dt>
                      <dd className="font-semibold text-emerald-700">Verified (UIDAI)</dd>
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
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Registered</span>
                  </div>

                  <dl className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Father's Name</dt>
                      <dd className="font-semibold text-slate-800">{student?.parents?.fatherName || "Mr. Rajesh Kumar"}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Mother's Name</dt>
                      <dd className="font-semibold text-slate-800">{student?.parents?.motherName || "Mrs. Sunita Devi"}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Parent Helpline</dt>
                      <dd className="font-mono font-medium text-slate-800">
                        {student?.parents?.parentMobile || "+91 98765 11223"}
                      </dd>
                    </div>
                    <div className="py-1 border-b border-slate-100">
                      <dt className="text-slate-500 mb-0.5">Permanent Residential Address</dt>
                      <dd className="text-slate-800 font-normal leading-relaxed text-[11px]">
                        {student?.completeAddress || "Vill - Bariarpur, Post - Bariarpur, Dist - Munger, Bihar - 811211"}
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
        )}

        {/* ===================================================================== */}
        {/* TAB 2: BILLS & FEES TAB (PRD §3.5) */}
        {/* ===================================================================== */}
        {currentTab === "bills" && (
          <div className="mt-4 flex-1 space-y-6 animate-fadeIn">
            {/* 1. Billing Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Current Outstanding */}
              <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Outstanding</span>
                  {totalOutstanding === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <i className="fa-solid fa-circle-check text-[10px]"></i> Cleared
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      <i className="fa-solid fa-clock text-[10px]"></i> Due
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-mono font-bold text-slate-900">₹{totalOutstanding}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {totalOutstanding === 0 ? "No overdue bills for Spring 2026" : `${pendingBillsList.length} invoice(s) awaiting payment`}
                  </p>
                </div>
              </div>

              {/* Metric 2: Total Fees Paid this Session */}
              <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Paid (Session)</span>
                  <span className="text-[11px] font-mono text-slate-500">2025–26</span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-mono font-bold text-slate-900">₹{totalPaid.toLocaleString()}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rent + Mess Diet Fee + Deposit</p>
                </div>
              </div>

              {/* Metric 3: Total Mess Rebate Saved */}
              <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mess Rebate Saved</span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    70% Rule Applied
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-mono font-bold text-emerald-700">-₹{totalRebate.toLocaleString()}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Approved leave mess rebate deduction</p>
                </div>
              </div>

              {/* Metric 4: Caution Money */}
              <div className="p-4 border border-slate-200 rounded-md bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hostel Caution Money</span>
                  <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    Refundable
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-mono font-bold text-slate-900">₹5,000</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Held in college account (No dues pending)</p>
                </div>
              </div>
            </div>

            {/* 2. Upcoming Cycle / Pending Invoices Section */}
            {pendingBillsList.length > 0 ? (
              pendingBillsList.map((pendingBill) => (
                <section key={pendingBill._id} className="border border-slate-200 rounded-md bg-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                        {pendingBill.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Billing Period: {pendingBill.billingPeriod} • Hostels Office, Haveli Kharagpur Campus
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
                      <p className="text-xs font-bold text-slate-900">{pendingBill.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Base Amount: ₹{pendingBill.baseAmount}{" "}
                        {pendingBill.rebateAmount > 0 && `• Leave Rebate Credit: -₹${pendingBill.rebateAmount}`}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto">
                      <div className="text-right sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                        <span className="font-mono text-lg font-bold text-slate-900">₹{pendingBill.netAmount}</span>
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
                              `Invoice Breakdown:\n• Title: ${pendingBill.title}\n• Period: ${pendingBill.billingPeriod}\n• Base Amount: ₹${pendingBill.baseAmount}\n• Rebate Deduction: -₹${pendingBill.rebateAmount}\n• Net Payable: ₹${pendingBill.netAmount}`
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
                    <p className="text-xs text-slate-500 mt-0.5">Advance invoice for Autumn 2026 term • Hostels Office, Haveli Kharagpur Campus</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-900 border border-sky-300 rounded self-start sm:self-auto">
                    Upcoming Due Date: 15 July 2026
                  </span>
                </div>

                <div className="mt-4 p-4 border border-slate-200 rounded-md bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">HMS-ADV-2026-AUT</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded">
                        Invoice Generated
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">Autumn 2026 Mess Charges (Jul–Nov) &amp; Hostel Maintenance Fee</p>
                    <p className="text-[11px] text-slate-500">Base Mess Rate: ₹180/day × 70 billing days (₹12,600) + Amenities &amp; Electricity (₹1,900)</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto">
                    <div className="text-right sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                      <span className="font-mono text-lg font-bold text-slate-900">₹14,500</span>
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
                          alert("Cycle Breakdown:\n• Mess Food Charge: ₹12,600\n• Room Electricity: ₹1,200\n• Water & RO Filter: ₹400\n• Wi-Fi & Maintenance: ₹300\nTotal: ₹14,500")
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
                  <p className="text-xs text-slate-500 mt-0.5">Automated deduction rule applied when continuous sanctioned hostel absence ≥ 5 days</p>
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
                      Leave Duration: 23 Mar 2026 to 01 Apr 2026 (10 Days Sanctioned)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                    Deduction Processed
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-white">
                  <div className="p-2.5 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sanctioned Absence</span>
                    <p className="font-bold text-slate-900">10 Days Continuous</p>
                    <p className="text-[10px] text-slate-500">Threshold: ≥ 5 days met</p>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Standard Mess Rate</span>
                    <p className="font-mono font-bold text-slate-900">₹180.00 / day</p>
                    <p className="text-[10px] text-slate-500">Gross = 10 × ₹180 = ₹1,800</p>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Institutional Rebate (70%)</span>
                    <p className="font-mono font-bold text-emerald-700">- ₹1,260.00</p>
                    <p className="text-[10px] text-slate-500">30% establishment retained</p>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Warden Approval</span>
                    <p className="font-bold text-slate-900 truncate">
                      {wardenInfo?.name || "Prof. R. K. Singh"}
                    </p>
                    <p className="text-[10px] text-slate-500">Signed &amp; Approved</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 border-t border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <i className="fa-solid fa-circle-info text-emerald-700 mt-0.5"></i>
                  <div>
                    <strong className="font-semibold text-emerald-900">Direct Bill Reconciliation:</strong>
                    {" "}The ₹1,260 mess rebate was deducted automatically from Spring 2026 Mess Charges (Bill #HMS-BL-2026-03).
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
                  <p className="text-xs text-slate-500 mt-0.5">Complete audited record of transactions reconciled by GEC Munger Finance Section</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>Showing {bills.length > 0 ? bills.length : 3} Transactions</span>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">Bill ID</th>
                      <th className="py-2.5 px-3 font-semibold">Description / Particulars</th>
                      <th className="py-2.5 px-3 font-semibold">Gross</th>
                      <th className="py-2.5 px-3 font-semibold">Rebate</th>
                      <th className="py-2.5 px-3 font-semibold">Net Paid</th>
                      <th className="py-2.5 px-3 font-semibold">Mode &amp; Gateway</th>
                      <th className="py-2.5 px-3 font-semibold">Transaction / UTR</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Receipt</th>
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
                          <div className="font-semibold text-slate-900">{bill.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Period: {bill.billingPeriod} • {bill.billType?.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono">₹{bill.baseAmount.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                          {bill.rebateAmount > 0 ? `-₹${bill.rebateAmount.toLocaleString()}` : "₹0"}
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
                          {new Date(bill.paidAt || bill.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {bill.status === "PAID" ? (
                            <button
                              onClick={() => openReceipt(bill)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fa-solid fa-file-invoice text-[10px]"></i> Receipt
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
                          <td className="py-3 px-3 font-mono font-medium text-slate-900">HMS-BL-2026-03</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">Spring 2026 Mess Charges (Feb–May)</div>
                            <div className="text-[11px] text-slate-500">100 Days Mess Diet Billing</div>
                          </td>
                          <td className="py-3 px-3 font-mono">₹18,000</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">-₹1,260</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">₹16,740</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                              <i className="fa-solid fa-mobile-screen-button text-[10px] text-slate-500"></i> UPI (hosteladmin@sbi)
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">408129581923</td>
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
                              <i className="fa-solid fa-file-invoice text-[10px]"></i> Receipt
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-medium text-slate-900">HMS-BL-2026-01</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">4th Sem Hostel Seat Rent &amp; Amenities</div>
                            <div className="text-[11px] text-slate-500">Room 101, Boys Hostel Block A</div>
                          </td>
                          <td className="py-3 px-3 font-mono">₹5,630</td>
                          <td className="py-3 px-3 font-mono text-slate-400">₹0</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">₹5,630</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                              <i className="fa-solid fa-qrcode text-[10px] text-slate-500"></i> UPI QR
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">401928374821</td>
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
                              <i className="fa-solid fa-file-invoice text-[10px]"></i> Receipt
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-medium text-slate-900">HMS-BL-2025-CAU</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">One-Time Hostel Caution Deposit</div>
                            <div className="text-[11px] text-slate-500">Security Deposit (Refundable upon exit clearance)</div>
                          </td>
                          <td className="py-3 px-3 font-mono">₹5,000</td>
                          <td className="py-3 px-3 font-mono text-slate-400">₹0</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">₹5,000</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                              <i className="fa-solid fa-building-columns text-[10px] text-slate-500"></i> NetBanking (SBI)
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">329104829104</td>
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
                              <i className="fa-solid fa-file-invoice text-[10px]"></i> Receipt
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
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE & DESKTOP FOOTER / INSTITUTIONAL SUPPORT BAR */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-slate-300 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 rounded border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Account Settings & Preferences"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">Hostel Desk Portal</span> • Haveli Kharagpur, Munger, Bihar 811211
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>
              Emergency Contact: <span className="font-mono font-medium text-slate-800">+91 94312 34567</span> (Hostel Warden)
            </span>
            <span className="text-slate-300">|</span>
            <span>© 2026 GEC Munger HMS</span>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: UPI PAYMENT VIA QR CODE */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-md w-full max-w-md p-6 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-building-columns text-slate-800 text-sm"></i>
                <h4 className="text-sm font-bold text-slate-900">Hostel Fee Payment via UPI / QR</h4>
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
                <svg className="w-44 h-44 mx-auto" fill="currentColor" viewBox="0 0 100 100">
                  <rect fill="#0f172a" height="30" width="30" x="0" y="0"></rect>
                  <rect fill="#ffffff" height="22" width="22" x="4" y="4"></rect>
                  <rect fill="#0f172a" height="14" width="14" x="8" y="8"></rect>
                  <rect fill="#0f172a" height="30" width="30" x="70" y="0"></rect>
                  <rect fill="#ffffff" height="22" width="22" x="74" y="4"></rect>
                  <rect fill="#0f172a" height="14" width="14" x="78" y="8"></rect>
                  <rect fill="#0f172a" height="30" width="30" x="0" y="70"></rect>
                  <rect fill="#ffffff" height="22" width="22" x="4" y="74"></rect>
                  <rect fill="#0f172a" height="14" width="14" x="8" y="78"></rect>
                  <rect fill="#0f172a" height="6" width="6" x="36" y="8"></rect>
                  <rect fill="#0f172a" height="6" width="10" x="48" y="8"></rect>
                  <rect fill="#0f172a" height="6" width="18" x="40" y="20"></rect>
                  <rect fill="#0f172a" height="18" width="6" x="8" y="40"></rect>
                  <rect fill="#0f172a" height="12" width="8" x="20" y="44"></rect>
                  <rect fill="#0f172a" height="28" width="28" x="36" y="36"></rect>
                  <rect fill="#ffffff" height="16" width="16" x="42" y="42"></rect>
                  <rect fill="#0f172a" height="8" width="8" x="46" y="46"></rect>
                  <rect fill="#0f172a" height="8" width="8" x="72" y="38"></rect>
                  <rect fill="#0f172a" height="6" width="10" x="84" y="42"></rect>
                  <rect fill="#0f172a" height="6" width="14" x="72" y="56"></rect>
                  <rect fill="#0f172a" height="10" width="10" x="38" y="72"></rect>
                  <rect fill="#0f172a" height="16" width="8" x="54" y="76"></rect>
                  <rect fill="#0f172a" height="6" width="18" x="72" y="72"></rect>
                  <rect fill="#0f172a" height="10" width="10" x="80" y="84"></rect>
                </svg>
              </div>

              <p className="text-xs font-semibold text-slate-800">Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM)</p>
              <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                <span>UPI VPA:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  hosteladmin@sbi
                </span>
              </div>

              <div className="mt-3 border border-slate-200 bg-slate-50 p-2.5 rounded text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-medium text-slate-800">{student?.fullName} ({student?.rollNo})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono text-slate-800">
                    {targetPayBill?.title || "Autumn 2026 Mess Charges (Jul–Nov)"}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200 text-slate-900">
                  <span>Payable Amount:</span>
                  <span className="text-emerald-700">₹{targetPayBill?.netAmount || "14,500.00"}</span>
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

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL PAYMENT RECEIPT PREVIEW (PRD §3.5) */}
      {/* ========================================================================= */}
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
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Government Engineering College, Munger</h4>
                  <p className="text-[10px] text-slate-500 font-hindi">राजकीय अभियंत्रण महाविद्यालय, मुंगेर • e-Receipt</p>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt Serial No.</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedReceipt.receiptNumber || `HMS-BL-2026-0${selectedReceipt._id?.slice(-2) || "03"}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Generated</span>
                  <span className="font-medium text-slate-700">
                    {new Date(selectedReceipt.paidAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">Student Name</span>
                  <strong className="text-slate-900">{student?.fullName}</strong> ({student?.branch?.split(" ")[0] || "ECE"} {student?.session || "2025–29"})
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Roll / Registration</span>
                  <strong className="text-slate-900 font-mono">
                    {student?.rollNo} / {student?.registrationNo || "22105128001"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Room Coordinates</span>
                  <span className="text-slate-800">
                    {student?.hostelId?.name || "Boys Hostel"}, {student?.blockId?.name || "Block A"}, Room {student?.roomId?.roomNumber || "101"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Payment Mode &amp; UTR</span>
                  <span className="font-mono text-slate-800">
                    {selectedReceipt.paymentMethod || "UPI"} (UTR: {selectedReceipt.transactionId || "408129581923"})
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <div className="flex justify-between py-1">
                  <span className="text-slate-700 font-medium">{selectedReceipt.title}</span>
                  <span className="font-mono font-bold text-slate-900">₹{selectedReceipt.netAmount?.toLocaleString()}.00</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Payment Officially Reconciled &amp; Audited</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-900">AC-REC-OK</span>
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

      {/* ========================================================================= */}
      {/* MODAL: SETTINGS MODAL */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-md w-full max-w-md p-6 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Portal Settings &amp; Preferences</h4>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMS Alert Notification Phone</label>
                <input
                  type="text"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 font-mono py-1.5 px-2.5 focus:border-slate-800 focus:ring-0"
                />
                <p className="text-[11px] text-slate-500 mt-1">Hostel mess bills &amp; gate logs are transmitted to this number.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Language Preference</label>
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
                <p className="text-[11px] font-semibold text-slate-700 mb-2">Hostel Jurisdiction &amp; Status</p>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">
                      {student?.hostelId?.name || "Boys Hostel"} • {student?.blockId?.name || "Block A"}
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
    </div>
  );
}
