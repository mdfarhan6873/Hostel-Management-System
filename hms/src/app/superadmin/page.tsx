"use client";

import React, { useState, useEffect } from "react";
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
  type: "boys" | "girls";
  description: string;
  blocksCount: number;
  roomsCount: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  blocks: any[];
}

interface WardenUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  assignedCategory: string;
  assignedBlocks: any[];
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "wardens">("overview");
  const [loading, setLoading] = useState(true);

  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<HostelCategory[]>([]);
  const [wardens, setWardens] = useState<WardenUser[]>([]);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", type: "boys", description: "" });

  const [showWardenModal, setShowWardenModal] = useState(false);
  const [wardenForm, setWardenForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    assignedCategory: "Boys Hostel",
  });

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

      // Load analytics, categories, wardens in parallel
      const [anaRes, catRes, warRes] = await Promise.all([
        fetch("/api/superadmin/analytics"),
        fetch("/api/superadmin/categories"),
        fetch("/api/superadmin/wardens"),
      ]);

      const [anaData, catData, warData] = await Promise.all([
        anaRes.json(),
        catRes.json(),
        warRes.json(),
      ]);

      if (anaData.success) setAnalytics(anaData.analytics);
      if (catData.success) setCategories(catData.hostels);
      if (warData.success) setWardens(warData.wardens);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error connecting to institutional services");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      showToast("success", `Hostel Category "${categoryForm.name}" created successfully`);
      setShowCategoryModal(false);
      setCategoryForm({ name: "", type: "boys", description: "" });
      fetchSessionAndData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const handleCreateWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/wardens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wardenForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create warden");

      showToast("success", `Warden "${wardenForm.name}" onboarded successfully`);
      setShowWardenModal(false);
      setWardenForm({
        name: "",
        email: "",
        mobile: "",
        password: "",
        assignedCategory: categories[0]?.name || "Boys Hostel",
      });
      fetchSessionAndData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-emerald-400 font-medium tracking-wide">
          Verifying Institutional Super Admin Authorization...
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
                  Super Admin Console
                </span>
                <span className="text-xs text-slate-400">GEC Munger</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800/80 pt-1 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            📊 Institutional Analytics
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "categories"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            🏢 Hostel Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("wardens")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "wardens"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            🛡️ Warden Management ({wardens.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Stat Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Overall Bed Capacity
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {analytics.capacity.total}{" "}
                  <span className="text-sm font-medium text-slate-400">Total Beds</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Occupied: <b className="text-emerald-400">{analytics.capacity.occupied}</b></span>
                  <span>Available: <b className="text-amber-400">{analytics.capacity.available}</b></span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${analytics.capacity.occupancyRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Student Lifecycle
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {analytics.students.allotted}{" "}
                  <span className="text-sm font-medium text-slate-400">Allotted</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Waiting Queue: <b className="text-amber-400">{analytics.students.waiting}</b></span>
                  <span>Evicted / Cancelled: <b className="text-red-400">{analytics.students.cancelled}</b></span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Infrastructure
                </div>
                <div className="text-3xl font-extrabold text-indigo-400">
                  {analytics.blocks}{" "}
                  <span className="text-sm font-medium text-slate-400">Blocks</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Hostels: <b className="text-white">{analytics.hostels.total}</b></span>
                  <span>Total Rooms: <b className="text-white">{analytics.rooms}</b></span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Warden Supervision
                </div>
                <div className="text-3xl font-extrabold text-teal-400">
                  {analytics.wardens}{" "}
                  <span className="text-sm font-medium text-slate-400">Active Wardens</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Boys Hostels: <b className="text-white">{analytics.hostels.boys}</b></span>
                  <span>Girls Hostels: <b className="text-white">{analytics.hostels.girls}</b></span>
                </div>
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Hostel Category Breakdown
                </h3>
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded-md uppercase ${
                              cat.type === "boys"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                            }`}
                          >
                            {cat.type}
                          </span>
                          <h4 className="font-semibold text-white">{cat.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">{cat.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-slate-400">Blocks</div>
                          <div className="text-base font-bold text-white">{cat.blocksCount}</div>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-slate-400">Capacity</div>
                          <div className="text-base font-bold text-emerald-400">{cat.totalCapacity}</div>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-slate-400">Occupied</div>
                          <div className="text-base font-bold text-amber-400">{cat.occupiedBeds}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy & System Status */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Institutional Policies Active</h3>
                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✔</span>
                      <span>
                        <b>Unique Furniture IDs</b>: Every allotted bed is mapped to a Bed ID, Study Table ID, and Chair ID.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✔</span>
                      <span>
                        <b>Mess Rebate Deduction</b>: Wardens compute net mess bills after deducting approved leaves.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✔</span>
                      <span>
                        <b>Strict Gatekeeping</b>: Unallotted or waiting applicants cannot access student self-service.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>System Version: v2.4 (PRD Locked)</span>
                  <span className="text-emerald-400 font-mono">Status: Healthy</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Hostel Categories & Complexes</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Define Boys, Girls, and specialized hostel complexes for institutional allocation.
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2 w-fit"
              >
                <span>+</span> Add New Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                          cat.type === "boys"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                        }`}
                      >
                        {cat.type} Hostel
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {cat.blocksCount} Assigned Blocks
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{cat.description}</p>

                    {/* Associated blocks */}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="text-xs font-semibold text-slate-300 mb-2">Blocks in this Category:</div>
                      {cat.blocks && cat.blocks.length > 0 ? (
                        <div className="space-y-2">
                          {cat.blocks.map((blk: any) => (
                            <div
                              key={blk._id}
                              className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-200">{blk.name}</span>
                              <span className="text-emerald-400">
                                Warden: {blk.wardenId?.name || "Unassigned"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No blocks assigned yet</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Total Capacity: <b className="text-white">{cat.totalCapacity}</b></span>
                    <span>Occupied: <b className="text-emerald-400">{cat.occupiedBeds}</b></span>
                    <span>Available: <b className="text-amber-400">{cat.availableBeds}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WARDEN MANAGEMENT */}
        {activeTab === "wardens" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Institutional Warden Directory</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage chief and wing wardens responsible for student lifecycle, block blueprints, and rebate billing.
                </p>
              </div>
              <button
                onClick={() => setShowWardenModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2 w-fit"
              >
                <span>+</span> Onboard New Warden
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wardens.map((warden) => (
                <div
                  key={warden._id}
                  className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active Warden
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {warden.assignedCategory || "General"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{warden.name}</h3>
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <div>📧 <span className="text-slate-300">{warden.email}</span></div>
                      <div>📱 <span className="text-slate-300">{warden.mobile}</span></div>
                    </div>

                    {/* Assigned blocks */}
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 mb-1.5">Supervised Blocks:</div>
                      {warden.assignedBlocks && warden.assignedBlocks.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {warden.assignedBlocks.map((b: any) => (
                            <span
                              key={b._id}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-md"
                            >
                              {b.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No direct blocks assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Role: Institutional Warden</span>
                    <span className="text-emerald-400 font-mono">Status: Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CREATE CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Create Hostel Category</h3>
            <p className="text-xs text-slate-400 mb-4">
              Define a new residential campus category for students.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boys Hostel Complex 2"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details regarding facilities, curfew, location..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WARDEN MODAL */}
      {showWardenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Onboard New Warden</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a verified faculty member to manage residential blocks.
            </p>

            <form onSubmit={handleCreateWarden} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Anand Verma"
                  value={wardenForm.name}
                  onChange={(e) => setWardenForm({ ...wardenForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. warden.anand@gecmunger.ac.in"
                  value={wardenForm.email}
                  onChange={(e) => setWardenForm({ ...wardenForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9835012345"
                  value={wardenForm.mobile}
                  onChange={(e) => setWardenForm({ ...wardenForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={wardenForm.password}
                  onChange={(e) => setWardenForm({ ...wardenForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Hostel Category</label>
                <select
                  value={wardenForm.assignedCategory}
                  onChange={(e) => setWardenForm({ ...wardenForm, assignedCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                  {categories.length === 0 && <option value="Boys Hostel">Boys Hostel</option>}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWardenModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950"
                >
                  Onboard Warden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
