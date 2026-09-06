"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Home,
  LogOut,
  QrCode,
  UserCheck,
  Camera,
  Layers,
  FileCheck,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user && pathname === "/login") {
    return null; // hide navbar on login page
  }

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      style={{
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4.25rem",
        }}
      >
        {/* Brand */}
        <a
          href={user ? (user.role === "ADMIN" ? "/admin" : user.role === "VIEWER" ? "/viewer" : "/student") : "/"}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
              Campus<span className="text-gradient">HMS</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "-3px" }}>
              Hostel Management System
            </div>
          </div>
        </a>

        {/* Navigation Links based on Role */}
        {user && (
          <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {user.role === "ADMIN" && (
              <>
                <a
                  href="/admin"
                  className={`btn btn-sm ${isActive("/admin") && pathname === "/admin" ? "btn-primary" : "btn-secondary"}`}
                >
                  <Home size={15} /> Capacity Matrix
                </a>
                <a
                  href="/admin/windows"
                  className={`btn btn-sm ${isActive("/admin/windows") ? "btn-primary" : "btn-secondary"}`}
                >
                  <Calendar size={15} /> Admission Windows
                </a>
                <a
                  href="/admin/applications"
                  className={`btn btn-sm ${isActive("/admin/applications") ? "btn-primary" : "btn-secondary"}`}
                >
                  <FileText size={15} /> Applications
                </a>
                <a
                  href="/admin/billing"
                  className={`btn btn-sm ${isActive("/admin/billing") ? "btn-primary" : "btn-secondary"}`}
                >
                  <CreditCard size={15} /> Billing & Rebates
                </a>
                <a
                  href="/admin/attendance"
                  className={`btn btn-sm ${isActive("/admin/attendance") ? "btn-primary" : "btn-secondary"}`}
                >
                  <Camera size={15} /> Attendance
                </a>
                <a
                  href="/admin/leaves"
                  className={`btn btn-sm ${isActive("/admin/leaves") ? "btn-primary" : "btn-secondary"}`}
                >
                  <FileCheck size={15} /> Leaves & Call
                </a>
                <a
                  href="/admin/payment-accounts"
                  className={`btn btn-sm ${isActive("/admin/payment-accounts") ? "btn-primary" : "btn-secondary"}`}
                >
                  <QrCode size={15} /> UPI QR
                </a>
              </>
            )}

            {user.role === "STUDENT" && (
              <>
                <a
                  href="/student"
                  className={`btn btn-sm ${pathname === "/student" ? "btn-primary" : "btn-secondary"}`}
                >
                  <Home size={15} /> Dashboard
                </a>
                <a
                  href="/student/apply"
                  className={`btn btn-sm ${isActive("/student/apply") ? "btn-primary" : "btn-secondary"}`}
                >
                  <FileText size={15} /> Apply
                </a>
                <a
                  href="/student/attendance"
                  className={`btn btn-sm ${isActive("/student/attendance") ? "btn-primary" : "btn-secondary"}`}
                >
                  <Camera size={15} /> Nightly Attendance
                </a>
                <a
                  href="/student/leaves"
                  className={`btn btn-sm ${isActive("/student/leaves") ? "btn-primary" : "btn-secondary"}`}
                >
                  <FileCheck size={15} /> Leave Request
                </a>
                <a
                  href="/student/billing"
                  className={`btn btn-sm ${isActive("/student/billing") ? "btn-primary" : "btn-secondary"}`}
                >
                  <CreditCard size={15} /> Fee & Bills
                </a>
                <a
                  href="/student/profile"
                  className={`btn btn-sm ${isActive("/student/profile") ? "btn-primary" : "btn-secondary"}`}
                >
                  <UserCheck size={15} /> Profile
                </a>
              </>
            )}

            {user.role === "VIEWER" && (
              <>
                <a
                  href="/viewer"
                  className={`btn btn-sm ${pathname === "/viewer" ? "btn-primary" : "btn-secondary"}`}
                >
                  <Layers size={15} /> Hostel Overview
                </a>
              </>
            )}
          </nav>
        )}

        {/* Right User Bar / Auth action */}
        <div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{user.name}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color:
                      user.role === "ADMIN"
                        ? "#f59e0b"
                        : user.role === "VIEWER"
                        ? "#06b6d4"
                        : "#10b981",
                    fontWeight: 700,
                  }}
                >
                  {user.role} {user.rollNumber ? `• ${user.rollNumber}` : ""}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: "0.45rem" }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <a href="/apply" className="btn btn-secondary btn-sm">
                <FileText size={14} /> Apply for Hostel
              </a>
              <a href="/login" className="btn btn-primary btn-sm">
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
