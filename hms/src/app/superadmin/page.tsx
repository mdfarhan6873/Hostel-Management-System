/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastNotification } from "@/components/ui/ToastNotification";
import { SuperAdminHeader } from "@/components/dashboard/superadmin/SuperAdminHeader";
import { HostelCategoryManager } from "@/components/dashboard/superadmin/HostelCategoryManager";
import { UserRegistry } from "@/components/dashboard/superadmin/UserRegistry";
import { SuperAdminModals } from "@/components/dashboard/superadmin/SuperAdminModals";

export default function SuperAdminDashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeView, setActiveView] = useState("dashboard"); // dashboard | analytics

  // Data State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [userFilter, setUserFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categorySearch, setCategorySearch] = useState("");

  // Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddHostelModal, setShowAddHostelModal] = useState(false);
  const [showAssignWardenModal, setShowAssignWardenModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form State
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "warden",
    assignedCategory: "",
    assignedBlockScope: "",
    designation: "",
  });

  const [hostelForm, setHostelForm] = useState({
    name: "",
    code: "",
    type: "boys",
    initialBlocks: "",
    description: "",
  });

  const [assignForm, setAssignForm] = useState({
    userId: "",
    wardenName: "",
    targetCategory: "",
    blockScope: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  async function fetchSessionAndData() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!res.ok || !data.user || data.user.role !== "superadmin") {
        router.push("/login");
        return;
      }
      setCurrentUser(data.user);

      const [catRes, userRes] = await Promise.all([
        fetch("/api/hostels/categories"),
        fetch("/api/users"),
      ]);

      const catData = await catRes.json();
      const userData = await userRes.json();

      setCategories(catData.categories || []);
      setUsers(userData.users || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("error", "Failed to load dashboard data. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleHostelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/hostels/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hostelForm),
      });

      if (res.ok) {
        showToast("success", "Hostel Category created successfully!");
        setShowAddHostelModal(false);
        setHostelForm({ name: "", code: "", type: "boys", initialBlocks: "", description: "" });
        fetchSessionAndData();
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Failed to create category");
      }
    } catch (error) {
      showToast("error", "Network error while creating category");
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (res.ok) {
        showToast("success", "User account created successfully!");
        setShowAddUserModal(false);
        setUserForm({ name: "", email: "", mobile: "", password: "", role: "warden", assignedCategory: "", assignedBlockScope: "", designation: "" });
        fetchSessionAndData();
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Failed to create user");
      }
    } catch (error) {
      showToast("error", "Network error while creating user");
    }
  };

  const openAssignModal = (user: any) => {
    setAssignForm({
      ...assignForm,
      userId: user._id,
      wardenName: user.name,
      targetCategory: user.assignedCategory || categories[0]?.name || "",
    });
    setShowAssignWardenModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast("success", "Warden assigned to category successfully (Mock)");
    setShowAssignWardenModal(false);
  };

  const handleToggleUserStatus = async (user: any) => {
    showToast("success", `User status toggled (Mock)`);
  };

  const filteredCategories = categories.filter((cat) => {
    if (categoryFilter !== "all" && cat.type !== categoryFilter) return false;
    if (categorySearch && !cat.name.toLowerCase().includes(categorySearch.toLowerCase())) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (userFilter !== "all" && u.role !== userFilter) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Initializing Institutional Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <ToastNotification notification={notification} />
      
      <SuperAdminHeader currentUser={currentUser} handleLogout={handleLogout} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <HostelCategoryManager 
          filteredCategories={filteredCategories}
          users={users}
          setShowAddHostelModal={setShowAddHostelModal}
          openAssignModal={openAssignModal}
        />

        <UserRegistry 
          filteredUsers={filteredUsers}
          setShowAddUserModal={setShowAddUserModal}
          openAssignModal={openAssignModal}
          handleToggleUserStatus={handleToggleUserStatus}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </main>

      <SuperAdminModals 
        showAddHostelModal={showAddHostelModal}
        setShowAddHostelModal={setShowAddHostelModal}
        handleHostelSubmit={handleHostelSubmit}
        hostelForm={hostelForm}
        setHostelForm={setHostelForm}
        showAddUserModal={showAddUserModal}
        setShowAddUserModal={setShowAddUserModal}
        handleUserSubmit={handleUserSubmit}
        userForm={userForm}
        setUserForm={setUserForm}
        categories={categories}
        showAssignWardenModal={showAssignWardenModal}
        setShowAssignWardenModal={setShowAssignWardenModal}
        handleAssignSubmit={handleAssignSubmit}
        assignForm={assignForm}
        setAssignForm={setAssignForm}
        showDiagnosticsModal={showDiagnosticsModal}
        setShowDiagnosticsModal={setShowDiagnosticsModal}
        currentUser={currentUser}
        users={users}
      />
    </div>
  );
}


