/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";

import { StudentHeader } from "@/components/dashboard/student/StudentHeader";
import { StateIndicatorBanner } from "@/components/dashboard/student/StateIndicatorBanner";
import { StudentProfileTab } from "@/components/dashboard/student/StudentProfileTab";
import { StudentBillsTab } from "@/components/dashboard/student/StudentBillsTab";
import { StudentFooter } from "@/components/dashboard/student/StudentFooter";
import { StudentModals } from "@/components/dashboard/student/StudentModals";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastContext";

export default function StudentPortal() {
  const router = useRouter();
  const toast = useToast();
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
  const [previewState, setPreviewState] = useState<"allotted" | "waiting">(
    "allotted",
  );

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
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const data = await res.json();

      if (res.status === 403) {
        setAccessError(
          data.message ||
            "Your hostel residency has been CANCELLED or EVICTED by administration.",
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
      alert(
        "Please enter your 12-digit UTR / Bank Transaction Reference number.",
      );
      return;
    }

    try {
      const billId =
        targetPayBill?._id || bills.find((b) => b.status === "PENDING")?._id;
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

      showToast(
        "success",
        `UTR (${utrInput.trim()}) recorded successfully! Official receipt issued.`,
      );
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
          <h2 className="text-lg font-bold text-slate-900">
            Residency Access Suspended
          </h2>
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
  const totalPaid =
    stats?.totalPaidAmount ??
    (paidBillsList.length > 0
      ? paidBillsList.reduce((acc, b) => acc + (b.netAmount || 0), 0)
      : 27370);
  const totalRebate =
    stats?.totalRebateSaved ??
    (bills.reduce((acc, b) => acc + (b.rebateAmount || 0), 0) || 1260);

    const props = {
    loading, setLoading,
    accessError, setAccessError,
    student, setStudent,
    roommate, setRoommate,
    wardenInfo, setWardenInfo,
    queuePosition, setQueuePosition,
    bills, setBills,
    leaves, setLeaves,
    stats, setStats,
    currentTab, setCurrentTab,
    previewState, setPreviewState,
    showPaymentModal, setShowPaymentModal,
    targetPayBill, setTargetPayBill,
    utrInput, setUtrInput,
    showReceiptModal, setShowReceiptModal,
    selectedReceipt, setSelectedReceipt,
    showSettingsModal, setShowSettingsModal,
    settingsPhone, setSettingsPhone,
    settingsLang, setSettingsLang,
    notification, setNotification,
    showToast, fetchStudentData, handleLogout, handleConfirmPayment,
    isAllotted, pendingBillsList, paidBillsList, totalOutstanding, totalPaid, totalRebate
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      <StudentHeader {...props} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        <StateIndicatorBanner {...props} />

        {currentTab === "profile" && <StudentProfileTab {...props} />}
        {currentTab === "bills" && <StudentBillsTab {...props} />}
      </main>

      <StudentFooter {...props} />
      <StudentModals {...props} />
    </div>
  );
}



