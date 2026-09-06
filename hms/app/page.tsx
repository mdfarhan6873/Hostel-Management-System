"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Camera,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ paddingBottom: "5rem" }}>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          padding: "5rem 0 4rem 0",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-full)",
              color: "#a5b4fc",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            <Sparkles size={16} /> Campus Residency & Accommodation Platform
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              maxWidth: "950px",
              margin: "0 auto 1.5rem auto",
              lineHeight: 1.15,
            }}
          >
            Intelligent <span className="text-gradient">Hostel Management</span> for Modern Campuses
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              maxWidth: "750px",
              margin: "0 auto 2.5rem auto",
              lineHeight: 1.7,
            }}
          >
            Streamlining campus residency from live floor-room visual capacity modeling, 1-click bed allotments,
            nightly 7–8 PM room-selfie roll call, to mess fee leave rebates and UPI payments.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {user ? (
              <a
                href={user.role === "ADMIN" ? "/admin" : user.role === "VIEWER" ? "/viewer" : "/student"}
                className="btn btn-primary btn-lg"
              >
                Go to {user.role === "ADMIN" ? "Admin" : user.role === "VIEWER" ? "Viewer" : "Student"} Dashboard{" "}
                <ArrowRight size={18} />
              </a>
            ) : (
              <>
                <a href="/apply" className="btn btn-primary btn-lg">
                  <FileText size={18} /> Apply for Hostel Accommodation
                </a>
                <a href="/apply?tab=status" className="btn btn-secondary btn-lg">
                  Check Status / Print Slip
                </a>
                <a href="/login" className="btn btn-secondary btn-lg">
                  Sign In <ArrowRight size={18} />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container" style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Feature 1 */}
          <div className="glass-card interactive">
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
                marginBottom: "1.25rem",
              }}
            >
              <Layers size={26} />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Visual 1-Click Allotment</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Interactive floor-by-floor room grid showing single, double, and triple room capacities. Click any
              vacant bed to allot eligible students instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card interactive">
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-success)",
                marginBottom: "1.25rem",
              }}
            >
              <Camera size={26} />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Nightly Selfie Roll-Call</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Smart room-door selfie attendance restricted to the evening 7:00 PM – 8:00 PM window, stamping live
              room numbers and timestamps directly on the photo.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card interactive">
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-secondary)",
                marginBottom: "1.25rem",
              }}
            >
              <CreditCard size={26} />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Mess Fee Leave Rebates & UPI</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Automatic deduction for approved leave days (e.g. 70% mess rebate). Generate custom bills with
              Admin-assigned UPI QR codes and instant receipt generation.
            </p>
          </div>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div
          className="glass-card"
          style={{
            marginTop: "3.5rem",
            padding: "2rem",
            background: "linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.75) 100%)",
            border: "1px solid var(--border-glow)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem" }}>Instant Demonstration Access</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Explore the system with pre-configured role profiles:
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: "0.35rem" }}>
                Administrator
              </div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                ID: <code>admin@hostel.edu</code> (or <code>ADMIN01</code>)
              </div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                Password: <code>password123</code>
              </div>
            </div>

            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontWeight: 700, color: "#10b981", marginBottom: "0.35rem" }}>
                Student (Allotted)
              </div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                ID: <code>2024CS001</code> (or <code>aarav@hostel.edu</code>)
              </div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                Password: <code>password123</code>
              </div>
            </div>

            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontWeight: 700, color: "#06b6d4", marginBottom: "0.35rem" }}>
                Supervisor / Viewer
              </div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                ID: <code>warden@hostel.edu</code> (or <code>VIEWER01</code>)
              </div>
              <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                Password: <code>password123</code>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
