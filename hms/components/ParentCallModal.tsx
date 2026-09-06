"use client";

import React, { useState } from "react";
import { PhoneCall, CheckCircle, XCircle, FileText, AlertCircle, X, ShieldCheck } from "lucide-react";

interface ParentCallModalProps {
  leave: any | null;
  onClose: () => void;
  onProcessed: () => void;
}

export default function ParentCallModal({ leave, onClose, onProcessed }: ParentCallModalProps) {
  const [spokenWith, setSpokenWith] = useState("Father");
  const [parentConsentConfirmed, setParentConsentConfirmed] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [adminDecisionRemark, setAdminDecisionRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!leave) return null;

  const handleDecision = async (status: "APPROVED" | "REJECTED") => {
    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveId: leave._id,
          status,
          spokenWith,
          parentConsentConfirmed,
          adminNotes,
          adminDecisionRemark: adminDecisionRemark || (status === "APPROVED" ? "Approved with full parent consent." : "Leave request rejected by administration."),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process leave request.");
        setSubmitting(false);
        return;
      }

      onProcessed();
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error while saving call verification.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PhoneCall size={22} color="var(--accent-primary)" /> Parent Call Verification
            </h2>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Leave request for <strong style={{ color: "#f8fafc" }}>{leave.studentName}</strong> ({leave.studentRollNumber})
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
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

        {/* Leave Summary Info Box */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Duration:</span>{" "}
              <strong>
                {leave.startDate} to {leave.endDate} ({leave.totalDays} Days)
              </strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Room / Hostel:</span>{" "}
              <strong>
                Room {leave.roomNumber}, {leave.hostelName}
              </strong>
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Reason:</span> <em>"{leave.reason}"</em>
          </div>

          {/* Handwritten Letter Scan Link */}
          {leave.handwrittenDocUrl && (
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
              <a
                href={leave.handwrittenDocUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FileText size={15} /> View Uploaded Handwritten Application Scan
              </a>
            </div>
          )}
        </div>

        {/* Parent Calling Panel */}
        <div
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.775rem", color: "#a5b4fc", textTransform: "uppercase", fontWeight: 700 }}>
              Registered Parent Mobile Number
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc", marginTop: "0.15rem" }}>
              {leave.emergencyContact || "No Phone Recorded"}
            </div>
          </div>
          <a
            href={`tel:${leave.emergencyContact}`}
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <PhoneCall size={15} /> Call Parent Now
          </a>
        </div>

        {/* Call Verification Logger Form */}
        <div className="form-group">
          <label className="form-label">Person Spoken With</label>
          <select className="form-select" value={spokenWith} onChange={(e) => setSpokenWith(e.target.value)}>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Guardian">Local Guardian</option>
            <option value="Other">Other Family Member</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={parentConsentConfirmed}
              onChange={(e) => setParentConsentConfirmed(e.target.checked)}
              style={{ cursor: "pointer", width: "1.1rem", height: "1.1rem", accentColor: "var(--accent-success)" }}
            />
            <span style={{ color: "#34d399" }}>Parent explicitly confirmed knowledge and consent for this leave</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Parent Call Notes & Verification Record</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="e.g., Spoke with Mr. Sharma, confirmed family travel dates and approved student journey..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>

        {/* Action Decision Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={submitting}
            onClick={() => handleDecision("REJECTED")}
          >
            <XCircle size={16} /> Reject Leave
          </button>
          <button
            type="button"
            className="btn btn-success btn-sm"
            disabled={submitting}
            onClick={() => handleDecision("APPROVED")}
          >
            <CheckCircle size={16} /> {submitting ? "Logging..." : "Confirm Call & Approve Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}
