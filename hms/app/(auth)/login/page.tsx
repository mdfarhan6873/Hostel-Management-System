"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Sparkles,
  UserCheck,
  AlertCircle,
  FileText,
  Search,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockedStatus, setBlockedStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please provide your Roll Number, Email, or Phone along with password.");
      return;
    }

    setLoading(true);
    setError("");
    setBlockedStatus(null);

    const res = await login(identifier, password);
    if (!res.success) {
      setError(res.error || "Login failed. Please verify your credentials.");
      if (res.status) {
        setBlockedStatus(res.status);
      }
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError("");
    setBlockedStatus(null);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 4.25rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Top Info Banner for Prospective Applicants */}
        <div
          style={{
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "0.85rem 1.15rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            <span style={{ color: "#c7d2fe" }}>First time applicant for hostel accommodation?</span>
          </div>
          <a
            href="/apply"
            className="btn btn-primary btn-sm"
            style={{ fontSize: "0.775rem", padding: "0.3rem 0.75rem" }}
          >
            Apply for Hostel <ArrowRight size={13} />
          </a>
        </div>

        {/* Card Box */}
        <div
          className="glass-card"
          style={{
            padding: "2.5rem 2rem",
            background: "linear-gradient(180deg, rgba(19, 29, 53, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
            border: "1px solid var(--border-glow)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "var(--radius-lg)",
                background: "var(--gradient-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)",
                marginBottom: "1rem",
              }}
            >
              <Building2 size={28} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Hostel Portal Sign In</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
              Sign in with your College Roll Number, Email, or Phone
            </p>
          </div>

          {/* Gated Status Specific Alert Box */}
          {blockedStatus === "PENDING" && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fcd34d", fontWeight: 700, fontSize: "0.9rem" }}>
                <Lock size={16} /> Application Under Review (PENDING)
              </div>
              <p style={{ fontSize: "0.8rem", color: "#fde68a", margin: "0.35rem 0 0.75rem 0", lineHeight: 1.4 }}>
                Your hostel application is currently being reviewed by the administration. In accordance with hostel policies,
                student logins are unlocked only after your application has been verified and marked <strong>ELIGIBLE</strong>.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href="/apply?tab=status"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", flex: 1 }}
                >
                  <Search size={13} /> Check Live Status & Re-Print Slip
                </a>
              </div>
            </div>
          )}

          {error && blockedStatus !== "PENDING" && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                color: "#fca5a5",
                fontSize: "0.875rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Identifier (Roll No / Email / Phone)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2024CS001, admin@hostel.edu, or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Password</label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem", padding: "0.8rem" }}
              disabled={loading}
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn size={18} /> Sign In to Portal
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
            <div
              style={{
                fontSize: "0.775rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                textAlign: "center",
                fontWeight: 700,
                marginBottom: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
              }}
            >
              <Sparkles size={13} /> 1-Click Demo Profiles & Testing Roles
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo("admin@hostel.edu", "password123")}
                style={{ fontSize: "0.775rem" }}
              >
                👑 Admin (Allowed)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo("warden@hostel.edu", "password123")}
                style={{ fontSize: "0.775rem" }}
              >
                👁️ Viewer (Allowed)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo("2024CS001", "password123")}
                style={{ fontSize: "0.775rem" }}
              >
                🎓 Student: Allotted (Allowed)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo("2024CS045", "password123")}
                style={{ fontSize: "0.775rem" }}
              >
                ⏳ Student: Eligible (Allowed)
              </button>
            </div>

            {/* Test Gated Status Button */}
            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo("2024EC012", "password123")}
                style={{
                  width: "100%",
                  fontSize: "0.775rem",
                  borderColor: "rgba(245, 158, 11, 0.4)",
                  color: "#fcd34d",
                }}
              >
                🔒 Student: Pending Review (Click to test Gated Login)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
