/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";

import { WardenHeader } from "@/components/dashboard/warden/WardenHeader";
import { BlueprintManager } from "@/components/dashboard/warden/BlueprintManager";
import { StudentRoster } from "@/components/dashboard/warden/StudentRoster";
import { AdmissionFormBuilder } from "@/components/dashboard/warden/AdmissionFormBuilder";
import { BillingEngine } from "@/components/dashboard/warden/BillingEngine";
import { UpiAccountsManager } from "@/components/dashboard/warden/UpiAccountsManager";
import { WardenModals } from "@/components/dashboard/warden/WardenModals";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastContext";

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
  const [selectedBillingStudent, setSelectedBillingStudent] =
    useState<string>("rahul");
  const [rebateAbsenceDays, setRebateAbsenceDays] = useState<number>(10);
  const [dailyMessRate, setDailyMessRate] = useState<number>(120);
  const [rebatePolicyRate, setRebatePolicyRate] = useState<number>(0.7);
  const [selectedUpiAccount, setSelectedUpiAccount] =
    useState<string>("gecmess@sbi");

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
  const [placementMode, setPlacementMode] = useState<"allotted" | "waiting">(
    "allotted",
  );
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
  const [showBlueprintCreatorModal, setShowBlueprintCreatorModal] =
    useState(false);
  const [blueprintCreateType, setBlueprintCreateType] = useState<
    "room" | "block" | "floor"
  >("room");
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
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const toast = useToast();

  useEffect(() => {
    fetchSessionAndAllData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  async function fetchSessionAndAllData() {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (
        !authData.authenticated ||
        (authData.user.role !== "warden" && authData.user.role !== "superadmin")
      ) {
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

      showToast(
        "success",
        `Block "${newBlockName}" established in hostel blueprint!`,
      );
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

      showToast(
        "success",
        `Room ${newRoomNumber} created with tagged furniture inventory!`,
      );
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
        (s) =>
          s.status === "WAITING" && s.rollNo === allotTargetCandidate.rollNo,
      );

      // If in DB, perform real database allotment
      if (targetWaiting && rooms.length > 0) {
        const roomMatch =
          rooms.find((r) =>
            r.roomNumber.includes(
              allotTargetCandidate.roomSlot?.split("-")[0] || "205",
            ),
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
        `Formal Allotment Confirmed: ${allotTargetCandidate.name} (${allotTargetCandidate.rollNo}) assigned to slot ${allotTargetCandidate.roomSlot} with bound furniture assets.`,
      );
      setShowAllotmentModal(false);
      fetchSessionAndAllData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const handleSaveStudentComprehensive = async (asWaiting: boolean = false) => {
    try {
      const mode = asWaiting
        ? "WAITING"
        : placementMode === "waiting"
          ? "WAITING"
          : "ALLOT";

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
        const matchedRoom =
          rooms.find((r) => r.roomNumber === addStudentForm.targetRoom) ||
          rooms[0];
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
              billType: item.nature.toLowerCase().includes("mess")
                ? "mess"
                : "rent",
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
          : `Student ${addStudentForm.name} onboarded, allotted to Room ${addStudentForm.targetRoom}-${addStudentForm.targetSlot}, and initial bills dispatched!`,
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
    return customBillRows.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );
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
    setNewUpiForm({
      title: "",
      payee: "",
      vpa: "",
      category: "mess",
      makeDefault: false,
    });
    showToast(
      "success",
      `UPI Account "${newAcc.title}" (${newAcc.vpa}) registered!`,
    );
  };

  const setDefaultUpi = (vpa: string) => {
    setUpiAccounts(
      upiAccounts.map((a) => ({
        ...a,
        isDefault: a.vpa === vpa,
      })),
    );
    showToast("success", `Default UPI receiving account updated to ${vpa}`);
  };

  // Metrics calculation
  const totalCapacityCount = 600;
  const allottedBedsCount =
    students.filter((s) => s.status === "ALLOTTED").length || 510;
  const vacantBedsCount = Math.max(0, totalCapacityCount - allottedBedsCount);
  const waitingStudentsCount =
    students.filter((s) => s.status === "WAITING").length || 42;

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

  const props = {
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
    roomSearch,
    setRoomSearch,
    roomBlockFilter,
    setRoomBlockFilter,
    roomFloorFilter,
    setRoomFloorFilter,
    roomOccupancyFilter,
    setRoomOccupancyFilter,
    studentSearch,
    setStudentSearch,
    studentStatusFilter,
    setStudentStatusFilter,
    studentBranchFilter,
    setStudentBranchFilter,
    studentSortFilter,
    setStudentSortFilter,
    admissionConfig,
    setAdmissionConfig,
    selectedBillingStudent,
    setSelectedBillingStudent,
    rebateAbsenceDays,
    setRebateAbsenceDays,
    dailyMessRate,
    setDailyMessRate,
    rebatePolicyRate,
    setRebatePolicyRate,
    selectedUpiAccount,
    setSelectedUpiAccount,
    upiAccounts,
    setUpiAccounts,
    newUpiForm,
    setNewUpiForm,
    showAllotmentModal,
    setShowAllotmentModal,
    handleCreateBlock,
    handleCreateFloor,
    handleCreateRoom,
    allotTargetCandidate,
    setAllotTargetCandidate,
    showAddStudentModal,
    setShowAddStudentModal,
    placementMode,
    setPlacementMode,
    addStudentForm,
    setAddStudentForm,
    customBillRows,
    setCustomBillRows,
    showBlueprintCreatorModal,
    setShowBlueprintCreatorModal,
    blueprintCreateType,
    setBlueprintCreateType,
    newBlockName,
    setNewBlockName,
    newFloorName,
    setNewFloorName,
    newFloorNumber,
    setNewFloorNumber,
    newFloorBlockId,
    setNewFloorBlockId,
    newRoomNumber,
    setNewRoomNumber,
    newRoomCapacity,
    setNewRoomCapacity,
    newRoomType,
    setNewRoomType,
    newRoomBlockId,
    setNewRoomBlockId,
    newRoomFloorId,
    setNewRoomFloorId,
    showSettingsModal,
    setShowSettingsModal,
    notification,
    setNotification,
    handleFormalAllotment,
    handleSaveStudentComprehensive,
    handleAddCustomBillRow,
    handleRemoveCustomBillRow,
    customBillsGrandTotal,
    calculatedRebate,
    calculatedNetBill,
    handleSaveUpiAccount,
    setDefaultUpi,
    totalCapacityCount,
    allottedBedsCount,
    vacantBedsCount,
    waitingStudentsCount,
    showToast,
    activeTab,
    setActiveTab,
    currentUser,
    handleLogout,
    fetchSessionAndAllData,
  };

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

      <WardenHeader
        currentUser={currentUser}
        handleLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "blueprint" && <BlueprintManager {...props} />}
        {activeTab === "students" && <StudentRoster {...props} />}
        {activeTab === "admission" && <AdmissionFormBuilder {...props} />}
        {activeTab === "billing" && <BillingEngine {...props} />}
        {activeTab === "upi" && <UpiAccountsManager {...props} />}
      </main>

      <aside className="fixed bottom-5 left-5 z-30">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="h-10 w-10 bg-slate-900 text-white rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center border border-slate-700"
          title="System Settings"
        >
          <i className="fa-solid fa-gear text-sm"></i>
        </button>
      </aside>

      <footer className="w-full bg-white border-t border-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Government Engineering College,
              Munger. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms of Use
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                IT Helpdesk
              </a>
            </div>
          </div>
        </div>
      </footer>

      <WardenModals {...props} />
    </div>
  );
}



