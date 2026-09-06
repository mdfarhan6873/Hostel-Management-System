"use client";

import React, { useState, useEffect } from "react";
import ParentCallModal from "@/components/ParentCallModal";
import {
  FileCheck,
  PhoneCall,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [activeCallLeave, setActiveCallLeave] = useState<any | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaves?status=${filter}`);
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
  }, [filter]);

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Handwritten Leaves & <span className="text-gradient">Parent Verification</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Inspect student handwritten leave applications, call registered parents to verify consent, and record authorization logs.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["ALL", "PENDING_PARENT_VERIFICATION", "APPROVED", "REJECTED"].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm ${filter === st ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(st)}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Leaves List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading leave applications...
        </div>
      ) : leaves.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <FileCheck size={48} color="var(--accent-primary)" style={{ margin: "0 auto 1rem auto" }} />
          <h3>No Leave Requests Found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            No handwritten leave letters match the selected status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
          {leaves.map((leave) => {
            const isPending = leave.status === "PENDING_PARENT_VERIFICATION";
            const isApproved = leave.status === "APPROVED";

            return (
              <div key={leave._id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{leave.studentName}</h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Roll: <strong style={{ color: "#f8fafc" }}>{leave.studentRollNumber}</strong> • Room {leave.roomNumber}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      isApproved ? "badge-allotted" : isPending ? "badge-pending" : "badge-cancelled"
                    }`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {isPending ? "Pending Parent Call" : leave.status}
                  </span>
                </div>

                {/* Details */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Period:</span>
                    <strong>
                      {leave.startDate} to {leave.endDate} ({leave.totalDays} Days)
                    </strong>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>Reason:</div>
                  <div style={{ color: "#f8fafc", fontStyle: "italic", marginTop: "0.15rem" }}>"{leave.reason}"</div>
                </div>

                {/* Handwritten Document Link */}
                {leave.handwrittenDocUrl && (
                  <a
                    href={leave.handwrittenDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <FileText size={14} /> View Uploaded Handwritten Letter
                  </a>
                )}

                {/* Parent Call Verification Log */}
                {leave.parentVerification?.calledAt ? (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem",
                      fontSize: "0.775rem",
                      color: "#6ee7b7",
                    }}
                  >
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <ShieldCheck size={14} /> Parent Phone Verification Confirmed
                    </div>
                    <div style={{ marginTop: "0.2rem", color: "var(--text-secondary)" }}>
                      Spoke with: <strong>{leave.parentVerification.spokenWith}</strong> at{" "}
                      {new Date(leave.parentVerification.calledAt).toLocaleString()}
                    </div>
                    {leave.parentVerification.adminNotes && (
                      <div style={{ marginTop: "0.2rem", color: "var(--text-muted)" }}>
                        Note: {leave.parentVerification.adminNotes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Parent Phone: <strong>{leave.emergencyContact}</strong> (Not called yet)
                  </div>
                )}

                {/* Actions */}
                <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                  {isPending ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                      onClick={() => setActiveCallLeave(leave)}
                    >
                      <PhoneCall size={14} /> Call Parent & Verify Leave
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: "100%" }}
                      onClick={() => setActiveCallLeave(leave)}
                    >
                      View / Edit Verification Log
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Parent Call Logger Modal */}
      <ParentCallModal
        leave={activeCallLeave}
        onClose={() => setActiveCallLeave(null)}
        onProcessed={() => {
          fetchLeaves();
        }}
      />
    </div>
  );
}
