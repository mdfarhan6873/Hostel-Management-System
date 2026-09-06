"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileCheck,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

export default function StudentLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [handwrittenDocUrl, setHandwrittenDocUrl] = useState("");
  const [emergencyContact, setEmergencyContact] = useState(user?.guardianPhone || user?.phone || "");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaves");
      const data = await res.json();
      if (res.ok && data.leaves) {
        setLeaves(data.leaves);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setHandwrittenDocUrl(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason || !handwrittenDocUrl) {
      setError("Please fill all required fields and upload your handwritten application letter.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");

      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
          handwrittenDocUrl,
          emergencyContact,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit leave request.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg("Leave application submitted! Admin will call your parent to verify consent.");
      setStartDate("");
      setEndDate("");
      setReason("");
      setHandwrittenDocUrl("");
      fetchLeaves();
    } catch (err: any) {
      setError(err.message || "Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Handwritten <span className="text-gradient">Leave Application</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Post your handwritten leave letter for administrative review and parental telephone verification.
          Approved leaves are credited towards your mess fee rebate!
        </p>
      </div>

      {/* Notice Info Box */}
      <div
        className="glass-card"
        style={{
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid var(--border-glow)",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <ShieldCheck size={24} color="var(--accent-primary)" />
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <strong>Parent Phone Verification Policy:</strong> The warden office will call your registered parent (
          <strong style={{ color: "#fff" }}>{user?.guardianPhone || "Mobile number"}</strong>) to confirm consent before
          approving your leave dates.
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          <AlertCircle size={16} style={{ display: "inline", marginRight: "0.35rem" }} /> {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            color: "#6ee7b7",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          <CheckCircle size={16} style={{ display: "inline", marginRight: "0.35rem" }} /> {successMsg}
        </div>
      )}

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "2rem", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem" }}>Apply for Leave</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Leave Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Leave End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Parent / Guardian Contact Phone (To be called for verification)</label>
          <input
            type="tel"
            className="form-input"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Parent mobile number"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Reason for Leave</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="e.g. Traveling home for family function / sister's wedding..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* Upload Handwritten Letter Scan */}
        <div className="form-group" style={{ marginTop: "0.5rem" }}>
          <label className="form-label">Upload Handwritten Application Letter (Scan / Photo)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
              <Upload size={14} /> {uploadingDoc ? "Uploading..." : "Select Handwritten Letter File"}
              <input
                type="file"
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
            {handwrittenDocUrl && (
              <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 600 }}>
                ✓ Handwritten letter attached
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting Leave..." : "Submit Leave Request"}
          </button>
        </div>
      </form>

      {/* Leave Requests History */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "1rem" }}>My Leave Requests History</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading leave history...</div>
        ) : leaves.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "2.5rem" }}>
            No leave requests submitted yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {leaves.map((leave) => {
              const isApproved = leave.status === "APPROVED";
              const isPending = leave.status === "PENDING_PARENT_VERIFICATION";

              return (
                <div key={leave._id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                        {leave.startDate} to {leave.endDate}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                        ({leave.totalDays} Days)
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        isApproved ? "badge-allotted" : isPending ? "badge-pending" : "badge-cancelled"
                      }`}
                    >
                      {isPending ? "Pending Parent Call" : leave.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Reason: <em>"{leave.reason}"</em>
                  </div>

                  {leave.parentVerification?.calledAt && (
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.8rem",
                        color: "#6ee7b7",
                      }}
                    >
                      <ShieldCheck size={14} style={{ display: "inline", marginRight: "0.3rem" }} />
                      Parent Verified: Spoke with <strong>{leave.parentVerification.spokenWith}</strong> on{" "}
                      {new Date(leave.parentVerification.calledAt).toLocaleDateString()}
                    </div>
                  )}

                  {leave.handwrittenDocUrl && (
                    <div>
                      <a
                        href={leave.handwrittenDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <FileText size={13} /> View Attached Handwritten Letter
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
