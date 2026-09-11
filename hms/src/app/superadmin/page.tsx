/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastNotification } from "@/components/ui/ToastNotification";
import { useToast } from "@/components/ui/ToastContext";
import { SuperAdminHeader } from "@/components/dashboard/superadmin/SuperAdminHeader";
import { HostelCategoryManager } from "@/components/dashboard/superadmin/HostelCategoryManager";
import { UserRegistry } from "@/components/dashboard/superadmin/UserRegistry";
import { SuperAdminModals } from "@/components/dashboard/superadmin/SuperAdminModals";
import { SuperAdminControls } from "@/components/dashboard/superadmin/SuperAdminControls";

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
  const [showEditHostelModal, setShowEditHostelModal] = useState(false);
  const [editHostelForm, setEditHostelForm] = useState<any>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "warden"; item: any } | null>(null);
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
    designation: "",
  });

  const [hostelForm, setHostelForm] = useState({
    name: "",
    code: "",
    type: "boys",
    description: "",
  });

  const [assignForm, setAssignForm] = useState({
    userId: "",
    wardenName: "",
    targetCategory: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  const toast = useToast();

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  async function fetchSessionAndData() {
    try {
      const checkJson = (res: Response) => {
        const contentType = res.headers.get("content-type");
        return contentType && contentType.includes("application/json");
      };

      const res = await fetch("/api/auth/session");
      if (checkJson(res)) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (data.user.role !== "superadmin") {
            router.push(data.user.role === "warden" ? "/warden" : "/student");
            return;
          }
          setCurrentUser(data.user);
        } else {
          // Unauthenticated: redirect to landing page
          router.push("/");
          return;
        }
      } else {
        router.push("/");
        return;
      }

      const [catRes, userRes] = await Promise.all([
        fetch("/api/superadmin/categories"),
        fetch("/api/superadmin/wardens"),
      ]);

      if (checkJson(catRes)) {
        const catData = await catRes.json();
        setCategories(catData.categories || catData.hostels || []);
      }

      if (checkJson(userRes)) {
        const userData = await userRes.json();
        setUsers(userData.users || userData.wardens || []);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("error", "Failed to load dashboard data. Check database connection.");
      
      setCategories([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.info("Logged out successfully.", "Session Ended");
        router.push("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleHostelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hostelForm),
      });

      if (res.ok) {
        showToast("success", "Hostel Category created successfully!");
        setShowAddHostelModal(false);
        setHostelForm({ name: "", code: "", type: "boys", description: "" });
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
      const res = await fetch("/api/superadmin/wardens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userForm,
          role: "warden",
        }),
      });

      if (res.ok) {
        showToast("success", "Warden account created successfully!");
        setShowAddUserModal(false);
        setUserForm({ name: "", email: "", mobile: "", password: "", role: "warden", assignedCategory: "", designation: "" });
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
    try {
      const res = await fetch("/api/superadmin/wardens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assignForm.userId,
          assignedCategory: assignForm.targetCategory,
        }),
      });

      if (res.ok) {
        showToast("success", "Warden assigned to category successfully!");
        setShowAssignWardenModal(false);
        fetchSessionAndData();
      } else {
        const err = await res.json();
        showToast("error", err.error || "Failed to reassign warden");
      }
    } catch (error) {
      showToast("error", "Network error while assigning warden");
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      const newStatus = user.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
      const res = await fetch("/api/superadmin/wardens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user._id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        showToast("success", `Status updated to ${newStatus} for ${user.name}`);
        fetchSessionAndData();
      } else {
        const err = await res.json();
        showToast("error", err.error || "Failed to update status");
      }
    } catch (error) {
      showToast("error", "Network error while toggling status");
    }
  };

  const openEditHostelModal = (category: any) => {
    setEditHostelForm({
      id: category._id,
      name: category.name || "",
      code: category.code || "",
      type: category.type || "boys",
      description: category.description || "",
    });
    setShowEditHostelModal(true);
  };

  const openEditUserModal = (user: any) => {
    const isSuperAdmin = user.role === "superadmin";
    setEditUserForm({
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      designation: user.designation || "",
      role: user.role || "warden",
      assignedCategory: isSuperAdmin ? "" : (user.assignedCategory || categories[0]?.name || ""),
      password: "",
    });
    setShowEditUserModal(true);
  };

  const openDeleteModal = (type: "category" | "warden", item: any) => {
    setDeleteTarget({ type, item });
    setShowDeleteModal(true);
  };

  const handleEditHostelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHostelForm?.id) return;
    try {
      const res = await fetch("/api/superadmin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editHostelForm),
      });

      if (res.ok) {
        showToast("success", "Hostel Category updated successfully!");
        setShowEditHostelModal(false);
        setEditHostelForm(null);
        fetchSessionAndData();
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Failed to update category");
      }
    } catch (error) {
      showToast("error", "Network error while updating category");
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserForm?.id) return;
    try {
      const payload = {
        ...editUserForm,
        assignedCategory: editUserForm.role === "superadmin" ? "" : editUserForm.assignedCategory,
      };
      const res = await fetch("/api/superadmin/wardens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          "success",
          editUserForm.role === "superadmin"
            ? "Administrator profile updated successfully!"
            : "Warden profile updated successfully!"
        );
        setShowEditUserModal(false);
        setEditUserForm(null);
        fetchSessionAndData();
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Failed to update profile");
      }
    } catch (error) {
      showToast("error", "Network error while updating profile");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.item?._id) return;
    try {
      const isCategory = deleteTarget.type === "category";
      const endpoint = isCategory
        ? `/api/superadmin/categories?id=${deleteTarget.item._id}`
        : `/api/superadmin/wardens?id=${deleteTarget.item._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.item._id }),
      });

      if (res.ok) {
        showToast(
          "success",
          `${isCategory ? "Hostel Category" : "Warden Account"} deleted successfully!`
        );
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchSessionAndData();
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Failed to delete item");
      }
    } catch (error) {
      showToast("error", "Network error while deleting item");
    }
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
        <SuperAdminControls
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          userRoleFilter={userFilter}
          setUserRoleFilter={setUserFilter}
          setShowAddHostelModal={setShowAddHostelModal}
          setShowAddUserModal={setShowAddUserModal}
        />

        <HostelCategoryManager 
          filteredCategories={filteredCategories}
          users={users}
          setShowAddHostelModal={setShowAddHostelModal}
          openAssignModal={openAssignModal}
          openEditModal={openEditHostelModal}
          openDeleteModal={openDeleteModal}
        />

        <UserRegistry 
          filteredUsers={filteredUsers}
          setShowAddUserModal={setShowAddUserModal}
          openAssignModal={openAssignModal}
          openEditUserModal={openEditUserModal}
          openDeleteModal={openDeleteModal}
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

        showEditHostelModal={showEditHostelModal}
        setShowEditHostelModal={setShowEditHostelModal}
        handleEditHostelSubmit={handleEditHostelSubmit}
        editHostelForm={editHostelForm}
        setEditHostelForm={setEditHostelForm}

        showAddUserModal={showAddUserModal}
        setShowAddUserModal={setShowAddUserModal}
        handleUserSubmit={handleUserSubmit}
        userForm={userForm}
        setUserForm={setUserForm}
        categories={categories}

        showEditUserModal={showEditUserModal}
        setShowEditUserModal={setShowEditUserModal}
        handleEditUserSubmit={handleEditUserSubmit}
        editUserForm={editUserForm}
        setEditUserForm={setEditUserForm}

        showAssignWardenModal={showAssignWardenModal}
        setShowAssignWardenModal={setShowAssignWardenModal}
        handleAssignSubmit={handleAssignSubmit}
        assignForm={assignForm}
        setAssignForm={setAssignForm}

        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        deleteTarget={deleteTarget}
        handleConfirmDelete={handleConfirmDelete}

        showDiagnosticsModal={showDiagnosticsModal}
        setShowDiagnosticsModal={setShowDiagnosticsModal}
        currentUser={currentUser}
        users={users}
      />
    </div>
  );
}


