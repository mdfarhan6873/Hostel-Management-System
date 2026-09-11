"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function WardenDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "blueprint" | "students" | "billing" | "leaves" | "notices"
  >("blueprint");
  const [loading, setLoading] = useState(true);

  // Blueprint Data
  const [blueprint, setBlueprint] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");

  // Student Data
  const [students, setStudents] = useState<any[]>([]);
  const [studentFilter, setStudentFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Billing Data
  const [bills, setBills] = useState<any[]>([]);

  // Leaves Data
  const [leaves, setLeaves] = useState<any[]>([]);

  // Notices Data
  const [notices, setNotices] = useState<any[]>([]);

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    blockId: "",
    floorId: "",
    roomNumber: "",
    capacity: 2,
    roomType: "Double",
  });

  const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "Student@123",
    age: 20,
    rollNo: "",
    branch: "Computer Science & Engineering",
    session: "2025-2029",
    completeAddress: "",
    bloodGroup: "O+",
    fatherName: "",
    motherName: "",
    parentMobile: "",
  });

  const [showAllotModal, setShowAllotModal] = useState(false);
  const [allotTargetStudent, setAllotTargetStudent] = useState<any>(null);
  const [allotForm, setAllotForm] = useState({ roomId: "", furnitureGroupIndex: 0 });

  const [showEvictModal, setShowEvictModal] = useState(false);
  const [evictTargetStudent, setEvictTargetStudent] = useState<any>(null);
  const [evictForm, setEvictForm] = useState({
    evictionRemark: "",
    evictionNoticeLink: "",
  });

  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [billForm, setBillForm] = useState({
    studentId: "",
    title: "Mess Charges (with Rebate)",
    billType: "mess",
    billingPeriod: "August 2026",
    baseAmount: 3500,
    leaveDaysRebate: 0,
    rebatePerDay: 100,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
  });

  const [showCreateNoticeModal, setShowCreateNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    description: "",
    category: "ADMISSION",
    refNumber: "",
    pdfLinkUrl: "",
    pdfLinkLabel: "डाउनलोड आदेश (Download Circular)",
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetchSessionAndAllData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSessionAndAllData = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData.authenticated || (authData.user.role !== "warden" && authData.user.role !== "superadmin")) {
        router.push("/");
        return;
      }
      setCurrentUser(authData.user);

      // Parallel fetch of all warden data
      const [bpRes, stuRes, billRes, leaveRes, notRes] = await Promise.all([
        fetch("/api/warden/blueprint"),
        fetch("/api/warden/students"),
        fetch("/api/warden/billing"),
        fetch("/api/warden/leaves"),
        fetch("/api/warden/notices"),
      ]);

      const [bpData, stuData, billData, leaveData, notData] = await Promise.all([
        bpRes.json(),
        stuRes.json(),
        billRes.json(),
        leaveRes.json(),
        notRes.json(),
      ]);

      if (bpData.success) {
        setBlueprint(bpData.blueprint || []);
        setAllRooms(bpData.rooms || []);
        if (bpData.blueprint?.length > 0 && !selectedBlockId) {
          setSelectedBlockId(bpData.blueprint[0]._id);
        }
      }
      if (stuData.success) setStudents(stuData.students || []);
      if (billData.success) setBills(billData.bills || []);
      if (leaveData.success) setLeaves(leaveData.leaves || []);
      if (notData.success) setNotices(notData.notices || []);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error synchronizing institutional data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Student Allotment
  const handleExecuteAllotment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/warden/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ALLOT",
          studentId: allotTargetStudent._id,
          roomId: allotForm.roomId,
          furnitureGroupIndex: Number(allotForm.furnitureGroupIndex),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Allotment failed");

      showToast("success", `Student ${allotTargetStudent.fullName} successfully allotted!`);
      setShowAllotModal(false);
      setAllotTargetStudent(null);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Student Eviction
  const handleExecuteEviction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/warden/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EVICT",
          studentId: evictTargetStudent._id,
          evictionRemark: evictForm.evictionRemark,
          evictionNoticeLink: evictForm.evictionNoticeLink,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eviction failed");

      showToast("success", `Student allotment cancelled and bed vacated.`);
      setShowEvictModal(false);
      setEvictTargetStudent(null);
      setEvictForm({ evictionRemark: "", evictionNoticeLink: "" });
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Student Registration
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/warden/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER",
          ...studentForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Student registration failed");

      showToast("success", `Student ${studentForm.fullName} registered into Waiting Queue!`);
      setShowRegisterStudentModal(false);
      setStudentForm({
        fullName: "",
        email: "",
        mobile: "",
        password: "Student@123",
        age: 20,
        rollNo: "",
        branch: "Computer Science & Engineering",
        session: "2025-2029",
        completeAddress: "",
        bloodGroup: "O+",
        fatherName: "",
        motherName: "",
        parentMobile: "",
      });
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Leave Review
  const handleReviewLeave = async (leaveId: string, action: "APPROVE" | "REJECT", reason?: string) => {
    try {
      const res = await fetch("/api/warden/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveId,
          action,
          rejectionReason: reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      showToast("success", `Leave request ${action === "APPROVE" ? "approved" : "rejected"}!`);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Create Bill
  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/warden/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate bill");

      showToast("success", "Institutional bill issued successfully with rebate deduction!");
      setShowCreateBillModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Create Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pdfLinks = noticeForm.pdfLinkUrl
        ? [{ label: noticeForm.pdfLinkLabel || "Download Circular", url: noticeForm.pdfLinkUrl }]
        : [];

      const res = await fetch("/api/warden/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeForm.title,
          description: noticeForm.description,
          category: noticeForm.category,
          refNumber: noticeForm.refNumber,
          pdfLinks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish notice");

      showToast("success", "Notice published to institutional landing board!");
      setShowCreateNoticeModal(false);
      setNoticeForm({
        title: "",
        description: "",
        category: "ADMISSION",
        refNumber: "",
        pdfLinkUrl: "",
        pdfLinkLabel: "डाउनलोड आदेश (Download Circular)",
      });
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesStatus = studentFilter === "ALL" || s.status === studentFilter;
    const matchesQuery =
      !searchQuery ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Selected Block Blueprint
  const activeBlock = blueprint.find((b) => b._id === selectedBlockId) || blueprint[0];

  // Eligible Allotted Students for billing
  const allottedStudentsList = students.filter((s) => s.status === "ALLOTTED");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-emerald-400 font-medium tracking-wide">
          Authenticating Warden Supervised Residential Console...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
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
                  Warden Management Console
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  {currentUser?.assignedCategory || "Chief Campus Warden"}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                Government Engineering College, Munger
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{currentUser?.name}</span>
              <span className="text-xs text-emerald-400 font-mono">{currentUser?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 transition shadow-sm flex items-center gap-1.5"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800/80 pt-1 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "blueprint"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            🗺️ Visual Block Blueprint & Furniture
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "students"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            👥 Student Lifecycle ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "billing"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            💳 Billing & Mess Rebate Engine ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "leaves"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            📝 Leave Requests ({leaves.filter((l) => l.status === "PENDING").length} Pending)
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "notices"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            📢 Notice Board Publisher ({notices.length})
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: VISUAL BLOCK BLUEPRINT & FURNITURE MATRIX */}
        {/* ========================================================================= */}
        {activeTab === "blueprint" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Block Selector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Visual Blueprint Room & Asset Matrix</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Floor-by-floor inspection showing capacity, occupancy, and unique Bed, Table, and Chair IDs.
                </p>
              </div>

              {/* Block Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Select Block:</span>
                <div className="flex gap-2">
                  {blueprint.map((blk) => (
                    <button
                      key={blk._id}
                      onClick={() => setSelectedBlockId(blk._id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
                        activeBlock?._id === blk._id
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {blk.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blueprint Display for Active Block */}
            {activeBlock ? (
              <div className="space-y-8">
                {activeBlock.floors && activeBlock.floors.length > 0 ? (
                  activeBlock.floors.map((floor: any) => (
                    <div
                      key={floor._id}
                      className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <h3 className="text-base font-bold text-white">
                            {floor.name} (Floor {floor.floorNumber})
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {floor.rooms?.length || 0} Total Rooms
                        </span>
                      </div>

                      {/* Rooms Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {floor.rooms?.map((room: any) => {
                          const occupiedCount =
                            room.furnitureGroups?.filter((g: any) => g.isOccupied).length || 0;
                          const isFull = occupiedCount >= room.capacity;

                          return (
                            <div
                              key={room._id}
                              className={`p-5 rounded-2xl border transition-all ${
                                isFull
                                  ? "bg-slate-950/80 border-slate-800"
                                  : "bg-slate-950/90 border-emerald-500/30 shadow-lg shadow-emerald-950/20"
                              }`}
                            >
                              {/* Room Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-emerald-400 text-lg shadow-inner">
                                    {room.roomNumber}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-white">
                                      Room {room.roomNumber}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {room.roomType} Configuration ({room.capacity} Bed Capacity)
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                      isFull
                                        ? "bg-slate-800 text-slate-400"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                    }`}
                                  >
                                    {isFull ? "Fully Occupied" : `${room.capacity - occupiedCount} Beds Free`}
                                  </span>
                                </div>
                              </div>

                              {/* Furniture Groups Matrix */}
                              <div className="space-y-3">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                  Assigned Furniture & Asset Identifiers:
                                </div>
                                {room.furnitureGroups?.map((fg: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-xl border text-xs flex flex-col gap-2 ${
                                      fg.isOccupied
                                        ? "bg-slate-900/90 border-slate-800 text-slate-300"
                                        : "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-medium">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{fg.groupName}</span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                                            fg.isOccupied
                                              ? "bg-slate-800 text-slate-400"
                                              : "bg-emerald-500/30 text-emerald-300"
                                          }`}
                                        >
                                          {fg.isOccupied ? "Occupied" : "Vacant"}
                                        </span>
                                      </div>

                                      {/* Occupant Info if occupied */}
                                      {fg.isOccupied && (
                                        <span className="text-emerald-400 font-semibold truncate max-w-[200px]">
                                          👤 {fg.occupiedStudentName} ({fg.occupiedStudentRoll})
                                        </span>
                                      )}
                                    </div>

                                    {/* Asset IDs Badges */}
                                    <div className="grid grid-cols-3 gap-2 font-mono text-2xs pt-1 border-t border-slate-800/60">
                                      <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800/80 text-center">
                                        <span className="text-slate-500 block text-3xs">BED ID</span>
                                        <span className="text-slate-200 font-bold">{fg.bedId}</span>
                                      </div>
                                      <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800/80 text-center">
                                        <span className="text-slate-500 block text-3xs">TABLE ID</span>
                                        <span className="text-slate-200 font-bold">{fg.tableId}</span>
                                      </div>
                                      <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800/80 text-center">
                                        <span className="text-slate-500 block text-3xs">CHAIR ID</span>
                                        <span className="text-slate-200 font-bold">{fg.chairId}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
                    No floors or rooms registered in this block yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
                No blocks found for current warden category.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDENT LIFECYCLE MANAGEMENT (WAITING, ALLOTTED, CANCELLED) */}
        {/* ========================================================================= */}
        {activeTab === "students" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Student Lifecycle Management</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage waiting queues, execute room & furniture allotment, and handle eviction/cancellation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRegisterStudentModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
                >
                  <span>+</span> Register New Applicant
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                {["ALL", "WAITING", "ALLOTTED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStudentFilter(st)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                      studentFilter === st
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {st === "ALL" ? "All Students" : st}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, roll no, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Student Information</th>
                      <th className="px-5 py-3.5">Academic Details</th>
                      <th className="px-5 py-3.5">Lifecycle Status</th>
                      <th className="px-5 py-3.5">Assigned Room & Assets</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-4">
                            <div className="font-bold text-white text-sm">{s.fullName}</div>
                            <div className="text-slate-400 font-mono mt-0.5">{s.email}</div>
                            <div className="text-slate-400 mt-0.5">📱 {s.mobile}</div>
                          </td>
                          <td className="px-5 py-4 font-mono">
                            <div className="text-slate-200">Roll: {s.rollNo}</div>
                            <div className="text-slate-400 text-xs">{s.branch}</div>
                            <div className="text-emerald-400 text-xs">Session: {s.session}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider ${
                                s.status === "ALLOTTED"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : s.status === "WAITING"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : "bg-red-500/20 text-red-400 border border-red-500/40"
                              }`}
                            >
                              {s.status}
                            </span>
                            {s.status === "CANCELLED" && s.evictionRemark && (
                              <div className="mt-1 text-red-300 text-2xs italic max-w-xs">
                                "{s.evictionRemark}"
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {s.status === "ALLOTTED" && s.roomId ? (
                              <div className="space-y-1 font-mono text-2xs">
                                <div className="text-white font-bold">
                                  Room {s.roomId.roomNumber} ({s.furnitureGroupName})
                                </div>
                                <div className="text-slate-400">Bed ID: <span className="text-emerald-300">{s.assignedBedId}</span></div>
                                <div className="text-slate-400">Table: {s.assignedTableId} | Chair: {s.assignedChairId}</div>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No Room Allotted</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {s.status === "WAITING" && (
                                <button
                                  onClick={() => {
                                    setAllotTargetStudent(s);
                                    setShowAllotModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-md shadow-emerald-950"
                                >
                                  Allot Room
                                </button>
                              )}

                              {s.status === "ALLOTTED" && (
                                <button
                                  onClick={() => {
                                    setEvictTargetStudent(s);
                                    setShowEvictModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg transition"
                                >
                                  Evict / Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-500 italic">
                          No students found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BILLING & MESS REBATE ENGINE */}
        {/* ========================================================================= */}
        {activeTab === "billing" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Billing & Mess Rebate Deduction Engine</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Issue flexible period bills (single month or range like Jan-July) with automated leave-based mess rebate deductions.
                </p>
              </div>

              <button
                onClick={() => setShowCreateBillModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
              >
                <span>+</span> Generate New Student Bill
              </button>
            </div>

            {/* Billing Ledger Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Student / Card No</th>
                      <th className="px-5 py-3.5">Bill Title & Type</th>
                      <th className="px-5 py-3.5">Billing Period</th>
                      <th className="px-5 py-3.5">Base Fee</th>
                      <th className="px-5 py-3.5">Rebate Deduction</th>
                      <th className="px-5 py-3.5">Net Payable</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bills.length > 0 ? (
                      bills.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-4">
                            <div className="font-bold text-white">{b.studentId?.fullName}</div>
                            <div className="text-slate-400 font-mono text-2xs">
                              Roll: {b.studentId?.rollNo} | {b.studentId?.messCardNo || "MESS-NA"}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-white font-semibold">{b.title}</div>
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
                              <span>-₹{b.rebateAmount} ({b.leaveDaysRebate} days)</span>
                            ) : (
                              <span className="text-slate-500">₹0</span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                            ₹{b.netAmount}
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
                          <td className="px-5 py-4 text-right font-mono text-2xs">
                            {b.receiptNumber ? (
                              <span className="text-emerald-400 font-bold">{b.receiptNumber}</span>
                            ) : (
                              <span className="text-slate-500 italic">Unpaid</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-center text-slate-500 italic">
                          No bills generated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LEAVE REQUESTS & HANDWRITTEN APPLICATION REVIEW */}
        {/* ========================================================================= */}
        {activeTab === "leaves" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Student Leave Applications & Mess Rebate Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Verify handwritten student leave applications, duration, parental approval, and sanction mess rebate credit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leaves.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {leave.studentId?.fullName}
                        </span>
                        <span className="text-slate-400 font-mono text-xs">
                          ({leave.studentId?.rollNo})
                        </span>
                      </div>
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

                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white font-bold">
                          {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Days Count:</span>
                        <span className="text-emerald-400 font-bold">{leave.daysCount} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Room / Bed:</span>
                        <span className="text-slate-300">{leave.studentId?.assignedBedId || "N/A"}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 mb-4">
                      <span className="font-semibold text-slate-400 block mb-1">Reason for Leave:</span>
                      <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 italic">
                        "{leave.reason}"
                      </p>
                    </div>

                    {/* Handwritten Application Link per User Feedback */}
                    {leave.handwrittenApplicationUrl ? (
                      <div className="mb-4">
                        <a
                          href={leave.handwrittenApplicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl transition"
                        >
                          📄 View Handwritten Application Document
                        </a>
                      </div>
                    ) : (
                      <div className="mb-4 text-xs text-slate-500 italic">
                        No handwritten attachment attached.
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  {leave.status === "PENDING" && (
                    <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          const reason = prompt("Enter reason for leave rejection:");
                          if (reason) handleReviewLeave(leave._id, "REJECT", reason);
                        }}
                        className="px-4 py-2 bg-red-950/70 hover:bg-red-900 text-red-300 text-xs font-bold rounded-xl border border-red-800 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReviewLeave(leave._id, "APPROVE")}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition"
                      >
                        Approve & Credit Rebate
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: NOTICE BOARD PUBLISHER */}
        {/* ========================================================================= */}
        {activeTab === "notices" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Institutional Circulars & Notice Publisher</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Broadcast verified hostel admission, blueprint allocation, and mess rebate circulars to the landing page.
                </p>
              </div>

              <button
                onClick={() => setShowCreateNoticeModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
              >
                <span>+</span> Publish New Circular
              </button>
            </div>

            <div className="space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 text-2xs font-bold rounded-md uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {notice.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{notice.refNumber}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(notice.publishDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{notice.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{notice.description}</p>

                    {/* PDF Links */}
                    {notice.pdfLinks && notice.pdfLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {notice.pdfLinks.map((pdf: any, i: number) => (
                          <a
                            key={i}
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-400 rounded-lg transition"
                          >
                            📥 {pdf.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 text-2xs rounded-full border border-emerald-500/30">
                      Live on Landing Page
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ALLOT ROOM & FURNITURE */}
      {/* ========================================================================= */}
      {showAllotModal && allotTargetStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Execute Room & Furniture Allotment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Allocate verified room and unique furniture asset group for{" "}
              <b className="text-emerald-400">{allotTargetStudent.fullName}</b> ({allotTargetStudent.rollNo}).
            </p>

            <form onSubmit={handleExecuteAllotment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Room
                </label>
                <select
                  required
                  value={allotForm.roomId}
                  onChange={(e) => setAllotForm({ ...allotForm, roomId: e.target.value, furnitureGroupIndex: 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Room --</option>
                  {allRooms.map((r) => {
                    const vacantCount = r.furnitureGroups?.filter((g: any) => !g.isOccupied).length || 0;
                    return (
                      <option key={r._id} value={r._id} disabled={vacantCount === 0}>
                        Room {r.roomNumber} ({r.roomType}) — {vacantCount} vacant beds
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Furniture Group Selector for the chosen room */}
              {allotForm.roomId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Available Furniture Asset Group
                  </label>
                  <div className="space-y-2">
                    {allRooms
                      .find((r) => r._id === allotForm.roomId)
                      ?.furnitureGroups?.map((fg: any, idx: number) => (
                        <label
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            fg.isOccupied
                              ? "opacity-40 cursor-not-allowed bg-slate-950 border-slate-800"
                              : Number(allotForm.furnitureGroupIndex) === idx
                              ? "bg-emerald-950/60 border-emerald-500 text-white"
                              : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="furnitureGroup"
                              disabled={fg.isOccupied}
                              checked={Number(allotForm.furnitureGroupIndex) === idx}
                              onChange={() => setAllotForm({ ...allotForm, furnitureGroupIndex: idx })}
                              className="accent-emerald-500"
                            />
                            <div>
                              <div className="font-bold text-xs">{fg.groupName}</div>
                              <div className="text-2xs font-mono text-slate-400">
                                Bed: {fg.bedId} | Table: {fg.tableId} | Chair: {fg.chairId}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-2xs font-bold uppercase px-2 py-0.5 rounded ${
                              fg.isOccupied ? "bg-slate-800 text-slate-500" : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {fg.isOccupied ? "Occupied" : "Vacant"}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAllotModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!allotForm.roomId}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-lg shadow-emerald-950"
                >
                  Confirm Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EVICT / CANCEL ALLOTMENT */}
      {/* ========================================================================= */}
      {showEvictModal && evictTargetStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-red-400 mb-1">Confirm Student Eviction / Cancellation</h3>
            <p className="text-xs text-slate-400 mb-4">
              This action will vacate Bed <b>{evictTargetStudent.assignedBedId}</b>, mark student status as{" "}
              <b className="text-red-400">CANCELLED</b>, and log the official remark.
            </p>

            <form onSubmit={handleExecuteEviction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Eviction Remark <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Disciplinary suspension / Non-payment of dues / Course completion"
                  value={evictForm.evictionRemark}
                  onChange={(e) => setEvictForm({ ...evictForm, evictionRemark: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notice / Circular Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://gecmunger.ac.in/circulars/evict-notice.pdf"
                  value={evictForm.evictionNoticeLink}
                  onChange={(e) => setEvictForm({ ...evictForm, evictionNoticeLink: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEvictModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-950"
                >
                  Confirm Eviction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER NEW STUDENT */}
      {/* ========================================================================= */}
      {showRegisterStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Register New Student Applicant</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enters applicant into the residential waiting queue for room allotment.
            </p>

            <form onSubmit={handleRegisterStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.fullName}
                    onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    value={studentForm.mobile}
                    onChange={(e) => setStudentForm({ ...studentForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Engineering Branch</label>
                  <select
                    value={studentForm.branch}
                    onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Academic Session</label>
                  <input
                    type="text"
                    required
                    value={studentForm.session}
                    onChange={(e) => setStudentForm({ ...studentForm, session: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={studentForm.fatherName}
                    onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={studentForm.motherName}
                    onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">Parent Mobile</label>
                  <input
                    type="text"
                    value={studentForm.parentMobile}
                    onChange={(e) => setStudentForm({ ...studentForm, parentMobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterStudentModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
                >
                  Register Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE BILL (WITH FLEXIBLE TIME PERIOD AND REBATE) */}
      {/* ========================================================================= */}
      {showCreateBillModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Issue Institutional Bill</h3>
            <p className="text-xs text-slate-400 mb-4">
              Supports flexible time period (e.g. "August 2026" or "Jan-July 2026") and leave rebate deduction.
            </p>

            <form onSubmit={handleCreateBill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Allotted Student</label>
                <select
                  required
                  value={billForm.studentId}
                  onChange={(e) => setBillForm({ ...billForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Student --</option>
                  {allottedStudentsList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.rollNo}) - Bed: {s.assignedBedId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bill Type</label>
                  <select
                    value={billForm.billType}
                    onChange={(e) => setBillForm({ ...billForm, billType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mess">Mess Fee</option>
                    <option value="rent">Residency / Rent</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="fine">Disciplinary Fine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing Period <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. August 2026 or Jan-July 2026"
                    value={billForm.billingPeriod}
                    onChange={(e) => setBillForm({ ...billForm, billingPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={billForm.title}
                  onChange={(e) => setBillForm({ ...billForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Base Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={billForm.baseAmount}
                    onChange={(e) => setBillForm({ ...billForm, baseAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Leave Days</label>
                  <input
                    type="number"
                    min="0"
                    value={billForm.leaveDaysRebate}
                    onChange={(e) => setBillForm({ ...billForm, leaveDaysRebate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Net Calculation Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Rebate Deduction (@₹100/day):</span>
                  <span className="text-amber-400 font-bold">-₹{billForm.leaveDaysRebate * 100}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Net Payable Amount:</span>
                  <span className="text-emerald-400">
                    ₹{Math.max(0, billForm.baseAmount - billForm.leaveDaysRebate * 100)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={billForm.dueDate}
                  onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateBillModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
                >
                  Generate & Send Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUBLISH CIRCULAR / NOTICE */}
      {/* ========================================================================= */}
      {showCreateNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Publish Circular to Landing Page</h3>
            <p className="text-xs text-slate-400 mb-4">
              Broadcast admission schedules, blueprint circulars, and mess rebate rules.
            </p>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Circular Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. कमरा एवं फर्नीचर ब्लूप्रिंट आवंटन (Room Blueprint Allocation)"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ADMISSION">Admission Notice</option>
                    <option value="BLUEPRINT">Blueprint & Assets</option>
                    <option value="REBATE">Mess & Rebate</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reference No.</label>
                  <input
                    type="text"
                    placeholder="Ref: GEC/HMS/2026/..."
                    value={noticeForm.refNumber}
                    onChange={(e) => setNoticeForm({ ...noticeForm, refNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details of the circular..."
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Downloadable Document Link (PDF URL)
                </label>
                <input
                  type="text"
                  placeholder="https://gecmunger.ac.in/circulars/doc.pdf or #modal"
                  value={noticeForm.pdfLinkUrl}
                  onChange={(e) => setNoticeForm({ ...noticeForm, pdfLinkUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateNoticeModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
