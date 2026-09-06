"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCheck, Save, CheckCircle2, AlertCircle, Building2, Phone } from "lucide-react";

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();

  const [registrationNumber, setRegistrationNumber] = useState(user?.registrationNumber || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [guardianPhone, setGuardianPhone] = useState(user?.guardianPhone || "");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setRegistrationNumber(user.registrationNumber || "");
      setPhone(user.phone || "");
      setGuardianPhone(user.guardianPhone || "");
      setBloodGroup(user.bloodGroup || "");
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber,
          phone,
          guardianPhone,
          bloodGroup,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile.");
        setSaving(false);
        return;
      }

      setSuccess("Profile details and Registration Number updated successfully!");
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "680px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Resident <span className="text-gradient">Profile Management</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Update your official college registration number, contact phone, and parent emergency numbers.
        </p>
      </div>

      {success && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1rem",
            color: "#6ee7b7",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1rem",
            color: "#fca5a5",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="glass-card" style={{ padding: "2rem" }}>
        {/* Readonly Academic Snapshot */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <div style={{ color: "var(--text-muted)" }}>Full Name:</div>
            <strong style={{ color: "#f8fafc" }}>{user?.name}</strong>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)" }}>Roll Number:</div>
            <strong style={{ color: "#f8fafc" }}>{user?.rollNumber || "N/A"}</strong>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)" }}>Assigned Hostel:</div>
            <strong style={{ color: "#a5b4fc" }}>{user?.hostelName || "Not Allotted"}</strong>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)" }}>Room & Bed:</div>
            <strong style={{ color: "#34d399" }}>
              {user?.roomNumber ? `Room ${user.roomNumber} (Bed ${user.bedNumber || "A"})` : "N/A"}
            </strong>
          </div>
        </div>

        {/* Update Registration Number */}
        <div className="form-group">
          <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>College Registration Number</span>
            <span style={{ fontSize: "0.75rem", color: "#34d399" }}>Editable from dashboard</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. REG-2024-CS01"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Issued by the college university registrar office after physical verification.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Student Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent's / Emergency Mobile</label>
            <input
              type="tel"
              className="form-input"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Blood Group</label>
          <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
