"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  CreditCard,
  QrCode,
  Calendar,
  LogOut,
  User,
  Building2,
  FileCheck,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      subtitle: "Capacity & Rooms",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Daily Attendance",
      subtitle: "Floor & Room Roll-Call",
      href: "/admin/attendance",
      icon: CalendarDays,
    },
    {
      title: "Applications",
      subtitle: "Student Eligibility",
      href: "/admin/applications",
      icon: FileText,
    },
    {
      title: "Leaves & Verification",
      subtitle: "Parent Phone Logger",
      href: "/admin/leaves",
      icon: FileCheck,
    },
    {
      title: "Billing & Rebates",
      subtitle: "Mess Fee Discounts",
      href: "/admin/billing",
      icon: CreditCard,
    },
    {
      title: "Admission Windows",
      subtitle: "Target Rounds & Limits",
      href: "/admin/windows",
      icon: Calendar,
    },
    {
      title: "UPI Accounts",
      subtitle: "QR Code Management",
      href: "/admin/payment-accounts",
      icon: QrCode,
    },
  ];

  const isActive = (item: any) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: "1.5rem 1.25rem 1.25rem 1.25rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <Building2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              CampusHMS
            </div>
            <div
              style={{
                fontSize: "0.675rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              ADMIN CONSOLE
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: active ? "#f1f5f9" : "transparent",
                  color: active ? "#0f172a" : "#475569",
                  fontWeight: active ? 600 : 500,
                  fontSize: "0.875rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? "#0f172a" : "#64748b",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ lineHeight: 1.2 }}>{item.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>
                    {item.subtitle}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </nav>

      {/* User Info & Quick Logout */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0f172a",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              <User size={14} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Administrator"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Admin / Warden</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              padding: "0.35rem",
              borderRadius: "var(--radius-sm)",
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
