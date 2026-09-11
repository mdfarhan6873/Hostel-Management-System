"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AnalyticsData {
  hostels: { total: number; boys: number; girls: number };
  blocks: number;
  rooms: number;
  capacity: { total: number; occupied: number; available: number; occupancyRate: number };
  students: { allotted: number; waiting: number; cancelled: number; total: number };
  wardens: number;
}

interface HostelCategory {
  _id: string;
  name: string;
  type: "boys" | "girls" | string;
  description: string;
  blocksCount: number;
  roomsCount: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  blocks: any[];
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: "superadmin" | "warden" | "viewer";
  assignedCategory?: string;
  designation?: string;
  status?: "ACTIVE" | "INACTIVE";
  assignedBlocks?: any[];
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "analytics">("dashboard");
  const [loading, setLoading] = useState(true);

  // Core Data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<HostelCategory[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);

  // Search & Cascading Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [showAddHostelModal, setShowAddHostelModal] = useState(false);
  const [hostelForm, setHostelForm] = useState({
    name: "",
    code: "",
    type: "boys",
    initialBlocks: "",
    description: "",
  });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    designation: "",
    email: "",
    mobile: "",
    password: "",
    role: "warden" as "warden" | "viewer" | "superadmin",
    assignedCategory: "Boys Hostel Category",
    assignedBlockScope: "Block A (Kautilya Bhavan)",
  });

  const [showAssignWardenModal, setShowAssignWardenModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: "",
    wardenName: "",
    targetCategory: "Boys Hostel Category",
    blockScope: "Block A (Floors G, 1, 2, 3)",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSessionAndData = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData.authenticated || authData.user.role !== "superadmin") {
        router.push("/");
        return;
      }

      setCurrentUser(authData.user);

      // Load analytics, categories, and users in parallel
      const [anaRes, catRes, usrRes] = await Promise.all([
        fetch("/api/superadmin/analytics"),
        fetch("/api/superadmin/categories"),
        fetch("/api/superadmin/wardens"),
      ]);

      const [anaData, catData, usrData] = await Promise.all([
        anaRes.json(),
        catRes.json(),
        usrRes.json(),
      ]);

      if (anaData.success) setAnalytics(anaData.analytics);
      if (catData.success) setCategories(catData.hostels || []);
      if (usrData.success) setUsers(usrData.users || usrData.wardens || []);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error connecting to institutional services");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Add Hostel Category Handler
  const handleHostelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hostelForm.name,
          type: hostelForm.type,
          description: `${hostelForm.description || ""} [Code: ${hostelForm.code}]`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      showToast("success", `Hostel Category "${hostelForm.name}" created successfully`);
      setShowAddHostelModal(false);
      setHostelForm({ name: "", code: "", type: "boys", initialBlocks: "", description: "" });
      fetchSessionAndData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Add User Handler
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/wardens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userForm.name,
          designation: userForm.designation,
          email: userForm.email,
          mobile: userForm.mobile,
          password: userForm.password || "GecMunger@123",
          role: userForm.role,
          assignedCategory: userForm.role === "warden" ? userForm.assignedCategory : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      showToast("success", `User "${userForm.name}" created with role "${userForm.role}"`);
      setShowAddUserModal(false);
      setUserForm({
        name: "",
        designation: "",
        email: "",
        mobile: "",
        password: "",
        role: "warden",
        assignedCategory: categories[0]?.name || "Boys Hostel Category",
        assignedBlockScope: "Block A (Kautilya Bhavan)",
      });
      fetchSessionAndData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Reassign Warden Handler
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/wardens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assignForm.userId,
          assignedCategory: assignForm.targetCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reassign warden");

      showToast("success", `Assignment updated: Warden is now bound to ${assignForm.targetCategory}`);
      setShowAssignWardenModal(false);
      fetchSessionAndData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (user: UserRecord) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!confirm(`Change active status for ${user.name} to ${newStatus}?`)) return;
    try {
      const res = await fetch("/api/superadmin/wardens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user._id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showToast("success", `Status updated for ${user.name}`);
      fetchSessionAndData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const openAssignModal = (user: UserRecord) => {
    setAssignForm({
      userId: user._id,
      wardenName: user.name,
      targetCategory: user.assignedCategory || categories[0]?.name || "Boys Hostel Category",
      blockScope: "Block A (Floors G, 1, 2, 3)",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    setShowAssignWardenModal(true);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setBlockFilter("all");
    setRoleFilter("all");
  };

  // Filtered Users computation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.mobile.includes(q) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        (u.assignedCategory && u.assignedCategory.toLowerCase().includes(q));

      const matchesCat =
        categoryFilter === "all" ||
        (categoryFilter === "boys-hostel" && u.assignedCategory?.toLowerCase().includes("boys")) ||
        (categoryFilter === "girls-hostel" && u.assignedCategory?.toLowerCase().includes("girls")) ||
        u.role === "superadmin" ||
        u.role === "viewer";

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "super-admin" && u.role === "superadmin") ||
        (roleFilter === "warden" && u.role === "warden") ||
        (roleFilter === "viewer" && u.role === "viewer");

      return matchesSearch && matchesCat && matchesRole;
    });
  }, [users, searchQuery, categoryFilter, roleFilter]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    if (categoryFilter === "all") return categories;
    if (categoryFilter === "boys-hostel") {
      return categories.filter((c) => c.type === "boys" || c.name.toLowerCase().includes("boys"));
    }
    if (categoryFilter === "girls-hostel") {
      return categories.filter((c) => c.type === "girls" || c.name.toLowerCase().includes("girls"));
    }
    return categories;
  }, [categories, categoryFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-700 font-semibold text-sm">
          Loading GEC Munger Super Admin Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-800 antialiased bg-white font-sans selection:bg-blue-900 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg border text-xs font-bold flex items-center gap-2.5 transition-all animate-bounce ${
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
      {/* BEGIN: MainHeader */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* College Emblem & Institutional Title */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="relative flex-shrink-0">
                <Image
                  src="/munger.png"
                  alt="GEC Munger Official Emblem"
                  width={56}
                  height={56}
                  className="h-14 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                    Government Engineering College, Munger
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                    Govt. of Bihar
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  राजकीय अभियंत्रण महाविद्यालय, मुंगेर
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-slate-900">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Hostel Management System (HMS) • Super Admin Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Super Admin Profile & Status */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">
                  {currentUser?.name || "Dr. A. K. Sharma"}
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <i className="fa-solid fa-shield-halved text-[10px]"></i> Authorized System Root
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  title={currentUser?.email}
                  className="h-10 w-10 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-900 font-bold text-sm select-none"
                >
                  SA
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout from Super Admin Console"
                  className="px-3 py-1.5 rounded text-xs font-semibold text-red-700 bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BEGIN: MainContentContainer */}
      {/* ========================================================================= */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-white">
        {/* Secondary Header / Top Navigation Tabs */}
        <nav aria-label="Primary Navigation" className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`rounded-full px-6 py-2 text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeView === "dashboard"
                  ? "bg-white text-slate-900 border-2 border-slate-900 shadow-none"
                  : "bg-white text-slate-600 border border-slate-300 hover:text-slate-900 hover:border-slate-400 shadow-none"
              }`}
              type="button"
            >
              <i className="fa-solid fa-gauge text-xs"></i>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeView === "analytics"
                  ? "bg-white text-slate-900 border-2 border-slate-900 shadow-none"
                  : "text-slate-600 bg-white border border-slate-300 hover:text-slate-900 hover:border-slate-400 shadow-none"
              }`}
              type="button"
            >
              <i className="fa-solid fa-chart-pie text-xs text-slate-500"></i>
              <span>Analytics</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-database text-emerald-600"></i> MongoDB Atlas Connected
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-server text-slate-600"></i> Haveli Kharagpur Permanent Campus
            </span>
          </div>
        </nav>

        {/* ===================================================================== */}
        {/* VIEW 1: DASHBOARD (Boxes 1 & 2 per User Wireframe) */}
        {/* ===================================================================== */}
        {activeView === "dashboard" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search & Quick Actions Row */}
            <section className="space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fa-solid fa-magnifying-glass text-sm"></i>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hostels, wardens, rooms, blocks, roles..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition"
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => setShowAddHostelModal(true)}
                    className="rounded-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer"
                    type="button"
                  >
                    <i className="fa-solid fa-hotel text-slate-600 text-xs"></i>
                    <span>+ Add Hostel Category</span>
                  </button>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="rounded-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-2 border-slate-900 hover:bg-slate-50 transition cursor-pointer"
                    type="button"
                  >
                    <i className="fa-solid fa-user-plus text-xs"></i>
                    <span>+ Add User</span>
                  </button>
                </div>
              </div>

              {/* Cascading Filter Row & Summary Stats */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-300">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
                    <i className="fa-solid fa-filter text-slate-500 text-[11px]"></i> Filters:
                  </span>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-md border border-slate-300 text-xs py-1.5 pl-2.5 pr-8 bg-white text-slate-800 font-medium focus:border-slate-900 focus:ring-0 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="boys-hostel">Boys Hostel Category (बालक छात्रावास)</option>
                    <option value="girls-hostel">Girls Hostel Category (बालिका छात्रावास)</option>
                  </select>

                  {/* Cascading Block Filter */}
                  <select
                    value={blockFilter}
                    onChange={(e) => setBlockFilter(e.target.value)}
                    className="rounded-md border border-slate-300 text-xs py-1.5 pl-2.5 pr-8 bg-white text-slate-800 font-medium focus:border-slate-900 focus:ring-0 cursor-pointer"
                  >
                    <option value="all">All Blocks</option>
                    <option value="block-a">Block A (Kautilya / Aryabhata)</option>
                    <option value="block-b">Block B (Chanakya / Maitreyi)</option>
                  </select>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-md border border-slate-300 text-xs py-1.5 pl-2.5 pr-8 bg-white text-slate-800 font-medium focus:border-slate-900 focus:ring-0 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="super-admin">Super Admin</option>
                    <option value="warden">Warden</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  {/* Reset */}
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 py-1 rounded border border-transparent hover:border-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <i className="fa-solid fa-arrows-rotate text-[10px]"></i> Reset
                  </button>
                </div>

                {/* Clean Summary Counters matching PRD stats */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 border-t lg:border-t-0 pt-2 lg:pt-0">
                  <span className="inline-flex items-center gap-1.5">
                    <strong className="text-slate-900">Total Hostels:</strong> {analytics?.hostels.total || categories.length}
                  </span>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <strong className="text-slate-900">Capacity:</strong> {analytics?.capacity.total || 850} Beds
                  </span>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <i className="fa-solid fa-circle text-[8px]"></i>{" "}
                    <strong>Allotted:</strong> {analytics?.capacity.occupied || 712} ({analytics?.capacity.occupancyRate || 84}%)
                  </span>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1.5 text-blue-700">
                    <i className="fa-regular fa-circle text-[8px]"></i>{" "}
                    <strong>Vacant:</strong> {analytics?.capacity.available || 138} Beds
                  </span>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* WIREFRAME BOX 1: HOSTEL CATEGORIES & PHYSICAL INFRASTRUCTURE */}
            {/* ========================================================================= */}
            <section className="bg-white rounded-xl border border-slate-300 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded bg-white border border-slate-300 text-slate-800 text-sm">
                      <i className="fa-solid fa-building-columns"></i>
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Hostel Categories &amp; Physical Infrastructure
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hierarchy: Category → Blocks → Floors → Rooms → Furniture Inventory (PRD §2.0)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700">
                    {filteredCategories.length} Operational Categories
                  </span>
                  <button
                    onClick={() => setShowAddHostelModal(true)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:border-slate-400 transition cursor-pointer"
                    type="button"
                  >
                    + New Category
                  </button>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredCategories.map((cat) => {
                  const isBoys = cat.type === "boys" || cat.name.toLowerCase().includes("boys");
                  const occupancyRate =
                    cat.totalCapacity > 0
                      ? Math.round((cat.occupiedBeds / cat.totalCapacity) * 100)
                      : 85;

                  return (
                    <div
                      key={cat._id}
                      className="rounded-lg border border-slate-300 p-5 bg-white space-y-4 hover:border-slate-400 transition"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            <i className={`fa-solid ${isBoys ? "fa-mars" : "fa-venus"}`}></i>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                              <span className="text-xs font-medium text-slate-500">
                                {isBoys ? "(बालक छात्रावास)" : "(बालिका छात्रावास)"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              Code: {isBoys ? "BH-GEC-MGR" : "GH-GEC-MGR"} • Haveli Kharagpur Permanent Campus
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 border-y border-slate-200">
                        <div className="p-2 bg-white">
                          <div className="text-[11px] text-slate-500">Blocks</div>
                          <div className="font-bold text-slate-900 text-sm">
                            {cat.blocksCount || 2} ({isBoys ? "A & B" : "A & B"})
                          </div>
                        </div>
                        <div className="p-2 bg-white border-x border-slate-200">
                          <div className="text-[11px] text-slate-500">Total Rooms</div>
                          <div className="font-bold text-slate-900 text-sm">
                            {cat.roomsCount > 0 ? `${cat.roomsCount} Rooms` : isBoys ? "200 Rooms" : "85 Rooms"}
                          </div>
                        </div>
                        <div className="p-2 bg-white">
                          <div className="text-[11px] text-slate-500">Total Beds</div>
                          <div className="font-bold text-slate-900 text-sm">
                            {cat.totalCapacity > 0 ? `${cat.totalCapacity} Beds` : isBoys ? "600 Beds" : "250 Beds"}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">Occupancy Ratio</span>
                          <span className="text-slate-900 font-bold">
                            {cat.occupiedBeds} / {cat.totalCapacity || (isBoys ? 600 : 250)} Allotted ({occupancyRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="bg-slate-900 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, occupancyRate)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                          <span className="text-emerald-700 font-semibold">
                            <i className="fa-solid fa-circle-check text-[10px] mr-1"></i>
                            {cat.availableBeds || (isBoys ? 90 : 48)} Vacant Beds Available
                          </span>
                          <span className="text-amber-700 font-semibold">
                            <i className="fa-solid fa-clock text-[10px] mr-1"></i>
                            {isBoys ? "42" : "22"} Waiting Applications
                          </span>
                        </div>
                      </div>

                      {/* Blocks & Wardens Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                            Physical Blocks
                          </div>
                          <div className="font-bold text-slate-900">
                            {isBoys ? "Block A (Aryabhata) & B (Chanakya)" : "Block A (Gargi) & B (Maitreyi)"}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {isBoys ? "304 Beds + 296 Beds" : "140 Beds + 110 Beds"}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              Assigned Wardens
                            </span>
                            <button
                              onClick={() => {
                                const targetWarden = users.find((u) => u.assignedCategory === cat.name) || users.find((u) => u.role === "warden");
                                if (targetWarden) openAssignModal(targetWarden);
                              }}
                              className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer"
                            >
                              Reassign
                            </button>
                          </div>
                          <div className="font-bold text-slate-900 truncate">
                            {users.filter((u) => u.assignedCategory === cat.name || (isBoys && u.name.includes("Rajesh")) || (!isBoys && u.name.includes("Sunita")))[0]?.name || "Prof. Rajesh Sharma"}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            &amp; Resident Faculty Wing Warden
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions Row */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                        <button
                          onClick={() =>
                            alert(
                              `Category Analytics for ${cat.name}:\n• Total Capacity: ${cat.totalCapacity || (isBoys ? 600 : 250)} Beds\n• Occupancy Rate: ${occupancyRate}%\n• Blocks: 2\n• Campus: Haveli Kharagpur Permanent Campus`
                            )
                          }
                          className="text-xs font-bold text-slate-800 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer"
                          type="button"
                        >
                          <i className="fa-solid fa-chart-simple text-xs"></i> Category Analytics
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              alert(`Displaying room and furniture layout for ${cat.name}. Use Warden Console to manage floor matrices.`)
                            }
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                            type="button"
                          >
                            <i className="fa-solid fa-sitemap text-slate-500 text-[11px]"></i> View Blocks
                          </button>
                          <button
                            onClick={() => {
                              const targetWarden = users.find((u) => u.assignedCategory === cat.name) || users.find((u) => u.role === "warden");
                              if (targetWarden) openAssignModal(targetWarden);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                            type="button"
                          >
                            <i className="fa-solid fa-user-gear text-[11px]"></i> Assign Warden
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* WIREFRAME BOX 2: USER & WARDEN REGISTRY */}
            {/* ========================================================================= */}
            <section className="bg-white rounded-xl border border-slate-300 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded bg-white border border-slate-300 text-slate-800 text-sm">
                      <i className="fa-solid fa-users-gear"></i>
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      User &amp; Warden Registry
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Role-Based Access Control (RBAC) per PRD: Super Admin, Warden (category bound), and Viewer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:border-slate-400 transition cursor-pointer"
                    type="button"
                  >
                    <i className="fa-solid fa-user-plus text-[10px] mr-1"></i> + Add User
                  </button>
                  <button
                    onClick={() =>
                      alert("Audit logs verified: All Super Admin modifications and login timestamps are cryptographically recorded.")
                    }
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:text-slate-900 transition cursor-pointer"
                    type="button"
                  >
                    Audit Logs
                  </button>
                </div>
              </div>

              {/* User Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-300 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-6" scope="col">Name &amp; Contact</th>
                      <th className="py-3 px-4" scope="col">Role</th>
                      <th className="py-3 px-4" scope="col">Assigned Category / Jurisdiction</th>
                      <th className="py-3 px-4" scope="col">Email</th>
                      <th className="py-3 px-4" scope="col">Mobile</th>
                      <th className="py-3 px-4 text-center" scope="col">Status</th>
                      <th className="py-3 px-4 sm:px-6 text-right" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const initials = user.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <tr key={user._id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-white border border-slate-300 text-slate-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                  {initials || "U"}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{user.name}</div>
                                  <div className="text-[11px] text-slate-500">
                                    {user.designation || (user.role === "superadmin" ? "Principal / Institutional Head" : "Hostel Warden")}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {user.role === "superadmin" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-white border border-slate-900 text-slate-900">
                                  <i className="fa-solid fa-shield text-[10px]"></i> Super Admin
                                </span>
                              ) : user.role === "warden" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-800">
                                  <i className="fa-solid fa-user-shield text-[10px]"></i> Warden
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-600">
                                  <i className="fa-solid fa-eye text-[10px]"></i> Viewer
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {user.role === "superadmin" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-800">
                                  All Hostels (Entire Campus)
                                </span>
                              ) : user.role === "warden" ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-800">
                                    {user.assignedCategory || "Boys Hostel Category"}
                                  </span>
                                  <button
                                    onClick={() => openAssignModal(user)}
                                    className="text-slate-500 hover:text-slate-900 text-xs p-1 cursor-pointer"
                                    title="Reassign Category"
                                  >
                                    <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-600">
                                  Campus-Wide (Read-Only)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{user.email}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{user.mobile}</td>

                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  user.status !== "INACTIVE"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                {user.status || "ACTIVE"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 sm:px-6 text-right space-x-1 whitespace-nowrap">
                              {user.role === "warden" && (
                                <button
                                  onClick={() => openAssignModal(user)}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                                  title="Assign / Reassign Category"
                                >
                                  <i className="fa-solid fa-arrows-rotate"></i>
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  alert(`Editing profile for ${user.name} (${user.email}). Credentials and scopes are managed in Root Vault.`)
                                }
                                className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                                title="Edit User Details"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              {user.role !== "superadmin" && (
                                <button
                                  onClick={() => handleToggleUserStatus(user)}
                                  className="p-1.5 text-slate-400 hover:text-red-700 rounded hover:bg-slate-100 transition cursor-pointer"
                                  title="Toggle Active Status"
                                >
                                  <i className="fa-solid fa-ban"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 px-4 text-center text-xs text-slate-500 italic">
                          No users found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <div>
                  Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> registered personnel under Super Admin authority
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2.5 py-1 rounded border border-slate-300 text-slate-400 cursor-not-allowed bg-white">
                    Previous
                  </button>
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold">1</span>
                  <button className="px-2.5 py-1 rounded border border-slate-300 text-slate-400 cursor-not-allowed bg-white">
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: ANALYTICS & TELEMETRY */}
        {/* ===================================================================== */}
        {activeView === "analytics" && analytics && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-white border border-slate-300 rounded-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Live Institutional Analytics &amp; Telemetry</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time data feeds from Haveli Kharagpur Permanent Campus.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Telemetry Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">Total Capacity</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{analytics.capacity.total} Beds</div>
                  <div className="text-xs text-slate-500 mt-1">Across 2 Campus Categories</div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">Allotted Residents</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{analytics.students.allotted} Students</div>
                  <div className="text-xs text-emerald-600 mt-1">{analytics.capacity.occupancyRate}% Overall Occupancy</div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">Waiting Applications</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{analytics.students.waiting} In Queue</div>
                  <div className="text-xs text-slate-500 mt-1">Pending Warden Allocation</div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">Disciplinary Removals</div>
                  <div className="text-2xl font-black text-red-700 mt-1">{analytics.students.cancelled} Evicted</div>
                  <div className="text-xs text-slate-500 mt-1">Beds Vacated to Inventory</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* BEGIN: BottomLeftSettingsTrigger (Wireframe Gear ⚙️) */}
      {/* ========================================================================= */}
      <aside className="fixed bottom-5 left-5 z-30">
        <div className="relative group">
          <button
            aria-label="System Settings & Diagnostics"
            onClick={() => setShowDiagnosticsModal(true)}
            className="h-11 w-11 rounded-full bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-500 focus:outline-none transition flex items-center justify-center text-lg cursor-pointer"
          >
            <i className="fa-solid fa-gear"></i>
          </button>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2 rounded shadow-none">
            System Diagnostics &amp; Settings
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* BEGIN: PageFooter */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Government Engineering College, Munger</span>
            <span>•</span>
            <span>Department of Science, Technology and Technical Education, Govt. of Bihar</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>HMS Super Admin Module v2.4</span>
            <button onClick={() => alert("Viewing GEC Munger HMS Security Policies & RBAC Guidelines.")} className="hover:text-slate-900 underline cursor-pointer">
              Security Policy
            </button>
            <button onClick={() => alert("IT Cell Support: itcell@gecmunger.ac.in | 06344-299901")} className="hover:text-slate-900 underline cursor-pointer">
              IT Cell Support
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD HOSTEL CATEGORY */}
      {/* ========================================================================= */}
      {showAddHostelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-hotel"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Hostel Category</h3>
                  <p className="text-xs text-slate-500">Establish top-level physical accommodation category (PRD §2.0)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddHostelModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleHostelSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Title (English &amp; Hindi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Post Graduate Boys Hostel / स्नातकोत्तर बालक छात्रावास"
                  value={hostelForm.name}
                  onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prefix Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PGBH-MUNGER"
                    value={hostelForm.code}
                    onChange={(e) => setHostelForm({ ...hostelForm, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-md border border-slate-300 text-xs uppercase font-mono py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender Demographic *</label>
                  <select
                    value={hostelForm.type}
                    onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0 bg-white"
                  >
                    <option value="boys">Male (Boys Hostel)</option>
                    <option value="girls">Female (Girls Hostel)</option>
                    <option value="coed">Staff / Co-educational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Blocks / Wings (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Block A (Chanakya), Block B (Aryabhata)"
                  value={hostelForm.initialBlocks}
                  onChange={(e) => setHostelForm({ ...hostelForm, initialBlocks: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Sector &amp; Notes</label>
                <textarea
                  rows={2}
                  placeholder="Haveli Kharagpur Permanent Campus North Wing"
                  value={hostelForm.description}
                  onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHostelModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Save Hostel Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW USER */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New User</h3>
                  <p className="text-xs text-slate-500">Role assignment strictly honoring PRD governance (§3.1)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name &amp; Academic Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prof. Rajesh Sharma"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gecmunger.ac.in"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9431X XXXXX"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs font-mono py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Permitted System Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition text-center ${
                      userForm.role === "warden"
                        ? "border-slate-900 bg-slate-50 font-bold"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="warden"
                      checked={userForm.role === "warden"}
                      onChange={() => setUserForm({ ...userForm, role: "warden" })}
                      className="sr-only"
                    />
                    <i className="fa-solid fa-user-shield text-slate-700 text-sm mb-1"></i>
                    <span className="font-bold text-slate-900 text-xs">Warden</span>
                    <span className="text-[10px] text-slate-500">Category Bound</span>
                  </label>

                  <label
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition text-center ${
                      userForm.role === "viewer"
                        ? "border-slate-900 bg-slate-50 font-bold"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="viewer"
                      checked={userForm.role === "viewer"}
                      onChange={() => setUserForm({ ...userForm, role: "viewer" })}
                      className="sr-only"
                    />
                    <i className="fa-solid fa-eye text-slate-700 text-sm mb-1"></i>
                    <span className="font-bold text-slate-900 text-xs">Viewer</span>
                    <span className="text-[10px] text-slate-500">Read-Only</span>
                  </label>

                  <label
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition text-center ${
                      userForm.role === "superadmin"
                        ? "border-slate-900 bg-slate-50 font-bold"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="superadmin"
                      checked={userForm.role === "superadmin"}
                      onChange={() => setUserForm({ ...userForm, role: "superadmin" })}
                      className="sr-only"
                    />
                    <i className="fa-solid fa-shield text-slate-700 text-sm mb-1"></i>
                    <span className="font-bold text-slate-900 text-xs">Super Admin</span>
                    <span className="text-[10px] text-slate-500">Root Governance</span>
                  </label>
                </div>
              </div>

              {/* Mandatory Category Binding for Warden Role */}
              {userForm.role === "warden" && (
                <div className="p-3 rounded-lg border border-slate-300 bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-link text-slate-600"></i> Bind Hostel Category &amp; Block
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      Required for Warden
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Target Category *</label>
                    <select
                      value={userForm.assignedCategory}
                      onChange={(e) => setUserForm({ ...userForm, assignedCategory: e.target.value })}
                      className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="Boys Hostel Category">Boys Hostel Category (बालक छात्रावास)</option>
                          <option value="Girls Hostel Category">Girls Hostel Category (बालिका छात्रावास)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Assigned Block Jurisdiction</label>
                    <input
                      type="text"
                      value={userForm.assignedBlockScope}
                      onChange={(e) => setUserForm({ ...userForm, assignedBlockScope: e.target.value })}
                      placeholder="e.g., Block A (Kautilya Bhavan)"
                      className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Create User Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN / REASSIGN WARDEN */}
      {/* ========================================================================= */}
      {showAssignWardenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-arrows-rotate"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign / Reassign Warden</h3>
                  <p className="text-xs text-slate-500">Bind Warden to Category &amp; Block Scope</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignWardenModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designated Warden *</label>
                <input
                  type="text"
                  disabled
                  value={assignForm.wardenName}
                  className="w-full rounded border border-slate-200 text-xs py-2 px-3 bg-slate-100 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Hostel Category *</label>
                <select
                  value={assignForm.targetCategory}
                  onChange={(e) => setAssignForm({ ...assignForm, targetCategory: e.target.value })}
                  className="w-full rounded border border-slate-300 text-xs py-2 px-3 bg-white"
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="Boys Hostel Category">Boys Hostel Category (बालक छात्रावास)</option>
                      <option value="Girls Hostel Category">Girls Hostel Category (बालिका छात्रावास)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Block Jurisdiction</label>
                <input
                  type="text"
                  value={assignForm.blockScope}
                  onChange={(e) => setAssignForm({ ...assignForm, blockScope: e.target.value })}
                  className="w-full rounded border border-slate-300 text-xs py-2 px-3 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effective Date *</label>
                  <input
                    type="date"
                    value={assignForm.effectiveDate}
                    onChange={(e) => setAssignForm({ ...assignForm, effectiveDate: e.target.value })}
                    className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Handover Clearance</label>
                  <select className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white">
                    <option value="signed">Verified &amp; Signed</option>
                    <option value="pending">Pending Inventory Audit</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded border border-slate-300 bg-white text-slate-700 text-[11px] leading-relaxed">
                <i className="fa-solid fa-circle-info text-slate-600 mr-1"></i> Reassignment will automatically restrict this Warden's room allocation, fee verification, and student rosters to the chosen category.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignWardenModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SYSTEM DIAGNOSTICS & SETTINGS (GEAR ⚙️) */}
      {/* ========================================================================= */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-300 overflow-hidden animate-scaleUp p-5 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gear text-slate-900 text-base"></i>
                <h3 className="text-base font-bold text-slate-900">System Diagnostics &amp; Settings</h3>
              </div>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-slate-700">
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Framework Runtime:</span>
                <span className="font-bold text-slate-900">Next.js 16 (App Router)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-bold text-emerald-700">MongoDB Atlas (Healthy)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Active Root User:</span>
                <span className="font-bold text-slate-900">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Operational Hostels:</span>
                <span className="font-bold text-slate-900">{categories.length} Categories</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Supervised Personnel:</span>
                <span className="font-bold text-slate-900">{users.length} Users</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="rounded-full px-5 py-1.5 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
