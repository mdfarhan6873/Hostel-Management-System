"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertOctagon, Plane, Clock, ShieldAlert, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CalendarDay {
  day: number;
  date: string;
  status: "PRESENT" | "LEAVE" | "MISSED" | "EXCUSED" | "UPCOMING";
  log?: any;
  isApprovedLeave?: boolean;
}

interface AttendanceCalendarProps {
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  month: string; // YYYY-MM
  calendarDays: CalendarDay[];
  metrics: {
    presentCount: number;
    leaveCount: number;
    missedCount: number;
    attendanceRate: number;
  };
  isAdmin?: boolean;
  onResolveMissedDay?: (params: {
    date: string;
    actionType: "WARNING" | "FINE" | "EXCUSED" | "EVICTION";
    remark: string;
    fineAmount?: number;
  }) => Promise<void>;
}

export default function AttendanceCalendar({
  studentName,
  rollNumber,
  roomNumber,
  month,
  calendarDays,
  metrics,
  isAdmin = false,
  onResolveMissedDay,
}: AttendanceCalendarProps) {
  const [selectedMissedDay, setSelectedMissedDay] = useState<CalendarDay | null>(null);
  const [actionType, setActionType] = useState<"WARNING" | "FINE" | "EXCUSED" | "EVICTION">("WARNING");
  const [remark, setRemark] = useState("");
  const [fineAmount, setFineAmount] = useState(500);
  const [submitting, setSubmitting] = useState(false);

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate starting day of week for padding
  const [year, monthNum] = month.split("-").map(Number);
  const firstDayIndex = new Date(year, monthNum - 1, 1).getDay();

  const handleApplyAction = async () => {
    if (!selectedMissedDay || !onResolveMissedDay) return;
    try {
      setSubmitting(true);
      await onResolveMissedDay({
        date: selectedMissedDay.date,
        actionType,
        remark,
        fineAmount: actionType === "FINE" ? fineAmount : undefined,
      });
      setSelectedMissedDay(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      {/* Header & Metrics */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Monthly Attendance Matrix</h2>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            {studentName} ({rollNumber}) • Room {roomNumber} • Month: <strong style={{ color: "#f8fafc" }}>{month}</strong>
          </div>
        </div>

        {/* Metric Badges */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              padding: "0.5rem 0.85rem",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#34d399" }}>{metrics.presentCount}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Present
            </div>
          </div>

          <div
            style={{
              background: "rgba(6, 182, 212, 0.12)",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              padding: "0.5rem 0.85rem",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#38bdf8" }}>{metrics.leaveCount}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Approved Leaves
            </div>
          </div>

          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              padding: "0.5rem 0.85rem",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#f87171" }}>{metrics.missedCount}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Missed
            </div>
          </div>

          <div
            style={{
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              padding: "0.5rem 0.85rem",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#a5b4fc" }}>{metrics.attendanceRate}%</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Rate
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {dayHeaders.map((h) => (
          <div key={h} className="calendar-day-header">
            {h}
          </div>
        ))}

        {/* Empty padding cells for start of month */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} style={{ aspectRatio: 1 }} />
        ))}

        {/* Actual Month Days */}
        {calendarDays.map((dayObj) => {
          let cellClass = "upcoming";
          let icon = null;

          if (dayObj.status === "PRESENT") {
            cellClass = "present";
            icon = <CheckCircle2 size={13} />;
          } else if (dayObj.status === "LEAVE") {
            cellClass = "leave";
            icon = <Plane size={13} />;
          } else if (dayObj.status === "MISSED") {
            cellClass = "missed";
            icon = <AlertOctagon size={13} />;
          }

          return (
            <div
              key={dayObj.day}
              className={`calendar-cell ${cellClass}`}
              onClick={() => {
                if (isAdmin && dayObj.status === "MISSED") {
                  setSelectedMissedDay(dayObj);
                }
              }}
              title={
                dayObj.status === "MISSED"
                  ? isAdmin
                    ? "Click to take disciplinary action on missed roll call"
                    : "Missed roll call"
                  : dayObj.status === "LEAVE"
                  ? "Authorized leave"
                  : dayObj.status === "PRESENT"
                  ? "Marked Present via room selfie"
                  : ""
              }
            >
              <div>{dayObj.day}</div>
              {icon && <div style={{ marginTop: "2px" }}>{icon}</div>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "0.8rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }} />
          <span>Present (Selfie Marked)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#06b6d4" }} />
          <span>Approved Leave (Eligible for Mess Rebate)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ef4444" }} />
          <span>Missed Roll-Call</span>
        </div>
      </div>

      {/* Admin Disciplinary Action Modal for Missed Day */}
      {selectedMissedDay && (
        <div className="modal-overlay" onClick={() => setSelectedMissedDay(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f87171" }}>
                <ShieldAlert size={20} /> Resolve Missed Roll-Call: {selectedMissedDay.date}
              </h3>
              <button
                onClick={() => setSelectedMissedDay(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Student <strong style={{ color: "#fff" }}>{studentName}</strong> failed to capture room selfie between 7:00
              PM and 8:00 PM and had no approved leave. Select disciplinary action:
            </p>

            <div className="form-group">
              <label className="form-label">Disciplinary Resolution Action</label>
              <select
                className="form-select"
                value={actionType}
                onChange={(e: any) => setActionType(e.target.value)}
              >
                <option value="WARNING">Issue Formal Warning Notice</option>
                <option value="FINE">Levy Disciplinary Fine Bill (Linked to UPI QR)</option>
                <option value="EXCUSED">Mark as Excused (Genuine Emergency)</option>
                <option value="EVICTION">Initiate Hostel Eviction / Seat Cancellation</option>
              </select>
            </div>

            {actionType === "FINE" && (
              <div className="form-group">
                <label className="form-label">Fine Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(Number(e.target.value))}
                  min={100}
                  step={100}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Administrative Remark / Justification</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Reason or justification for this action..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedMissedDay(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleApplyAction}
                disabled={submitting}
              >
                {submitting ? "Applying..." : "Apply Disciplinary Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
