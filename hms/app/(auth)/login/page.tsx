"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  AlertCircle,
  Search,
  Lock,
  ArrowRight,
  RotateCw,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockedStatus, setBlockedStatus] = useState<string | null>(null);

  // Simple Clean Captcha (as shown in user's Screenshot 1)
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please provide your Roll Number, Email, or Phone along with password.");
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      setError("Security check text does not match the image. Please try again.");
      generateCaptcha();
      return;
    }

    setLoading(true);
    setError("");
    setBlockedStatus(null);
    setCaptchaError(false);

    const res = await login(identifier, password);
    if (!res.success) {
      setError(res.error || "Login failed. Please verify your credentials.");
      if (res.status) {
        setBlockedStatus(res.status);
      }
      setLoading(false);
      generateCaptcha();
    }
  };

  const handleQuickDemo = (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setCaptchaInput(captchaCode);
    setError("");
    setBlockedStatus(null);
    setCaptchaError(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "460px" }}>
        {/* Header (Matching Screenshot 1) */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              marginBottom: "0.35rem",
            }}
          >
            Sign in
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.925rem" }}>
            Enter your details to access your account.
          </p>
        </div>

        {/* Gated Status Specific Alert Box */}
        {blockedStatus === "PENDING" && (
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#b45309",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              <Lock size={16} /> Application Under Review (PENDING)
            </div>
            <p style={{ fontSize: "0.825rem", color: "#92400e", margin: "0.4rem 0 0.75rem 0", lineHeight: 1.45 }}>
              Your hostel application is currently under administrative verification. In accordance with hostel policies,
              student logins are unlocked once your application is verified and marked <strong>ELIGIBLE</strong>.
            </p>
            <a
              href="/apply?tab=status"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.75rem", width: "100%" }}
            >
              <Search size={13} /> Check Live Status & Re-Print Slip
            </a>
          </div>
        )}

        {error && blockedStatus !== "PENDING" && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              color: "#b91c1c",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* Sign In Form (Matching Screenshot 1) */}
        <form onSubmit={handleSubmit}>
          {/* Email / Roll Number Field */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.4rem",
              }}
            >
              Email / Roll Number
            </label>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.925rem",
                backgroundColor: "#edf4ff",
                border: "1px solid #d0e1fd",
                borderRadius: "var(--radius-md)",
                color: "#0f172a",
                outline: "none",
              }}
              placeholder="e.g. farhannaiyyar04@gmail.com or 2024CS001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.4rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{
                  width: "100%",
                  padding: "0.75rem 2.75rem 0.75rem 1rem",
                  fontSize: "0.925rem",
                  backgroundColor: "#edf4ff",
                  border: "1px solid #d0e1fd",
                  borderRadius: "var(--radius-md)",
                  color: "#0f172a",
                  outline: "none",
                }}
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Security Check / Captcha (Matching Screenshot 1) */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.4rem",
              }}
            >
              Security Check
            </label>

            {/* Captcha Display Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.6rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "3.5rem",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  userSelect: "none",
                }}
              >
                {/* Visual crossed lines */}
                <div
                  style={{
                    position: "absolute",
                    width: "120%",
                    height: "1px",
                    backgroundColor: "#94a3b8",
                    transform: "rotate(-12deg)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: "120%",
                    height: "1px",
                    backgroundColor: "#94a3b8",
                    transform: "rotate(14deg)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "2rem",
                    fontWeight: 800,
                    letterSpacing: "0.3em",
                    color: "#1e293b",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {captchaCode}
                </span>
              </div>

              <button
                type="button"
                onClick={generateCaptcha}
                style={{
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.775rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "var(--radius-md)",
                  color: "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <RotateCw size={13} /> Refresh
              </button>
            </div>

            {/* Captcha Input */}
            <input
              type="text"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                border: captchaError ? "1px solid #ef4444" : "1px solid #e2e8f0",
                borderRadius: "var(--radius-md)",
                color: "#0f172a",
                outline: "none",
                textTransform: "uppercase",
              }}
              placeholder="ENTER TEXT FROM IMAGE"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              required
            />
          </div>

          {/* Links Row (Matching Screenshot 1) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.825rem",
              color: "#64748b",
              marginBottom: "1.5rem",
            }}
          >
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "#475569",
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={14} /> Back
            </a>
            <a
              href="/apply?tab=status"
              style={{ color: "#475569", fontWeight: 500 }}
            >
              Check application status
            </a>
          </div>

          {/* Solid Submit Button (Matching Screenshot 1) */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.85rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              backgroundColor: "#64748b",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* 1-Click Quick Demo Switcher */}
        <div
          style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#94a3b8",
              textAlign: "center",
              fontWeight: 700,
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
            }}
          >
            <Sparkles size={13} /> Instant Demo Credentials
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo("admin@hostel.edu", "password123")}
              style={{ fontSize: "0.775rem" }}
            >
              👑 Admin Console
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo("2024CS001", "password123")}
              style={{ fontSize: "0.775rem" }}
            >
              🎓 Student (Allotted)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo("2024CS045", "password123")}
              style={{ fontSize: "0.775rem" }}
            >
              ⏳ Student (Eligible)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo("2024EC012", "password123")}
              style={{ fontSize: "0.775rem", color: "#b45309" }}
            >
              🔒 Student (Pending)
            </button>
          </div>
        </div>

        {/* Public Apply Notice */}
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
          New student?{" "}
          <a href="/apply" style={{ color: "#0f172a", fontWeight: 600, textDecoration: "underline" }}>
            Apply for hostel accommodation
          </a>
        </div>
      </div>
    </div>
  );
}
