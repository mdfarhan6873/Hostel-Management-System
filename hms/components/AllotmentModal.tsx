"use client";

import React, { useState, useEffect } from "react";
import { X, Check, UserCheck, Search, Building2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface AllotmentTarget {
  hostelId: string;
  hostelName: string;
  blockName: string;
  floorNumber: number;
  roomNumber: string;
  bedNumber: string;
}

interface AllotmentModalProps {
  target: AllotmentTarget | null;
  onClose: () => void;
  onAllotted: () => void;
}

export default function AllotmentModal({ target, onClose, onAllotted }: AllotmentModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!target) return;
    const fetchEligibleStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/applications?status=ELIGIBLE");
        const data = await res.json();
        if (res.ok) {
          setStudents(data.applications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEligibleStudents();
  }, [target]);

  if (!target) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleAllot = async (studentId: string, studentName: string) => {
    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/allotments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          hostelId: target.hostelId,
          blockName: target.blockName,
          floorNumber: target.floorNumber,
          roomNumber: target.roomNumber,
          bedNumber: target.bedNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to allot room.");
        setSubmitting(false);
        return;
      }

      // Celebrate success!
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onAllotted();
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error while allotting.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserCheck size={22} color="var(--accent-primary)" /> 1-Click Room Allotment
            </h2>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              Allotting to:{" "}
              <strong style={{ color: "#f8fafc" }}>
                {target.hostelName} • Floor {target.floorNumber} • Room {target.roomNumber} (Bed {target.bedNumber})
              </strong>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
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
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.85rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search eligible students by Name, Roll No, Branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>

        {/* Students List */}
        <div
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              Loading eligible applicants...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 1rem",
                background: "rgba(15, 23, 42, 0.4)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-medium)",
              }}
            >
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No eligible candidates currently awaiting room allotment.
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                Tip: Review submitted applications in the Applications tab and mark candidates as{" "}
                <span className="badge badge-eligible">Eligible</span> first.
              </div>
            </div>
          ) : (
            filteredStudents.map((app) => (
              <div
                key={app._id}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.925rem" }}>{app.name}</span>
                    <span className="badge badge-eligible" style={{ fontSize: "0.65rem" }}>
                      Eligible
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    Roll: <strong style={{ color: "#f8fafc" }}>{app.rollNumber}</strong> • {app.branch} (Sem{" "}
                    {app.semester})
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Parent Phone: {app.parentPhone} • Blood: {app.bloodGroup || "N/A"}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                  onClick={() => handleAllot(app.studentId, app.name)}
                >
                  <Check size={14} /> Allot Seat
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
