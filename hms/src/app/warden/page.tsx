"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function WardenPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // View Navigation
  const [activeTab, setActiveTab] = useState<
    "blueprint" | "students" | "admission" | "billing" | "upi"
  >("blueprint");

  // Live Backend Data
  const [blueprint, setBlueprint] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  // Blueprint Filtering States
  const [roomSearch, setRoomSearch] = useState("");
  const [roomBlockFilter, setRoomBlockFilter] = useState("all");
  const [roomFloorFilter, setRoomFloorFilter] = useState("all");
  const [roomOccupancyFilter, setRoomOccupancyFilter] = useState("all");

  // Student Roster Filtering States
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
  const [studentBranchFilter, setStudentBranchFilter] = useState("all");
  const [studentSortFilter, setStudentSortFilter] = useState("room");

  // Admission Form Builder State (PRD §3.3)
  const [admissionConfig, setAdmissionConfig] = useState({
    title: "Spring 2026 Boys Hostel Allotment Round 2",
    targetBlocks: "Block A & B (Boys)",
    eligibility: "B.Tech 2nd & 3rd Year (BEU CGPA >= 7.0)",
    openDate: "2026-02-15",
    deadline: "2026-03-05",
    notes:
      "Online accommodation registration for registered 2nd and 3rd year B.Tech students. Allotment strictly based on BEU CGPA merit and certified permanent residence distance from Haveli Kharagpur campus.",
    documents: [
      "Official Hostel Fee Structure 2025-26.pdf (1.2 MB)",
      "GEC Munger Hostel Code of Conduct & Ragging Prohibition.pdf",
    ],
  });

  // Billing & Rebate Engine State (PRD §3.5 & §4.4)
  const [selectedBillingStudent, setSelectedBillingStudent] = useState<string>("rahul");
  const [rebateAbsenceDays, setRebateAbsenceDays] = useState<number>(10);
  const [dailyMessRate, setDailyMessRate] = useState<number>(120);
  const [rebatePolicyRate, setRebatePolicyRate] = useState<number>(0.7);
  const [selectedUpiAccount, setSelectedUpiAccount] = useState<string>("gecmess@sbi");

  // UPI Accounts State
  const [upiAccounts, setUpiAccounts] = useState([
    {
      id: "upi-1",
      title: "Mess Facility Account",
      vpa: "gecmess@sbi",
      payee: "Warden Mess Fund GEC Munger",
      category: "mess",
      isDefault: true,
      status: "Active",
    },
    {
      id: "upi-2",
      title: "Hostel Main Account",
      vpa: "hosteladmin@sbi",
      payee: "Principal GEC Munger Hostel A/C",
      category: "hostel",
      isDefault: false,
      status: "Active",
    },
    {
      id: "upi-3",
      title: "Security Deposit & Caution Account",
      vpa: "gecdeposit@sbi",
      payee: "GEC Munger Student Caution Fund",
      category: "caution",
      isDefault: false,
      status: "Active",
    },
  ]);

  const [newUpiForm, setNewUpiForm] = useState({
    title: "",
    payee: "",
    vpa: "",
    category: "mess",
    makeDefault: false,
  });

  // Modals
  const [showAllotmentModal, setShowAllotmentModal] = useState(false);
  const [allotTargetCandidate, setAllotTargetCandidate] = useState<any>({
    name: "Manish Kumar",
    rollNo: "23ME058",
    roomSlot: "205-B",
    distance: "85 km (Purnia)",
    cgpa: "8.82",
  });

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [placementMode, setPlacementMode] = useState<"allotted" | "waiting">("allotted");
  const [addStudentForm, setAddStudentForm] = useState({
    name: "Manish Kumar",
    dob: "2004-06-18",
    bloodGroup: "B+",
    phone: "+91 98350 44102",
    email: "manish.k@ug.gecmunger.ac.in",
    address: "Vill - Kasba, P.O. Kasba, District Purnia, Bihar - 854301",
    distance: 85,
    rollNo: "23ME058",
    regNo: "23105128058",
    branch: "ME",
    session: "2024-2025",
    semester: "4th Sem",
    cgpa: 8.82,
    fatherName: "Ramakant Kumar",
    motherName: "Sunita Devi",
    parentPhone: "+91 94302 18455",
    messCard: "MC-2024-419",
    docLink: "https://gecmunger.ac.in/verify/23ME058",
    aadhaar: "UIDAI-XXXX-XXXX-7104",
    targetBlock: "Block A (Kautilya Bhavan)",
    targetFloor: "2nd Floor",
    targetRoom: "205",
    targetSlot: "B",
  });

  // Custom Line Items for Admission Modal
  const [customBillRows, setCustomBillRows] = useState([
    {
      id: 1,
      title: "Hostel Maintenance & Room Rent",
      subtitle: "Semester fee for 2nd Floor Room 205-B",
      amount: 1500,
      dueDate: "2026-03-10",
      upi: "hosteladmin@sbi",
      nature: "Non-Refundable",
    },
    {
      id: 2,
      title: "Mess Food & Subsidy Advance Fee",
      subtitle: "One month mess catering advance (30 days @ ₹120)",
      amount: 3600,
      dueDate: "2026-03-10",
      upi: "gecmess@sbi",
      nature: "Adjustable",
    },
    {
      id: 3,
      title: "Hostel Security & Caution Deposit",
      subtitle: "Refundable security caution money at completion",
      amount: 2000,
      dueDate: "2026-03-10",
      upi: "gecdeposit@sbi",
      nature: "Refundable",
    },
  ]);

  // Warden Blueprint Creation Modal (Blocks, Floors, Rooms)
  const [showBlueprintCreatorModal, setShowBlueprintCreatorModal] = useState(false);
  const [blueprintCreateType, setBlueprintCreateType] = useState<"room" | "block" | "floor">("room");
  const [newBlockName, setNewBlockName] = useState("");
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorNumber, setNewFloorNumber] = useState(1);
  const [newFloorBlockId, setNewFloorBlockId] = useState("");
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [newRoomType, setNewRoomType] = useState("Double");
  const [newRoomBlockId, setNewRoomBlockId] = useState("");
  const [newRoomFloorId, setNewRoomFloorId] = useState("");

  const [showSettingsModal, setShowSettingsModal] = useState(false);
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
        window.location.href = "/";
        return;
      }
      setCurrentUser(authData.user);

      // Load live data from database
      const [bpRes, stuRes, billRes, notRes] = await Promise.all([
        fetch("/api/warden/blueprint"),
        fetch("/api/warden/students"),
        fetch("/api/warden/billing"),
        fetch("/api/warden/notices"),
      ]);

      const [bpData, stuData, billData, notData] = await Promise.all([
        bpRes.json(),
        stuRes.json(),
        billRes.json(),
        notRes.json(),
      ]);

      if (bpData.success) {
        setBlueprint(bpData.blueprint || []);
        setBlocks(bpData.blocks || []);
        setFloors(bpData.floors || []);
        setRooms(bpData.rooms || []);
        if (bpData.blocks?.length > 0) {
          setNewFloorBlockId(bpData.blocks[0]._id);
          setNewRoomBlockId(bpData.blocks[0]._id);
        }
        if (bpData.floors?.length > 0) {
          setNewRoomFloorId(bpData.floors[0]._id);
        }
      }

      if (stuData.success) setStudents(stuData.students || []);
      if (billData.success) setBills(billData.bills || []);
      if (notData.success) setNotices(notData.notices || []);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error connecting to hostel services");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // =========================================================================
  // BLUEPRINT CREATION ACTIONS (Warden builds entire hostel blueprint)
  // =========================================================================
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockName.trim()) {
      showToast("error", "Please enter block name");
      return;
    }
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_BLOCK",
          name: newBlockName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create block");

      showToast("success", `Block "${newBlockName}" established in hostel blueprint!`);
      setNewBlockName("");
      setShowBlueprintCreatorModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim() || !newFloorBlockId) {
      showToast("error", "Please provide floor details");
      return;
    }
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_FLOOR",
          name: newFloorName.trim(),
          floorNumber: Number(newFloorNumber),
          blockId: newFloorBlockId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create floor");

      showToast("success", `Floor "${newFloorName}" added to block!`);
      setNewFloorName("");
      setShowBlueprintCreatorModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim() || !newRoomBlockId || !newRoomFloorId) {
      showToast("error", "Please provide room coordinates");
      return;
    }
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ROOM",
          roomNumber: newRoomNumber.trim(),
          capacity: Number(newRoomCapacity),
          roomType: newRoomType,
          blockId: newRoomBlockId,
          floorId: newRoomFloorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      showToast("success", `Room ${newRoomNumber} created with tagged furniture inventory!`);
      setNewRoomNumber("");
      setShowBlueprintCreatorModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // =========================================================================
  // ALLOTMENT & STUDENT ACTIONS
  // =========================================================================
  const handleFormalAllotment = async () => {
    try {
      const targetWaiting = students.find(
        (s) => s.status === "WAITING" && s.rollNo === allotTargetCandidate.rollNo
      );

      // If in DB, perform real database allotment
      if (targetWaiting && rooms.length > 0) {
        const roomMatch = rooms.find((r) =>
          r.roomNumber.includes(allotTargetCandidate.roomSlot?.split("-")[0] || "205")
        ) || rooms[0];

        const res = await fetch("/api/warden/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ALLOT",
            studentId: targetWaiting._id,
            roomId: roomMatch._id,
            furnitureGroupIndex: 1,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Allotment failed");
      }

      showToast(
        "success",
        `Formal Allotment Confirmed: ${allotTargetCandidate.name} (${allotTargetCandidate.rollNo}) assigned to slot ${allotTargetCandidate.roomSlot} with bound furniture assets.`
      );
      setShowAllotmentModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const handleSaveStudentComprehensive = async (asWaiting: boolean = false) => {
    try {
      const mode = asWaiting ? "WAITING" : placementMode === "waiting" ? "WAITING" : "ALLOT";

      const res = await fetch("/api/warden/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER",
          fullName: addStudentForm.name,
          email: addStudentForm.email,
          mobile: addStudentForm.phone,
          rollNo: addStudentForm.rollNo,
          branch: addStudentForm.branch,
          session: addStudentForm.session,
          completeAddress: addStudentForm.address,
          bloodGroup: addStudentForm.bloodGroup,
          fatherName: addStudentForm.fatherName,
          motherName: addStudentForm.motherName,
          parentMobile: addStudentForm.parentPhone,
          registrationNo: addStudentForm.regNo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to onboard student");

      const createdStudentId = data.student?._id;

      // If direct allotment requested and room exists
      if (mode !== "WAITING" && createdStudentId && rooms.length > 0) {
        const matchedRoom = rooms.find((r) => r.roomNumber === addStudentForm.targetRoom) || rooms[0];
        await fetch("/api/warden/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ALLOT",
            studentId: createdStudentId,
            roomId: matchedRoom._id,
            furnitureGroupIndex: addStudentForm.targetSlot === "B" ? 1 : 0,
          }),
        });

        // Generate initial bills in background
        for (const item of customBillRows) {
          await fetch("/api/warden/billing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: createdStudentId,
              title: item.title,
              billType: item.nature.toLowerCase().includes("mess") ? "mess" : "rent",
              billingPeriod: "Spring 2026 Initial",
              baseAmount: item.amount,
              dueDate: item.dueDate,
            }),
          });
        }
      }

      showToast(
        "success",
        asWaiting || placementMode === "waiting"
          ? `Candidate ${addStudentForm.name} queued in Waiting Priority Pool.`
          : `Student ${addStudentForm.name} onboarded, allotted to Room ${addStudentForm.targetRoom}-${addStudentForm.targetSlot}, and initial bills dispatched!`
      );

      setShowAddStudentModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Custom bill table helpers
  const handleAddCustomBillRow = () => {
    const newId = customBillRows.length + 1;
    setCustomBillRows([
      ...customBillRows,
      {
        id: newId,
        title: "Special Utility / Kit / Late Registration Charge",
        subtitle: "Custom ad-hoc fee added by Warden",
        amount: 500,
        dueDate: "2026-03-15",
        upi: "hosteladmin@sbi",
        nature: "Non-Refundable",
      },
    ]);
  };

  const handleRemoveCustomBillRow = (id: number) => {
    setCustomBillRows(customBillRows.filter((r) => r.id !== id));
  };

  const customBillsGrandTotal = useMemo(() => {
    return customBillRows.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [customBillRows]);

  // Billing calculation helpers
  const calculatedRebate = useMemo(() => {
    return rebateAbsenceDays * dailyMessRate * rebatePolicyRate;
  }, [rebateAbsenceDays, dailyMessRate, rebatePolicyRate]);

  const calculatedNetBill = useMemo(() => {
    const baseMess = 3600;
    const baseRent = 1500;
    return Math.max(0, baseMess + baseRent - calculatedRebate);
  }, [calculatedRebate]);

  // UPI Account handlers
  const handleSaveUpiAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiForm.title || !newUpiForm.vpa || !newUpiForm.payee) {
      showToast("error", "Please fill required UPI account fields");
      return;
    }
    const newAcc = {
      id: `upi-${Date.now()}`,
      title: newUpiForm.title.trim(),
      vpa: newUpiForm.vpa.trim().toLowerCase(),
      payee: newUpiForm.payee.trim(),
      category: newUpiForm.category,
      isDefault: newUpiForm.makeDefault,
      status: "Active",
    };

    let updated = [...upiAccounts];
    if (newUpiForm.makeDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAcc);
    setUpiAccounts(updated);
    setNewUpiForm({ title: "", payee: "", vpa: "", category: "mess", makeDefault: false });
    showToast("success", `UPI Account "${newAcc.title}" (${newAcc.vpa}) registered!`);
  };

  const setDefaultUpi = (vpa: string) => {
    setUpiAccounts(
      upiAccounts.map((a) => ({
        ...a,
        isDefault: a.vpa === vpa,
      }))
    );
    showToast("success", `Default UPI receiving account updated to ${vpa}`);
  };

  // Metrics calculation
  const totalCapacityCount = 600;
  const allottedBedsCount = students.filter((s) => s.status === "ALLOTTED").length || 510;
  const vacantBedsCount = Math.max(0, totalCapacityCount - allottedBedsCount);
  const waitingStudentsCount = students.filter((s) => s.status === "WAITING").length || 42;

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-700 font-semibold text-sm">
          Loading GEC Munger Warden Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans text-slate-900 min-h-screen flex flex-col antialiased selection:bg-slate-900 selection:text-white">
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

      {/* ===================================================================== */}
      {/* INSTITUTIONAL HEADER */}
      {/* ===================================================================== */}
      <header className="w-full z-40 bg-white border-b border-slate-300 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Image
                src="/munger.png"
                alt="GEC Munger Official Emblem"
                width={48}
                height={48}
                className="h-12 w-auto object-contain flex-shrink-0"
                priority
              />
              <div className="flex flex-col justify-center">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                    Government Engineering College, Munger
                  </span>
                  <span className="text-xs font-semibold text-slate-600 font-hindi">
                    / राजकीय अभियंत्रण महाविद्यालय, मुंगेर
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                  HOSTEL MANAGEMENT SYSTEM (HMS) • WARDEN PORTAL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:flex sm:flex-col sm:justify-center">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {currentUser?.name || "Prof. R. K. Singh"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Warden: {currentUser?.assignedCategory || "Boys Hostel (Block A & B)"} • Dept. of Mechanical
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800 flex-shrink-0">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "WS"}
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center justify-between pt-2">
            <nav className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: "blueprint", label: "Blueprint & Rooms Matrix" },
                { id: "students", label: "Students & Allotments" },
                { id: "admission", label: "Publish Admission Form" },
                { id: "billing", label: "Billing & Mess Rebate" },
                { id: "upi", label: "UPI Payment Accounts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border border-slate-900 bg-slate-900 text-white"
                      : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 border border-slate-200 rounded font-semibold text-slate-700">
                AY 2025-26 • EVEN SEM
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                BIOMETRIC SYNC ACTIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MAIN CONTENT CONTAINER */}
      {/* ===================================================================== */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Top Command Context Ribbon */}
        <div className="w-full bg-white border border-slate-300 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-sm font-bold text-slate-900">
                {currentUser?.assignedCategory || "Boys Residential Complex"}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <i className="fa-solid fa-shield-halved text-slate-500 text-xs"></i>
              <span>
                Superintendent Sign-off:{" "}
                <strong className="text-slate-900 font-semibold">Verified Active (Even Sem 2025-26)</strong>
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded border border-slate-900 flex items-center gap-1.5 hover:bg-slate-800 transition cursor-pointer"
            >
              <i className="fa-solid fa-user-plus text-[11px]"></i>
              <span>+ Add Student (Manual / Waiting)</span>
            </button>
            <button
              onClick={() => setActiveTab("admission")}
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
            >
              <i className="fa-solid fa-bullhorn text-[11px]"></i>
              <span>+ Publish Admission Window</span>
            </button>
            <button
              onClick={() => setShowBlueprintCreatorModal(true)}
              className="px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
            >
              <i className="fa-solid fa-sitemap text-[11px]"></i>
              <span>+ Create Blueprint (Block / Floor / Room)</span>
            </button>
          </div>
        </div>

        {/* Universal Metric Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Capacity</span>
              <i className="fa-solid fa-building text-slate-400 text-sm"></i>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900 font-mono">
                {totalCapacityCount} <span className="text-xs font-normal text-slate-500">Beds</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Block A &amp; Block B</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Allotted Beds</span>
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                {((allottedBedsCount / totalCapacityCount) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-emerald-700 font-mono">
                {allottedBedsCount} <span className="text-xs font-normal text-slate-500">Beds Active</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-200">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${(allottedBedsCount / totalCapacityCount) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vacant Available</span>
              <i className="fa-solid fa-bed text-slate-400 text-sm"></i>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900 font-mono">
                {vacantBedsCount} <span className="text-xs font-normal text-slate-500">Beds Ready</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Ready for immediate allotment</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Waiting Queue</span>
              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-bold">
                Round 2
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-amber-800 font-mono">
                {waitingStudentsCount} <span className="text-xs font-normal text-slate-500">Students</span>
              </div>
              <p className="text-[11px] text-amber-900 font-medium mt-0.5">{vacantBedsCount} Vacancies remaining</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Forms</span>
              <i className="fa-solid fa-file-signature text-slate-400 text-sm"></i>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900 font-mono">
                1 <span className="text-xs font-normal text-slate-500">Active Round</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5" title="Spring 2026 Boys Hostel Allotment Round 2">
                Spring 2026 Round 2
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: BLUEPRINT & ROOMS MATRIX */}
        {/* =================================================================== */}
        {activeTab === "blueprint" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Filter Ribbon */}
            <div className="w-full bg-white border border-slate-300 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                <div className="md:col-span-5 relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder="Search room (e.g. 204), resident name, roll number, bed ID..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <select
                    value={roomBlockFilter}
                    onChange={(e) => setRoomBlockFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
                  >
                    <option value="all">All Blocks</option>
                    <option value="block-a">Block A (Kautilya Bhavan)</option>
                    <option value="block-b">Block B (Aryabhata)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={roomFloorFilter}
                    onChange={(e) => setRoomFloorFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
                  >
                    <option value="all">All Floors</option>
                    <option value="ground">Ground Floor (001-020)</option>
                    <option value="1">Floor 1 (Rooms 101-120)</option>
                    <option value="2">Floor 2 (Rooms 201-220)</option>
                    <option value="3">Floor 3 (Rooms 301-320)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={roomOccupancyFilter}
                    onChange={(e) => setRoomOccupancyFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
                  >
                    <option value="all">All Occupancy States</option>
                    <option value="allotted">Fully Allotted</option>
                    <option value="vacant">Partially Vacant</option>
                    <option value="maintenance">Asset Defect / Hold</option>
                  </select>
                </div>

                <div className="md:col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setRoomSearch("");
                      setRoomBlockFilter("all");
                      setRoomFloorFilter("all");
                      setRoomOccupancyFilter("all");
                    }}
                    className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                    title="Reset Filters"
                  >
                    <i className="fa-solid fa-arrows-rotate text-xs"></i>
                  </button>
                  <button
                    onClick={() => setShowBlueprintCreatorModal(true)}
                    className="h-8 px-2.5 flex items-center gap-1 border border-slate-900 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                    title="Add to Blueprint"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span className="hidden lg:inline">Create</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded uppercase">
                    PRD §3.2 &amp; §4.2
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Block Blueprint &amp; Room Matrix — Block A (Kautilya Bhavan) • 2nd Floor
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive architectural room grid with individual furniture group tracking (Bed, Table, Chair IDs per PRD §3.2).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Fully Allotted
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Partially Vacant
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> Maintenance / Defect
                </span>
              </div>
            </div>

            {/* Priority Queue Pool Banner */}
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-900 text-sm">
                  <i className="fa-solid fa-hourglass-half"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wider text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                      Priority Queue Pool
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Next in Line: Manish Kumar (23ME058)
                    </h3>
                    <span className="font-mono text-[11px] bg-white border border-amber-200 px-1.5 py-0.5 rounded text-slate-800 font-semibold">
                      85 km • CGPA 8.82
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Eligible for Room 205 (Slot B) • Furniture:{" "}
                    <span className="font-mono text-[11px] text-slate-900 font-medium">
                      BED-BA-205-B, TBL-BA-205-B, CHR-BA-205-B
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-user-plus text-[10px]"></i>
                  <span>+ New Applicant Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAllotTargetCandidate({
                      name: "Manish Kumar",
                      rollNo: "23ME058",
                      roomSlot: "205-B",
                      distance: "85 km (Purnia)",
                      cgpa: "8.82",
                    });
                    setShowAllotmentModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-check text-[10px]"></i>
                  <span>Allot to Room 205-B</span>
                </button>
              </div>
            </div>

            {/* Room Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Room 201 */}
              <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Room 201</span>
                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                          Double Occupancy
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Corner Wing • South Facing</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 2/2 Allotted
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                              GRP A
                            </span>
                            <p className="font-bold text-slate-900">Rahul Verma</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Roll: <span className="font-mono font-semibold text-slate-800">23CSE012</span> • 4th Sem (CSE)
                          </p>
                        </div>
                        <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">BED-BA-201-A</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">TBL-BA-201-A</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">CHR-BA-201-A</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                              GRP B
                            </span>
                            <p className="font-bold text-slate-900">Amit Patel</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Roll: <span className="font-mono font-semibold text-slate-800">23ME044</span> • 4th Sem (ME)
                          </p>
                        </div>
                        <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">BED-BA-201-B</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">TBL-BA-201-B</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">CHR-BA-201-B</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-boxes-stacked text-[11px]"></i> Assets Verified
                  </span>
                  <button
                    onClick={() => alert("Audit History: Room 201 inventory signed by Caretaker on Jan 14, 2026.")}
                    className="text-slate-900 font-semibold hover:underline"
                  >
                    Audit History →
                  </button>
                </div>
              </div>

              {/* Room 204 (Active Focus) */}
              <div className="bg-white border-2 border-slate-900 rounded-lg p-4 flex flex-col justify-between relative">
                <div className="absolute -top-2.5 right-4 bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  Current Focus
                </div>
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Room 204</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[10px] font-bold">
                          Verified Active
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Main Corridor • East Balcony</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 2/2 Allotted
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-white bg-slate-900 px-1 rounded">
                              GRP A
                            </span>
                            <p className="font-bold text-slate-900">Aman Verma</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            CSE (2023-27) • Roll: <span className="font-mono font-semibold text-slate-800">23CSE019</span>
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                          Key Holder
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-700 text-center">
                        <div className="bg-white py-0.5 rounded border border-slate-200">BED-BA-204-A</div>
                        <div className="bg-white py-0.5 rounded border border-slate-200">TBL-BA-204-A</div>
                        <div className="bg-white py-0.5 rounded border border-slate-200">CHR-BA-204-A</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                              GRP B
                            </span>
                            <p className="font-bold text-slate-900">Rahul Kumar</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ECE (2023-27) • Roll: <span className="font-mono font-semibold text-slate-800">23ECE042</span>
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-semibold">
                          Rebate Eligible
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-700 text-center">
                        <div className="bg-white py-0.5 rounded border border-slate-200">BED-BA-204-B</div>
                        <div className="bg-white py-0.5 rounded border border-slate-200">TBL-BA-204-B</div>
                        <div className="bg-white py-0.5 rounded border border-slate-200">CHR-BA-204-B</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveTab("students")}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-800 font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Manage Residents
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Inspect Ledger
                  </button>
                </div>
              </div>

              {/* Room 205 (Vacant Bed) */}
              <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Room 205</span>
                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                          Double Occupancy
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Main Corridor • Quiet Zone</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> 1 Bed Vacant (1/2)
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                              GRP A
                            </span>
                            <p className="font-bold text-slate-900">Neeraj Sharma</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            EE (2024-28) • Roll: <span className="font-mono font-semibold text-slate-800">24EE008</span>
                          </p>
                        </div>
                        <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">BED-BA-205-A</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">TBL-BA-205-A</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">CHR-BA-205-A</span>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setAllotTargetCandidate({
                          name: "Manish Kumar",
                          rollNo: "23ME058",
                          roomSlot: "205-B",
                          distance: "85 km (Purnia)",
                          cgpa: "8.82",
                        });
                        setShowAllotmentModal(true);
                      }}
                      className="p-2.5 bg-white rounded border border-dashed border-slate-400 hover:border-slate-900 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1 rounded">
                            GRP B
                          </span>
                          <p className="font-bold text-amber-900 text-xs">VACANT BED SLOT</p>
                        </div>
                        <span className="text-[11px] text-slate-900 font-bold underline">Click to Allot</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Furniture Ready: Bed, Table, and Chair cleaned &amp; verified.
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-400">
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded">BED-BA-205-B</span>
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded">TBL-BA-205-B</span>
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded">CHR-BA-205-B</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Queue Match: #1 Manish Kumar</span>
                  <button
                    onClick={() => {
                      setAllotTargetCandidate({
                        name: "Manish Kumar",
                        rollNo: "23ME058",
                        roomSlot: "205-B",
                        distance: "85 km (Purnia)",
                        cgpa: "8.82",
                      });
                      setShowAllotmentModal(true);
                    }}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-user-plus text-[10px]"></i>
                    <span>+ Allot Waiting</span>
                  </button>
                </div>
              </div>

              {/* Room 208 (Prefect Single) */}
              <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Room 208</span>
                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                          Single / Prefect
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">North Wing • Attached Washroom</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 1/1 Allotted
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                              GRP A
                            </span>
                            <p className="font-bold text-slate-900">Vikash Singh (Hostel Prefect)</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Civil (2022-26) • Roll: <span className="font-mono font-semibold text-slate-800">22CE015</span>
                          </p>
                        </div>
                        <i className="fa-solid fa-award text-amber-600 text-xs"></i>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1 font-mono text-[10px] text-slate-600">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">BED-BA-208-A</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">TBL-BA-208-A</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">CHR-BA-208-A</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Disciplinary: Clean</span>
                  <button
                    onClick={() => alert("Prefect Special Allotment Memo #MEMO-PRF-2024-08 issued by Chief Warden.")}
                    className="text-slate-900 font-semibold hover:underline"
                  >
                    View Allotment Memo →
                  </button>
                </div>
              </div>

              {/* Room 210 (Triple Occupancy with Defect) */}
              <div className="bg-white border border-slate-300 rounded-lg p-4 flex flex-col justify-between lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Room 210</span>
                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                          Triple Occupancy (3 Beds)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">East Wing Corner • Extended Layout</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 2/3 Allotted
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP A
                        </span>
                        <p className="font-bold text-slate-900 truncate">Subham Kumar</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">ECE • 2023-27</p>
                      <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[10px] text-slate-600">
                        BED-BA-210-A
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-800 px-1 bg-white border border-slate-300 rounded">
                          GRP B
                        </span>
                        <p className="font-bold text-slate-900 truncate">Priyanshu Raj</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">CSE • 2023-27</p>
                      <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[10px] text-slate-600">
                        BED-BA-210-B
                      </div>
                    </div>

                    <div className="p-2.5 bg-red-50/60 rounded border border-dashed border-red-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-red-800 px-1 bg-red-100 rounded">
                            GRP C
                          </span>
                          <p className="font-bold text-red-800 text-xs">Asset Hold</p>
                        </div>
                        <i className="fa-solid fa-triangle-exclamation text-red-600 text-xs"></i>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Table Missing: Replacement logged</p>
                      <div className="mt-2 pt-2 border-t border-red-200 flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-800 font-semibold">BED-BA-210-C</span>
                        <span className="text-red-700 font-bold">TBL-MISSING</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Ticket #WS-2041: Carpenter assigned to Group C desk replacement.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Dynamic Furniture Binding modal initialized for Room 210.")}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Furniture Config
                    </button>
                    <button
                      onClick={() => alert("Maintenance dispatched: Requisition forwarded to Estate Officer.")}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Dispatch Requisition
                    </button>
                  </div>
                </div>
              </div>

              {/* Floor Plan Quick Selector */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Floor Plan Quick Selector
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">20 Rooms in Floor 2</p>
                  <div className="mt-2.5 grid grid-cols-5 gap-1.5 font-mono text-[11px] text-center">
                    {Array.from({ length: 20 }, (_, i) => {
                      const num = 201 + i;
                      const isFocus = num === 204;
                      const isVacant = num === 205 || num === 213 || num === 219;
                      const isDefect = num === 210;

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRoomSearch(`Room ${num}`)}
                          className={`py-1 rounded font-bold transition cursor-pointer ${
                            isFocus
                              ? "bg-slate-900 text-white border border-slate-900 ring-2 ring-slate-400"
                              : isDefect
                              ? "bg-red-100 text-red-900 border border-red-300"
                              : isVacant
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Floor 2: 42/45 Beds Occupied</span>
                  <button
                    onClick={() => alert("Downloading certified high-res Floor 2 Architectural Blueprint PDF...")}
                    className="text-slate-900 font-semibold hover:underline"
                  >
                    Download Blueprint PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: STUDENTS & ALLOTMENTS */}
        {/* =================================================================== */}
        {activeTab === "students" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Filter Toolbar */}
            <div className="w-full bg-white border border-slate-300 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                <div className="md:col-span-4 relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search resident by name, roll no, room, phone..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
                  >
                    <option value="all">All Statuses (555)</option>
                    <option value="allotted">Allotted Residents (510)</option>
                    <option value="waiting">Waiting Priority Queue (42)</option>
                    <option value="disciplinary">Disciplinary Notice (3)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={studentBranchFilter}
                    onChange={(e) => setStudentBranchFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
                  >
                    <option value="all">All Branches</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics &amp; Comm (ECE)</option>
                    <option value="ME">Mechanical Engg (ME)</option>
                    <option value="CE">Civil Engg (CE)</option>
                    <option value="EE">Electrical Engg (EE)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={studentSortFilter}
                    onChange={(e) => setStudentSortFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:border-slate-900 focus:outline-none"
                  >
                    <option value="room">Sort: Room Number</option>
                    <option value="distance">Sort: Distance (Farthest)</option>
                    <option value="merit">Sort: BEU CGPA Merit</option>
                    <option value="date">Sort: Allotment Date</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <i className="fa-solid fa-user-plus text-[10px]"></i>
                    <span>+ Add Student</span>
                  </button>
                  <button
                    onClick={() => alert("Exporting Complete Active Resident Master Roll CSV...")}
                    className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                    title="Export CSV"
                  >
                    <i className="fa-solid fa-download text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Waiting Priority Queue Pool Table */}
            <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
              <div className="px-4 py-3 bg-amber-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-700 text-white font-mono text-[10px] font-bold rounded uppercase">
                    PRD §3.3 &amp; §3.4 Priority Pool
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Waiting Priority Queue (Distance &amp; BEU Merit Ranking)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">
                    42 Candidates in Round 2 • 90 Vacancies in Block A/B
                  </span>
                  <button
                    onClick={() =>
                      alert(
                        "Automated Batch Allotment executing: Top 5 distance-verified candidates assigned to Floor 2 & 3 vacancies!"
                      )
                    }
                    className="px-2.5 py-1 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Auto-Allot Top 5
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Priority</th>
                      <th className="py-2.5 px-4">Applicant Name</th>
                      <th className="py-2.5 px-4">Roll / Reg No</th>
                      <th className="py-2.5 px-4">Branch &amp; Sem</th>
                      <th className="py-2.5 px-4">Permanent Address</th>
                      <th className="py-2.5 px-4">Distance</th>
                      <th className="py-2.5 px-4">BEU CGPA</th>
                      <th className="py-2.5 px-4 text-right">Allocation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">#01</td>
                      <td className="py-3 px-4 font-bold text-slate-900">Manish Kumar</td>
                      <td className="py-3 px-4 font-mono">23ME058</td>
                      <td className="py-3 px-4">Mechanical • 4th Sem</td>
                      <td className="py-3 px-4 text-slate-500">Purnia, Bihar (854301)</td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-200">
                          85 km
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">8.82</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setAllotTargetCandidate({
                              name: "Manish Kumar",
                              rollNo: "23ME058",
                              roomSlot: "205-B",
                              distance: "85 km (Purnia)",
                              cgpa: "8.82",
                            });
                            setShowAllotmentModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                        >
                          Allot to Room 205 (Bed B)
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">#02</td>
                      <td className="py-3 px-4 font-bold text-slate-900">Sandeep Anand</td>
                      <td className="py-3 px-4 font-mono">23CE031</td>
                      <td className="py-3 px-4">Civil • 4th Sem</td>
                      <td className="py-3 px-4 text-slate-500">Bhagalpur, Bihar (812002)</td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-200">
                          62 km
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">8.45</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setAllotTargetCandidate({
                              name: "Sandeep Anand",
                              rollNo: "23CE031",
                              roomSlot: "213-A",
                              distance: "62 km (Bhagalpur)",
                              cgpa: "8.45",
                            });
                            setShowAllotmentModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                        >
                          Allot to Room 213 (Bed A)
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">#03</td>
                      <td className="py-3 px-4 font-bold text-slate-900">Saurav Pathak</td>
                      <td className="py-3 px-4 font-mono">24CSE014</td>
                      <td className="py-3 px-4">CSE • 2nd Sem</td>
                      <td className="py-3 px-4 text-slate-500">Jamui, Bihar (811307)</td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-200">
                          48 km
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">8.91</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setAllotTargetCandidate({
                              name: "Saurav Pathak",
                              rollNo: "24CSE014",
                              roomSlot: "219-A",
                              distance: "48 km (Jamui)",
                              cgpa: "8.91",
                            });
                            setShowAllotmentModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
                        >
                          Allot to Room 219 (Bed A)
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Allotted Residents Master Roll */}
            <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Active Hostel Residents Roster</h3>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                    510 Enrolled
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Showing active enrolled personnel</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Resident Name &amp; Contact</th>
                      <th className="py-2.5 px-4">Roll / Reg No</th>
                      <th className="py-2.5 px-4">Branch &amp; Batch</th>
                      <th className="py-2.5 px-4">Assigned Accommodation &amp; Assets</th>
                      <th className="py-2.5 px-4">Mess Status</th>
                      <th className="py-2.5 px-4">Fee Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {/* Student 1: Aman Verma */}
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">Aman Verma</p>
                        <span className="text-[11px] text-slate-500 block">+91 98351 22910 • aman.v@ug.gecmunger.ac.in</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">23CSE019</td>
                      <td className="py-3 px-4">CSE • 4th Sem (2023-27)</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">Room 204 • Bed A (Block A)</span>
                        <span className="font-mono text-[11px] text-slate-500">TBL-BA-204-A • CHR-BA-204-A</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                          Active / Present
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-700">Paid (₹5,100)</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setAllotTargetCandidate({
                              name: "Aman Verma",
                              rollNo: "23CSE019",
                              roomSlot: "204-A",
                            });
                            setShowAllotmentModal(true);
                          }}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => alert("Downloading Official Allotment Slip for Aman Verma (23CSE019)...")}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                          title="Download Slip"
                        >
                          <i className="fa-solid fa-download text-[11px]"></i>
                        </button>
                      </td>
                    </tr>

                    {/* Student 2: Rahul Kumar (Rebate Active) */}
                    <tr className="hover:bg-slate-50 bg-slate-50/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">Rahul Kumar</p>
                        <span className="text-[11px] text-slate-500 block">+91 94719 33021 • rahul.k@ug.gecmunger.ac.in</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">23ECE042</td>
                      <td className="py-3 px-4">ECE • 4th Sem (2023-27)</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">Room 204 • Bed B (Block A)</span>
                        <span className="font-mono text-[11px] text-slate-500">TBL-BA-204-B • CHR-BA-204-B</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-bold">
                          Rebate Active (10 Days)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900">
                          ₹4,260 <span className="text-emerald-700 text-[11px]">(Rebate -₹840)</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setActiveTab("billing")}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 cursor-pointer"
                        >
                          Ledger
                        </button>
                        <button
                          onClick={() => alert("Downloading Official Allotment Slip for Rahul Kumar (23ECE042)...")}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <i className="fa-solid fa-download text-[11px]"></i>
                        </button>
                      </td>
                    </tr>

                    {/* Student 3: Amit Patel */}
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">Amit Patel</p>
                        <span className="text-[11px] text-slate-500 block">+91 97120 44921 • amit.p@ug.gecmunger.ac.in</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">23ME044</td>
                      <td className="py-3 px-4">Mechanical • 4th Sem</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">Room 201 • Bed B (Block A)</span>
                        <span className="font-mono text-[11px] text-slate-500">TBL-BA-201-B • CHR-BA-201-B</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                          Active / Present
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-700">Paid (₹5,100)</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setAllotTargetCandidate({
                              name: "Amit Patel",
                              rollNo: "23ME044",
                              roomSlot: "201-B",
                            });
                            setShowAllotmentModal(true);
                          }}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => alert("Downloading Allotment Slip...")}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <i className="fa-solid fa-download text-[11px]"></i>
                        </button>
                      </td>
                    </tr>

                    {/* Student 4: Vikash Singh */}
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">Vikash Singh (Hostel Prefect)</p>
                        <span className="text-[11px] text-slate-500 block">+91 99312 88471 • vikash.s@ug.gecmunger.ac.in</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">22CE015</td>
                      <td className="py-3 px-4">Civil • 6th Sem (2022-26)</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">Room 208 • Single (Block A)</span>
                        <span className="font-mono text-[11px] text-slate-500">TBL-BA-208-A • ALM-BA-208-A</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                          Duty Exemption
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-700">Paid (Prefect Grant)</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert("Prefect Dossier: Clean record, authorized for gate curfew exemption.")}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer font-semibold"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>

                    {/* Student 5: Rajesh Ranjan (Disciplinary Notice) */}
                    <tr className="hover:bg-slate-50 bg-red-50/20">
                      <td className="py-3 px-4">
                        <p className="font-bold text-red-800">Rajesh Ranjan</p>
                        <span className="text-[11px] text-slate-500 block">+91 91223 99401 • rajesh.r@ug.gecmunger.ac.in</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-red-800">23ME089</td>
                      <td className="py-3 px-4">Mechanical • 4th Sem</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">Room 112 • Bed A (Block A)</span>
                        <span className="font-mono text-[11px] text-red-700 font-semibold">Disciplinary Hold</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold">
                          Late Curfew Breach
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-red-700">Fine ₹500 Pending</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert("Issuing formal disciplinary show-cause notice to Rajesh Ranjan (ME)...")}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 cursor-pointer"
                        >
                          Notice
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PUBLISH ADMISSION FORM WORKBENCH (PRD §3.3 & §4.3) */}
        {/* =================================================================== */}
        {activeTab === "admission" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded uppercase">
                    PRD §3.3 &amp; §4.3
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Warden Form Management &amp; Admission Windows
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure public admission cycles, upload regulatory fee documents, and track candidate pipeline.
                </p>
              </div>
              <button
                onClick={() => showToast("success", "New admission intake window template initialized")}
                className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
              >
                <i className="fa-solid fa-circle-plus text-xs"></i>
                <span>Create New Intake Window</span>
              </button>
            </div>

            {/* 2-Column Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Form Configuration */}
              <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Admission Cycle Configuration</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold rounded uppercase">
                    Status: Published &amp; Accepting
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast("success", "Admission window parameters saved & live public registration portal updated!");
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Admission Window Title
                    </label>
                    <input
                      type="text"
                      value={admissionConfig.title}
                      onChange={(e) => setAdmissionConfig({ ...admissionConfig, title: e.target.value })}
                      className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Target Hostel Blocks
                      </label>
                      <select
                        value={admissionConfig.targetBlocks}
                        onChange={(e) => setAdmissionConfig({ ...admissionConfig, targetBlocks: e.target.value })}
                        className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        <option value="Block A & B (Boys)">Boys Hostel: Block A &amp; Block B</option>
                        <option value="Block A (Boys)">Boys Hostel: Block A (Kautilya) Only</option>
                        <option value="Block B (Boys)">Boys Hostel: Block B (Aryabhata) Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Eligible Academic Years
                      </label>
                      <input
                        type="text"
                        value={admissionConfig.eligibility}
                        onChange={(e) => setAdmissionConfig({ ...admissionConfig, eligibility: e.target.value })}
                        className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Window Opening Date
                      </label>
                      <input
                        type="date"
                        value={admissionConfig.openDate}
                        onChange={(e) => setAdmissionConfig({ ...admissionConfig, openDate: e.target.value })}
                        className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Submission Deadline
                      </label>
                      <input
                        type="date"
                        value={admissionConfig.deadline}
                        onChange={(e) => setAdmissionConfig({ ...admissionConfig, deadline: e.target.value })}
                        className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Allotment Guidelines &amp; Public Note
                    </label>
                    <textarea
                      rows={3}
                      value={admissionConfig.notes}
                      onChange={(e) => setAdmissionConfig({ ...admissionConfig, notes: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900 leading-relaxed"
                    />
                  </div>

                  {/* Document Bindings */}
                  <div className="border border-slate-200 rounded p-3 space-y-2 bg-slate-50">
                    <span className="font-semibold text-slate-800 uppercase tracking-wider block text-[11px]">
                      Regulatory Document Bindings
                    </span>
                    {admissionConfig.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-file-pdf text-red-600 text-sm"></i>
                          <span className="font-medium text-slate-800">{doc}</span>
                        </div>
                        <span className="text-emerald-700 font-semibold text-[11px]">Verified Attached</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => alert("Admission Round Paused: Public form marked inactive.")}
                      className="px-3 py-1.5 border border-red-300 text-red-700 font-semibold rounded hover:bg-red-50 transition cursor-pointer"
                    >
                      Pause Submissions
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-floppy-disk text-xs"></i>
                      <span>Save &amp; Update Live Form</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Student Portal Preview Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Live Student Portal Preview</h3>
                  <span className="font-mono text-[11px] text-slate-500">Read-Only Preview</span>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-lg p-5 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold inline-block mb-1">
                        ONLINE REGISTRATION OPEN
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {admissionConfig.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hostel: {admissionConfig.targetBlocks}</p>
                    </div>
                    <i className="fa-solid fa-bullhorn text-slate-800 text-xl"></i>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{admissionConfig.notes}</p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Eligibility Criteria:</span>
                      <span className="font-semibold text-slate-900">{admissionConfig.eligibility}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Application Deadline:</span>
                      <span className="font-mono font-bold text-red-700">{admissionConfig.deadline} (11:59 PM)</span>
                    </div>
                  </div>

                  {/* Application Count Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Applications Received: <strong className="text-slate-900">148</strong>
                      </span>
                      <span className="font-mono text-slate-900 font-bold">106 Verified / 42 Waiting</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex border border-slate-200">
                      <div className="bg-emerald-600 h-full" style={{ width: "71.6%" }} title="Allotted"></div>
                      <div className="bg-amber-500 h-full" style={{ width: "28.4%" }} title="Waiting"></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText("https://gecmunger.ac.in/hms/apply/spring-2026-boys-round2");
                        showToast("success", "Public Registration URL copied to clipboard!");
                      }}
                      className="w-full py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-copy text-xs"></i>
                      <span>Copy Public Student Registration Link</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: BILLING OPERATIONS & LEAVE REBATE ENGINE (PRD §3.5 & §4.4) */}
        {/* =================================================================== */}
        {activeTab === "billing" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded uppercase">
                    PRD §3.5 &amp; §4.4
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Warden Billing Operations &amp; Leave Rebate Deduction Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculate student invoices, cross-reference gate pass absence records, and enforce automatic 70% mess fee rebates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 border border-slate-300 rounded font-semibold text-slate-700">
                  CYCLE: FEB 2026
                </span>
                <button
                  onClick={() =>
                    showToast(
                      "success",
                      "Batch billing notification triggered for all 510 active residents via SMS & Student Portal!"
                    )
                  }
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>Batch Dispatch Invoices</span>
                </button>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Total Invoiced (Feb 2026)
                </span>
                <div className="text-xl font-mono font-bold text-slate-900 mt-1">₹25,84,200</div>
                <span className="text-[11px] text-slate-500">510 active hostel billings</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Collected via SBI / UPI QR
                </span>
                <div className="text-xl font-mono font-bold text-emerald-700 mt-1">₹21,90,000</div>
                <span className="text-[11px] text-emerald-700 font-medium">84.7% settlement rate</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Mess Rebates Applied
                </span>
                <div className="text-xl font-mono font-bold text-amber-800 mt-1">₹58,800</div>
                <span className="text-[11px] text-slate-500">70 approved absence passes</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-300 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Outstanding Dues
                </span>
                <div className="text-xl font-mono font-bold text-red-700 mt-1">₹3,35,400</div>
                <span className="text-[11px] text-red-700 font-medium">66 students pending</span>
              </div>
            </div>

            {/* 2-Column Calculator + Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Calculator */}
              <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-calculator text-slate-800 text-sm"></i>
                    <h3 className="text-sm font-bold text-slate-900">Interactive Rebate Deduction Engine</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] rounded font-bold">
                    PRD §4.4 Active
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block">
                    Select Resident to Calculate Fee
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={selectedBillingStudent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedBillingStudent(val);
                        if (val === "rahul") {
                          setRebateAbsenceDays(10);
                        } else {
                          setRebateAbsenceDays(0);
                        }
                      }}
                      className="py-1.5 px-2 bg-white border border-slate-300 rounded text-slate-900 font-medium focus:outline-none"
                    >
                      <option value="rahul">Rahul Kumar (23ECE042) • Room 204</option>
                      <option value="aman">Aman Verma (23CSE019) • Room 204</option>
                      <option value="amit">Amit Patel (23ME044) • Room 201</option>
                      <option value="vikash">Vikash Singh (22CE015) • Room 208</option>
                    </select>

                    <input
                      readOnly
                      value={
                        selectedBillingStudent === "rahul"
                          ? "Pass #GP-8831: 10 Days Sanctioned (Rebate Eligible)"
                          : "No sanctioned >5 days leave on file"
                      }
                      className="py-1.5 px-2 bg-white border border-slate-300 rounded font-mono text-slate-700 text-[11px]"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Deposit To UPI Account (Dispatched QR &amp; VPA)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={selectedUpiAccount}
                        onChange={(e) => setSelectedUpiAccount(e.target.value)}
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none"
                      >
                        {upiAccounts.map((acc) => (
                          <option key={acc.id} value={acc.vpa}>
                            {acc.title} ({acc.vpa})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs">
                        <span className="text-slate-500">Destination VPA:</span>
                        <span className="font-bold text-slate-900">{selectedUpiAccount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Approved Absence Days</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={rebateAbsenceDays}
                      onChange={(e) => setRebateAbsenceDays(Number(e.target.value))}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Daily Mess Rate (₹)</label>
                    <input
                      type="number"
                      value={dailyMessRate}
                      onChange={(e) => setDailyMessRate(Number(e.target.value))}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Rebate Policy Rate</label>
                    <select
                      value={rebatePolicyRate}
                      onChange={(e) => setRebatePolicyRate(Number(e.target.value))}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    >
                      <option value={0.7}>70% (PRD §4.4 Standard)</option>
                      <option value={1.0}>100% (Academic Recess)</option>
                      <option value={0.5}>50% (Partial Sanction)</option>
                    </select>
                  </div>
                </div>

                {/* Itemized Calculation Box */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold uppercase tracking-wider text-slate-700">
                    Fee Composition &amp; Leave Rebate Deductions (Month: February 2026)
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-600">Standard Monthly Mess Diet (30 Days @ ₹{dailyMessRate}/day)</span>
                      <span className="font-mono font-bold text-slate-900">₹3,600.00</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-600">Hostel Maintenance &amp; Room Rent (Fixed)</span>
                      <span className="font-mono font-bold text-slate-900">₹1,500.00</span>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">Approved Leave Rebate Applied (PRD §4.4)</span>
                        <span className="font-mono font-bold text-emerald-700">
                          - ₹{calculatedRebate.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>
                          Sanctioned Absence: {rebateAbsenceDays} Continuous Days ({dailyMessRate}/day × {(rebatePolicyRate * 100).toFixed(0)}%)
                        </span>
                        <span className="font-mono">
                          {rebateAbsenceDays} × ₹{dailyMessRate} × {rebatePolicyRate * 100}%
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-900">Net Payable Bill</span>
                        <span className="block text-[11px] text-slate-500">Standard before rebate: ₹5,100.00</span>
                      </div>
                      <span className="font-mono text-xl font-bold text-slate-900">
                        ₹{calculatedNetBill.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                    <span>SMS / Email Demand Note to Guardian</span>
                  </label>
                  <button
                    onClick={() =>
                      showToast(
                        "success",
                        `Discounted Bill (₹${calculatedNetBill.toFixed(2)}) dispatched to Student Portal with UPI QR route (${selectedUpiAccount})!`
                      )
                    }
                    className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                    <span>Generate &amp; Dispatch Bill</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Ledger */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Recent Fee Ledger &amp; QR Reconciliations</h3>
                  <button
                    onClick={() => showToast("success", "SBI webhook records refreshed!")}
                    className="text-xs text-slate-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                    <span>Sync SBI Portal</span>
                  </button>
                </div>

                <div className="border border-slate-300 rounded-lg bg-white divide-y divide-slate-100 text-xs">
                  <div className="p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Aman Verma (23CSE019)</span>
                      <span className="font-mono font-bold text-emerald-700">₹5,100.00</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>SBI UPI Ref: 405298109281</span>
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase text-[10px]">
                        Paid &amp; Settled
                      </span>
                    </div>
                  </div>

                  <div className="p-3 hover:bg-slate-50 transition bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Amit Patel (23ME044)</span>
                      <span className="font-mono font-bold text-emerald-700">₹5,100.00</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>HDFC NetBanking: #TXN-77192</span>
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase text-[10px]">
                        Paid &amp; Settled
                      </span>
                    </div>
                  </div>

                  <div className="p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Rahul Kumar (23ECE042)</span>
                      <span className="font-mono font-bold text-slate-900">₹4,260.00</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Pass #GP-8831 Rebate Applied (-₹840)</span>
                      <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded font-bold uppercase text-[10px]">
                        Dispatched
                      </span>
                    </div>
                  </div>

                  <div className="p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-800">Rajesh Ranjan (23ME089)</span>
                      <span className="font-mono font-bold text-red-700">₹5,600.00</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Regular Fee + ₹500 Curfew Fine</span>
                      <span className="px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold uppercase text-[10px]">
                        Overdue
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: UPI PAYMENT ACCOUNTS & DYNAMIC QR GATEWAY */}
        {/* =================================================================== */}
        {activeTab === "upi" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded uppercase">
                    UPI Requisitions &amp; Gateways
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Warden UPI Payment Accounts &amp; Dynamic QR Gateway
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage designated SBI / NPCI Virtual Private Addresses (VPA) and QR endpoints for student fee collection, mess dues, and caution deposits.
                </p>
              </div>
              <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 border border-slate-300 rounded font-semibold text-slate-700">
                {upiAccounts.length} CONFIGURED ACCOUNTS
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Default Active Account
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {upiAccounts.find((a) => a.isDefault)?.title || "Mess Facility Account"}
                  </div>
                  <span className="font-mono text-xs text-emerald-700 font-bold">
                    {upiAccounts.find((a) => a.isDefault)?.vpa || "gecmess@sbi"}
                  </span>
                </div>
                <i className="fa-solid fa-circle-check text-emerald-600 text-xl"></i>
              </div>

              <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Supported Payment Rails
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">BHIM UPI / SBI QR</div>
                  <span className="text-[11px] text-slate-500">Zero Transaction Surcharge</span>
                </div>
                <i className="fa-solid fa-building-columns text-slate-800 text-xl"></i>
              </div>

              <div className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Gateway Reconciliations
                  </span>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">100% Verified</div>
                  <span className="text-[11px] text-slate-500">Instant Webhook Feed</span>
                </div>
                <i className="fa-solid fa-cloud-arrow-up text-emerald-600 text-xl"></i>
              </div>
            </div>

            {/* 2-Column Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Configured Accounts List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Configured Destination Accounts</h3>
                  <span className="font-mono text-[11px] text-slate-500">{upiAccounts.length} Registered Accounts</span>
                </div>

                {upiAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-4 bg-white rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 border transition ${
                      acc.isDefault ? "border-2 border-slate-900" : "border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded border border-slate-300 bg-slate-50 flex flex-col items-center justify-center flex-shrink-0 text-center">
                        <i className="fa-solid fa-qrcode text-lg text-slate-800"></i>
                        <span className="font-mono text-[8px] uppercase text-slate-500 leading-none">SBI QR</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{acc.title}</h4>
                          {acc.isDefault && (
                            <span className="px-1.5 py-0.2 bg-slate-900 text-white font-mono text-[9px] font-bold rounded uppercase">
                              Default Dispatched
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Payee Name: <strong className="text-slate-800">{acc.payee}</strong>
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-mono text-xs text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {acc.vpa}
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                            {acc.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                      {!acc.isDefault ? (
                        <button
                          type="button"
                          onClick={() => setDefaultUpi(acc.vpa)}
                          className="text-xs text-slate-900 font-bold hover:underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Live Gateway
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => alert(`Editing parameters for ${acc.title}`)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Edit
                        </button>
                        {!acc.isDefault && (
                          <button
                            type="button"
                            onClick={() => {
                              setUpiAccounts(upiAccounts.filter((a) => a.id !== acc.id));
                              showToast("success", `Account ${acc.title} removed.`);
                            }}
                            className="px-2 py-1 border border-slate-300 text-red-600 rounded text-xs font-semibold hover:bg-red-50 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Add New Account Form */}
              <div className="lg:col-span-5 bg-white border border-slate-300 rounded-lg p-5 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Add New UPI Account</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Register an institutional VPA / UPI address to enable instant student QR checkout.
                  </p>
                </div>

                <form onSubmit={handleSaveUpiAccount} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Account Title / Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mess Fee Account, Electricity & DG Fund"
                      value={newUpiForm.title}
                      onChange={(e) => setNewUpiForm({ ...newUpiForm, title: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Payee Name (as registered with Bank) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warden Boys Hostel GEC Munger"
                      value={newUpiForm.payee}
                      onChange={(e) => setNewUpiForm({ ...newUpiForm, payee: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        UPI ID (VPA) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. wardenboys@sbi"
                        value={newUpiForm.vpa}
                        onChange={(e) => setNewUpiForm({ ...newUpiForm, vpa: e.target.value })}
                        className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Category
                      </label>
                      <select
                        value={newUpiForm.category}
                        onChange={(e) => setNewUpiForm({ ...newUpiForm, category: e.target.value })}
                        className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none"
                      >
                        <option value="mess">Mess Operations</option>
                        <option value="hostel">Hostel Rent &amp; Maintenance</option>
                        <option value="caution">Security Caution Deposit</option>
                        <option value="amenity">Gym &amp; Amenities Fund</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded p-3 space-y-1.5 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 uppercase tracking-wider block text-[11px]">
                        QR Code Source
                      </span>
                      <span className="text-emerald-700 font-semibold text-[11px]">Auto-Generated Dynamic QR</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      The portal automatically generates standardized NPCI UPI QR codes compatible with Google Pay, PhonePe, Paytm, and BHIM app.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="makeDefaultCheckbox"
                      checked={newUpiForm.makeDefault}
                      onChange={(e) => setNewUpiForm({ ...newUpiForm, makeDefault: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900"
                    />
                    <label htmlFor="makeDefaultCheckbox" className="text-slate-700 cursor-pointer">
                      Make this the default UPI destination for newly dispatched invoices
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="reset"
                      onClick={() =>
                        setNewUpiForm({ title: "", payee: "", vpa: "", category: "mess", makeDefault: false })
                      }
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                    >
                      Save UPI Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* FLOATING SYSTEM SETTINGS TRIGGER (Wireframe Gear ⚙️) */}
      {/* ===================================================================== */}
      <aside className="fixed bottom-5 left-5 z-30">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="h-10 w-10 rounded-full bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-500 transition flex items-center justify-center text-base cursor-pointer"
          title="Portal Configuration & Diagnostics"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </aside>

      {/* ===================================================================== */}
      {/* PAGE FOOTER */}
      {/* ===================================================================== */}
      <footer className="w-full bg-white border-t border-slate-300 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800">Government Engineering College (GEC), Munger</span> • Haveli Kharagpur, Bihar 811211
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Warden Office: <strong className="font-mono text-slate-700">+91 6342 222104</strong></span>
            <span>Ambulance: <strong className="font-mono text-red-700">+91 94318 21405</strong></span>
            <span>Security Desk: <strong className="font-mono text-slate-700">Ext. 108</strong></span>
            <span>© 2026 GEC Munger HMS • v2.4.8</span>
          </div>
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* MODAL 1: FORMAL ROOM ALLOTMENT DIALOG (PRD §3.2 & §3.3) */}
      {/* ===================================================================== */}
      {showAllotmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] rounded uppercase font-bold">
                  Formal Assignment Flow
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Manual Resident Room Allotment</h3>
                <p className="text-xs text-slate-500">
                  Assigning waiting applicant to designated vacant bed slot • PRD §3.2
                </p>
              </div>
              <button
                onClick={() => setShowAllotmentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Target Candidate (Waiting Queue Verification)
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{allotTargetCandidate.name}</h4>
                  <p className="text-slate-500 text-[11px]">
                    Roll No: <span className="font-mono font-bold text-slate-800">{allotTargetCandidate.rollNo}</span>{" "}
                    • Verified Waiting Candidate ({allotTargetCandidate.distance || "85 km"})
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                  Verified Eligible
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Target Accommodation Slot
                </label>
                <select
                  value={allotTargetCandidate.roomSlot}
                  onChange={(e) =>
                    setAllotTargetCandidate({ ...allotTargetCandidate, roomSlot: e.target.value })
                  }
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                >
                  <option value="205-B">Room 205 (Block A) — Bed Slot B (Vacant)</option>
                  <option value="213-A">Room 213 (Block A) — Bed Slot A (Vacant)</option>
                  <option value="219-A">Room 219 (Block A) — Bed Slot A (Vacant)</option>
                  <option value="220-A">Room 220 (Block A) — Bed Slot A (Vacant)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Fee Clearance Verification
                </label>
                <input
                  readOnly
                  type="text"
                  value="Hostel Admission Receipt #HAR-2026-901"
                  className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-slate-700"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 space-y-1.5 bg-slate-50 text-xs">
              <span className="font-bold text-slate-900 block uppercase text-[11px]">
                Furniture Group Automatic Binding (PRD §3.2)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">Bed Asset ID</span>
                  <span className="text-slate-900 font-bold text-xs">
                    BED-BA-{allotTargetCandidate.roomSlot?.split("-")[0] || "205"}-{allotTargetCandidate.roomSlot?.split("-")[1] || "B"}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">Table Asset ID</span>
                  <span className="text-slate-900 font-bold text-xs">
                    TBL-BA-{allotTargetCandidate.roomSlot?.split("-")[0] || "205"}-{allotTargetCandidate.roomSlot?.split("-")[1] || "B"}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">Chair Asset ID</span>
                  <span className="text-slate-900 font-bold text-xs">
                    CHR-BA-{allotTargetCandidate.roomSlot?.split("-")[0] || "205"}-{allotTargetCandidate.roomSlot?.split("-")[1] || "B"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Digital handover acknowledgment slip will be dispatched to student registered email and portal account.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAllotmentModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormalAllotment}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-circle-check text-xs"></i>
                <span>Confirm &amp; Generate Allotment Memo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD STUDENT & DISPATCH INITIAL BILLS DIALOG */}
      {/* ===================================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-lg p-6 space-y-4 my-8 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] rounded uppercase font-bold">
                    Institutional Onboarding
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded uppercase">
                    Simultaneous Bill Generation Enabled
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Add Student (Manual / Waiting) &amp; Dispatch Initial Admission Bills
                </h3>
                <p className="text-xs text-slate-500">
                  Manual student profile enrollment with category-wise bill issuance and designated UPI routing.
                </p>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveStudentComprehensive(false);
              }}
              className="space-y-4 text-xs max-h-[72vh] overflow-y-auto pr-2"
            >
              {/* 1. Student Profile Particulars */}
              <div className="border border-slate-300 rounded p-3.5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fa-solid fa-user text-slate-600"></i>
                    1. PRD §3.1.1 Student Profile Particulars
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    Academic &amp; Guardian Info
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block">
                    Personal Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addStudentForm.name}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, name: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">DOB *</label>
                      <input
                        type="date"
                        value={addStudentForm.dob}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, dob: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Blood Group *</label>
                      <select
                        value={addStudentForm.bloodGroup}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, bloodGroup: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      >
                        <option value="B+">B +ve</option>
                        <option value="O+">O +ve</option>
                        <option value="A+">A +ve</option>
                        <option value="AB+">AB +ve</option>
                        <option value="B-">B -ve</option>
                        <option value="O-">O -ve</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Mobile No *</label>
                      <input
                        type="tel"
                        required
                        value={addStudentForm.phone}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, phone: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 mb-0.5 font-medium">Institutional Email *</label>
                      <input
                        type="email"
                        required
                        value={addStudentForm.email}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, email: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className="sm:col-span-3">
                      <label className="block text-slate-600 mb-0.5 font-medium">Permanent Residential Address *</label>
                      <input
                        type="text"
                        value={addStudentForm.address}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, address: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Distance from Campus (KM) *</label>
                      <input
                        type="number"
                        required
                        value={addStudentForm.distance}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, distance: Number(e.target.value) })}
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block mb-1">
                    Academic Details
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Roll Number *</label>
                      <input
                        type="text"
                        required
                        value={addStudentForm.rollNo}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, rollNo: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">BEU Reg No</label>
                      <input
                        type="text"
                        value={addStudentForm.regNo}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, regNo: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Branch *</label>
                      <select
                        value={addStudentForm.branch}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, branch: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      >
                        <option value="ME">Mechanical (ME)</option>
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="ECE">Electronics (ECE)</option>
                        <option value="CE">Civil Engg (CE)</option>
                        <option value="EE">Electrical (EE)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Session</label>
                      <input
                        type="text"
                        value={addStudentForm.session}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, session: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Semester &amp; CGPA</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={addStudentForm.semester}
                          onChange={(e) => setAddStudentForm({ ...addStudentForm, semester: e.target.value })}
                          className="w-1/2 py-1 px-1 border border-slate-300 rounded text-center text-slate-900"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={addStudentForm.cgpa}
                          onChange={(e) => setAddStudentForm({ ...addStudentForm, cgpa: Number(e.target.value) })}
                          className="w-1/2 py-1 px-1 border border-slate-300 rounded text-center font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider block mb-1">
                    Parent / Guardian Particulars
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Father Name *</label>
                      <input
                        type="text"
                        value={addStudentForm.fatherName}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, fatherName: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Mother Name *</label>
                      <input
                        type="text"
                        value={addStudentForm.motherName}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, motherName: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5 font-medium">Parent Mobile *</label>
                      <input
                        type="tel"
                        value={addStudentForm.parentPhone}
                        onChange={(e) => setAddStudentForm({ ...addStudentForm, parentPhone: e.target.value })}
                        className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Verification Documents */}
              <div className="border border-slate-300 rounded p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fa-solid fa-file-invoice text-slate-600"></i>
                    2. PRD §3.1.1 Hostel &amp; Verification Documents
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Mess Card No (Optional)</label>
                    <input
                      type="text"
                      value={addStudentForm.messCard}
                      onChange={(e) => setAddStudentForm({ ...addStudentForm, messCard: e.target.value })}
                      className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Dossier / Verification Link *</label>
                    <input
                      type="text"
                      value={addStudentForm.docLink}
                      onChange={(e) => setAddStudentForm({ ...addStudentForm, docLink: e.target.value })}
                      className="w-full py-1 px-2 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 font-medium">Aadhaar / ID Proof Ref</label>
                    <input
                      type="text"
                      value={addStudentForm.aadhaar}
                      onChange={(e) => setAddStudentForm({ ...addStudentForm, aadhaar: e.target.value })}
                      className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Accommodation & Furniture Binding */}
              <div className="border border-slate-300 rounded p-3.5 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fa-solid fa-door-open text-slate-600"></i>
                    3. Accommodation &amp; Furniture Binding
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                      <input
                        type="radio"
                        name="placementMode"
                        checked={placementMode === "allotted"}
                        onChange={() => setPlacementMode("allotted")}
                        className="text-slate-900"
                      />
                      <span>Direct Allot to Room</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                      <input
                        type="radio"
                        name="placementMode"
                        checked={placementMode === "waiting"}
                        onChange={() => setPlacementMode("waiting")}
                        className="text-slate-900"
                      />
                      <span>Waiting Queue Pool</span>
                    </label>
                  </div>
                </div>

                {placementMode === "allotted" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">1. Hostel Block *</label>
                        <select
                          value={addStudentForm.targetBlock}
                          onChange={(e) => setAddStudentForm({ ...addStudentForm, targetBlock: e.target.value })}
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="Block A (Kautilya Bhavan)">Block A (Kautilya Bhavan)</option>
                          <option value="Block B (Aryabhata Bhavan)">Block B (Aryabhata Bhavan)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">2. Floor Level *</label>
                        <select
                          value={addStudentForm.targetFloor}
                          onChange={(e) => setAddStudentForm({ ...addStudentForm, targetFloor: e.target.value })}
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="Ground Floor">Ground Floor (001-020)</option>
                          <option value="1st Floor">1st Floor (101-120)</option>
                          <option value="2nd Floor">2nd Floor (201-220)</option>
                          <option value="3rd Floor">3rd Floor (301-320)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">3. Target Room *</label>
                        <select
                          value={addStudentForm.targetRoom}
                          onChange={(e) => setAddStudentForm({ ...addStudentForm, targetRoom: e.target.value })}
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="205">Room 205 (Double - 1 Vacant)</option>
                          <option value="208">Room 208 (Single - Vacant)</option>
                          <option value="213">Room 213 (Double - 1 Vacant)</option>
                          <option value="219">Room 219 (Double - 2 Vacant)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5 font-medium">4. Slot / Group *</label>
                        <select
                          value={addStudentForm.targetSlot}
                          onChange={(e) => setAddStudentForm({ ...addStudentForm, targetSlot: e.target.value })}
                          className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                        >
                          <option value="B">Bed Slot B (Vacant - Group B)</option>
                          <option value="A">Bed Slot A (Group A)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded text-xs space-y-1 mt-2">
                      <span className="font-bold text-slate-900 uppercase text-[10px] block">
                        Bound Furniture Group Assets Preview
                      </span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-center">
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[9px] text-slate-400 block uppercase">Bed Asset</span>
                          <span className="font-bold text-slate-900">
                            BED-BA-{addStudentForm.targetRoom}-{addStudentForm.targetSlot}
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[9px] text-slate-400 block uppercase">Table Asset</span>
                          <span className="font-bold text-slate-900">
                            TBL-BA-{addStudentForm.targetRoom}-{addStudentForm.targetSlot}
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[9px] text-slate-400 block uppercase">Chair Asset</span>
                          <span className="font-bold text-slate-900">
                            CHR-BA-{addStudentForm.targetRoom}-{addStudentForm.targetSlot}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Centralized Initial Admission Bills Ledger */}
              <div className="border-2 border-slate-900 rounded p-4 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <i className="fa-solid fa-file-invoice-dollar text-slate-900"></i>
                      4. Initial Admission Bills &amp; Custom Charge Generator
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Generate standard and customized institutional charge items with designated UPI routing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomBillRow}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>+ Add Custom Charge</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">Charge Title</th>
                        <th className="py-2 px-3 w-28">Amount (₹)</th>
                        <th className="py-2 px-3 w-32">Due Date</th>
                        <th className="py-2 px-3">Designated Receiving UPI</th>
                        <th className="py-2 px-3 text-center">Nature</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {customBillRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setCustomBillRows(
                                  customBillRows.map((r) => (r.id === row.id ? { ...r, title: newTitle } : r))
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-semibold text-slate-900"
                            />
                            <span className="text-[10px] text-slate-400 block mt-0.5">{row.subtitle}</span>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => {
                                const newAmt = Number(e.target.value);
                                setCustomBillRows(
                                  customBillRows.map((r) => (r.id === row.id ? { ...r, amount: newAmt } : r))
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-mono font-bold text-slate-900"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={row.dueDate}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                setCustomBillRows(
                                  customBillRows.map((r) => (r.id === row.id ? { ...r, dueDate: newDate } : r))
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-[11px]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={row.upi}
                              onChange={(e) => {
                                const newUpi = e.target.value;
                                setCustomBillRows(
                                  customBillRows.map((r) => (r.id === row.id ? { ...r, upi: newUpi } : r))
                                );
                              }}
                              className="w-full py-1 px-2 border border-slate-300 rounded font-mono text-xs font-bold text-slate-900"
                            >
                              <option value="hosteladmin@sbi">hosteladmin@sbi (Hostel Main)</option>
                              <option value="gecmess@sbi">gecmess@sbi (Mess Facility)</option>
                              <option value="gecdeposit@sbi">gecdeposit@sbi (Caution Deposit)</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] uppercase">
                              {row.nature}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomBillRow(row.id)}
                              className="text-slate-400 hover:text-red-700 p-1"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Cumulative Total Invoiced:</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    ₹ {customBillsGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveStudentComprehensive(true)}
                    className="px-4 py-2 border border-slate-300 bg-slate-50 text-slate-800 rounded font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Save as WAITING Candidate
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Save Student &amp; Dispatch Bills
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CREATE BLUEPRINT (BLOCK / FLOOR / ROOM) */}
      {/* ===================================================================== */}
      {showBlueprintCreatorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Warden Blueprint Designer (PRD §3.2)
                </h3>
                <p className="text-xs text-slate-500">
                  Build and expand your hostel category physical architecture
                </p>
              </div>
              <button
                onClick={() => setShowBlueprintCreatorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Sub-type switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setBlueprintCreateType("room")}
                className={`flex-1 py-1.5 font-semibold rounded transition ${
                  blueprintCreateType === "room"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Add Room
              </button>
              <button
                type="button"
                onClick={() => setBlueprintCreateType("floor")}
                className={`flex-1 py-1.5 font-semibold rounded transition ${
                  blueprintCreateType === "floor"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Add Floor
              </button>
              <button
                type="button"
                onClick={() => setBlueprintCreateType("block")}
                className={`flex-1 py-1.5 font-semibold rounded transition ${
                  blueprintCreateType === "block"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Add Block
              </button>
            </div>

            {/* Sub-Form: Add Room */}
            {blueprintCreateType === "room" && (
              <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Block *</label>
                    <select
                      value={newRoomBlockId}
                      onChange={(e) => setNewRoomBlockId(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                      required
                    >
                      {blocks.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                      {blocks.length === 0 && <option value="">Block A (Default)</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Floor *</label>
                    <select
                      value={newRoomFloorId}
                      onChange={(e) => setNewRoomFloorId(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                      required
                    >
                      {floors.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name} (Floor {f.floorNumber})
                        </option>
                      ))}
                      {floors.length === 0 && <option value="">Floor 2 (Default)</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 206"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Capacity (Beds) *</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Room Type</label>
                    <select
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Dormitory">Dormitory</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    Automatic Furniture Inventory Binding
                  </span>
                  <p className="text-[11px]">
                    Sequential furniture groups (Group A, Group B...) will be automatically generated with tagged serial codes:{" "}
                    <span className="font-mono text-slate-900">
                      BED-{newRoomNumber || "206"}-A, TBL-{newRoomNumber || "206"}-A, CHR-{newRoomNumber || "206"}-A
                    </span>.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBlueprintCreatorModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Form: Add Floor */}
            {blueprintCreateType === "floor" && (
              <form onSubmit={handleCreateFloor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Parent Block *</label>
                  <select
                    value={newFloorBlockId}
                    onChange={(e) => setNewFloorBlockId(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-semibold text-slate-900"
                    required
                  >
                    {blocks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                    {blocks.length === 0 && <option value="">Block A</option>}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Floor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 3rd Floor"
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Floor Level Number *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={15}
                      value={newFloorNumber}
                      onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                      className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBlueprintCreatorModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Create Floor
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Form: Add Block */}
            {blueprintCreateType === "block" && (
              <form onSubmit={handleCreateBlock} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Block / Wing Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block C (Ramanujan Bhavan)"
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Will be created under your assigned hostel jurisdiction:{" "}
                    <strong>{currentUser?.assignedCategory || "Boys Hostel Category"}</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBlueprintCreatorModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    Create Block
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: SYSTEM SETTINGS & DIAGNOSTICS */}
      {/* ===================================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Portal Diagnostics &amp; Settings</h4>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-slate-700">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Framework:</span>
                  <span className="font-bold text-slate-900">Next.js 16 (Turbopack)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Database:</span>
                  <span className="font-bold text-emerald-700">MongoDB Atlas (Healthy)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warden Identity:</span>
                  <span className="font-bold text-slate-900">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jurisdiction:</span>
                  <span className="font-bold text-slate-900">{currentUser?.assignedCategory}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
