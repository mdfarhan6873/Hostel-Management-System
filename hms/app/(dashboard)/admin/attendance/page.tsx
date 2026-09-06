"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  ShieldAlert,
  UserCheck,
  UserX,
  Phone,
  Building2,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminDailyAttendancePage() {
  // Date selection state
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filters
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "MISSED" | "PRESENT" | "LEAVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [selfieModalData, setSelfieModalData] = useState<any | null>(null);
  const [leaveModalData, setLeaveModalData] = useState<any | null>(null);
  const [overrideModalData, setOverrideModalData] = useState<any | null>(null);
  const [fineModalData, setFineModalData] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const fetchDailyAttendance = async (dateToFetch: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/attendance/daily?date=${dateToFetch}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData(resData);
      } else {
        setError(resData.error || "Failed to load daily attendance records");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAttendance(selectedDate);
  }, [selectedDate]);

  // Date Navigation Helpers
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  // Disciplinary / Override Handlers
  const handleConfirmOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalData) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/attendance/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: overrideModalData.student._id,
          date: selectedDate,
          action: "MARK_PRESENT",
          remark: overrideModalData.remark || "Verified in person during night warden round",
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setActionSuccessMessage(resData.message);
        setOverrideModalData(null);
        fetchDailyAttendance(selectedDate);
        setTimeout(() => setActionSuccessMessage(""), 4000);
      } else {
        alert(resData.error || "Failed to mark override");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fineModalData) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/attendance/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: fineModalData.student._id,
          date: selectedDate,
          action: "CHARGE_FINE",
          fineAmount: fineModalData.fineAmount || 200,
          remark: fineModalData.remark || "Unexcused absence from 7-8 PM evening roll-call",
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setActionSuccessMessage(resData.message);
        setFineModalData(null);
        fetchDailyAttendance(selectedDate);
        setTimeout(() => setActionSuccessMessage(""), 4000);
      } else {
        alert(resData.error || "Failed to issue fine");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Collect unique floors for tab navigation
  const allFloors: any[] = [];
  data?.hostels?.forEach((h: any) => {
    h.blocks?.forEach((b: any) => {
      b.floors?.forEach((f: any) => {
        if (!allFloors.some((existing) => existing.floorNumber === f.floorNumber)) {
          allFloors.push({ floorNumber: f.floorNumber, floorName: f.floorName });
        }
      });
    });
  });
  allFloors.sort((a, b) => a.floorNumber - b.floorNumber);

  return (
    <div className="admin-content" style={{ padding: "2rem" }}>
      {/* Top Header Row with Date Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Daily Attendance Roll-Call
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Floor-wise and room-wise inspection of all allotted hostel residents for the selected date.
          </p>
        </div>

        {/* Date Controls & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* Date Picker Group */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#ffffff",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.25rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              style={{
                background: "none",
                border: "none",
                padding: "0.4rem 0.6rem",
                cursor: "pointer",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
              }}
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                padding: "0.3rem 0.5rem",
                backgroundColor: "transparent",
              }}
            />

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              style={{
                background: "none",
                border: "none",
                padding: "0.4rem 0.6rem",
                cursor: "pointer",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
              }}
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSetToday}
            disabled={selectedDate === todayStr}
          >
            Today
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.print()}
          >
            <Printer size={15} /> Print Roll-Call Sheet
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1.25rem",
            color: "#166534",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} color="#16a34a" /> {actionSuccessMessage}
        </div>
      )}

      {/* KPI Summary Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Total Residents */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>
            <Building2 size={22} />
          </div>
          <div>
            <div className="kpi-value">{data?.summary?.totalAllotted ?? 0}</div>
            <div className="kpi-label">Total Allotted Residents</div>
          </div>
        </div>

        {/* Present Verified */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: "#16a34a" }}>
              {data?.summary?.presentCount ?? 0}
            </div>
            <div className="kpi-label">
              Verified Present ({data?.summary?.attendanceRate ?? 0}%)
            </div>
          </div>
        </div>

        {/* On Approved Leave */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: "#2563eb" }}>
              {data?.summary?.leaveCount ?? 0}
            </div>
            <div className="kpi-label">On Approved Leave</div>
          </div>
        </div>

        {/* Missed Roll-Call */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
            <UserX size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: "#dc2626" }}>
              {data?.summary?.missedCount ?? 0}
            </div>
            <div className="kpi-label">Missed / Unaccounted</div>
          </div>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Tabs (Matching User Screenshot 2) */}
      <div className="nav-tabs">
        <div
          className={`nav-tab ${selectedFloor === "ALL" ? "active" : ""}`}
          onClick={() => setSelectedFloor("ALL")}
        >
          All Floors
        </div>
        {allFloors.map((floor) => (
          <div
            key={floor.floorNumber}
            className={`nav-tab ${selectedFloor === floor.floorNumber.toString() ? "active" : ""}`}
            onClick={() => setSelectedFloor(floor.floorNumber.toString())}
          >
            {floor.floorName}
          </div>
        ))}

        {/* Status Filter Options directly in tab bar */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("ALL")}
          >
            All Residents
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "MISSED" ? "btn-danger" : "btn-secondary"}`}
            onClick={() => setStatusFilter("MISSED")}
          >
            🔴 Missed Only ({data?.summary?.missedCount ?? 0})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "PRESENT" ? "btn-success" : "btn-secondary"}`}
            onClick={() => setStatusFilter("PRESENT")}
          >
            🟢 Present Only
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "LEAVE" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("LEAVE")}
          >
            🔵 On Leave
          </button>
        </div>
      </div>

      {/* Main Floor & Room Cards Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          Loading daily attendance roll-call for {selectedDate}...
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#dc2626" }}>
          <AlertCircle size={40} style={{ margin: "0 auto 1rem auto" }} />
          <h3>Error loading attendance</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {data?.hostels?.map((hostel: any) =>
            hostel.blocks?.map((block: any) =>
              block.floors
                ?.filter((floor: any) => {
                  if (selectedFloor !== "ALL") {
                    return floor.floorNumber.toString() === selectedFloor;
                  }
                  return true;
                })
                .map((floor: any) => {
                  // Filter rooms by status if statusFilter is active
                  const filteredRooms = floor.rooms?.filter((room: any) => {
                    const occupiedBeds = room.beds?.filter((b: any) => b.isOccupied);
                    if (statusFilter === "ALL") return occupiedBeds.length > 0;
                    return occupiedBeds.some((b: any) => b.attendance?.status === statusFilter);
                  });

                  if (!filteredRooms || filteredRooms.length === 0) return null;

                  return (
                    <div key={floor.floorNumber} style={{ marginBottom: "1rem" }}>
                      {/* Floor Header Bar */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#f1f5f9",
                          border: "1px solid var(--border-subtle)",
                          padding: "0.85rem 1.25rem",
                          borderRadius: "var(--radius-lg)",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Building2 size={18} color="#0f172a" />
                          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>
                            {floor.floorName} ({hostel.name})
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                          <span className="badge badge-gray">{floor.stats.residents} Residents</span>
                          <span className="badge badge-present">{floor.stats.present} Present</span>
                          <span className="badge badge-leave">{floor.stats.leave} Leave</span>
                          <span className="badge badge-missed">{floor.stats.missed} Missed</span>
                        </div>
                      </div>

                      {/* Room Cards Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                          gap: "1.25rem",
                        }}
                      >
                        {filteredRooms.map((room: any) => (
                          <div
                            key={room.roomNumber}
                            className="card"
                            style={{
                              padding: "1.25rem",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* Room Header */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingBottom: "0.75rem",
                                borderBottom: "1px solid var(--border-subtle)",
                                marginBottom: "0.85rem",
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                                  Room {room.roomNumber}
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.4rem" }}>
                                  ({room.capacityType} • {room.totalBeds} Beds)
                                </span>
                              </div>
                            </div>

                            {/* Beds & Allotted Students List */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                              {room.beds
                                ?.filter((bed: any) => bed.isOccupied)
                                .map((bed: any) => {
                                  const att = bed.attendance;
                                  const student = bed.student;

                                  let badgeClass = "badge-missed";
                                  if (att?.status === "PRESENT") badgeClass = "badge-present";
                                  if (att?.status === "LEAVE") badgeClass = "badge-leave";

                                  return (
                                    <div
                                      key={bed.bedNumber}
                                      style={{
                                        backgroundColor: "#f8fafc",
                                        border: "1px solid var(--border-subtle)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "0.85rem",
                                      }}
                                    >
                                      {/* Student info and status badge */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "flex-start",
                                          marginBottom: "0.5rem",
                                        }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                          <img
                                            src={
                                              student?.avatarUrl ||
                                              "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                                            }
                                            alt={student?.name}
                                            style={{
                                              width: "2.25rem",
                                              height: "2.25rem",
                                              borderRadius: "50%",
                                              objectFit: "cover",
                                              border: "1px solid var(--border-subtle)",
                                            }}
                                          />
                                          <div>
                                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                                              {student?.name}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                              Roll: <strong>{student?.rollNumber}</strong> • Bed {bed.bedNumber}
                                            </div>
                                          </div>
                                        </div>

                                        <span className={`badge ${badgeClass}`}>
                                          {att?.status === "PRESENT"
                                            ? "PRESENT"
                                            : att?.status === "LEAVE"
                                            ? "ON LEAVE"
                                            : "MISSED"}
                                        </span>
                                      </div>

                                      {/* Status specific details & actions */}
                                      {att?.status === "PRESENT" && (
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "0.5rem",
                                            paddingTop: "0.4rem",
                                            borderTop: "1px dashed var(--border-subtle)",
                                            fontSize: "0.8rem",
                                          }}
                                        >
                                          <span style={{ color: "#16a34a", fontWeight: 600 }}>
                                            ✓ {att.timeString}
                                            {att.isManualOverride && " (Override)"}
                                          </span>

                                          {att.selfieImageUrl && (
                                            <button
                                              type="button"
                                              className="btn btn-secondary btn-sm"
                                              onClick={() =>
                                                setSelfieModalData({
                                                  studentName: student?.name,
                                                  rollNumber: student?.rollNumber,
                                                  roomNumber: room.roomNumber,
                                                  time: att.timeString,
                                                  selfieUrl: att.selfieImageUrl,
                                                  remarks: att.remarks,
                                                })
                                              }
                                              style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
                                            >
                                              <Eye size={13} /> View Selfie
                                            </button>
                                          )}
                                        </div>
                                      )}

                                      {att?.status === "LEAVE" && (
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "0.5rem",
                                            paddingTop: "0.4rem",
                                            borderTop: "1px dashed var(--border-subtle)",
                                            fontSize: "0.8rem",
                                          }}
                                        >
                                          <span style={{ color: "#2563eb", fontWeight: 500 }}>
                                            Parent Verified Leave
                                          </span>

                                          <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() =>
                                              setLeaveModalData({
                                                studentName: student?.name,
                                                rollNumber: student?.rollNumber,
                                                reason: att.reason,
                                                notes: att.parentVerificationNotes,
                                              })
                                            }
                                            style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
                                          >
                                            <Eye size={13} /> View Note
                                          </button>
                                        </div>
                                      )}

                                      {att?.status === "MISSED" && (
                                        <div
                                          style={{
                                            marginTop: "0.6rem",
                                            paddingTop: "0.5rem",
                                            borderTop: "1px dashed #fecaca",
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "#dc2626",
                                              marginBottom: "0.4rem",
                                            }}
                                          >
                                            ⚠️ Unaccounted for 7:00–8:00 PM roll-call
                                          </div>

                                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                                            <button
                                              type="button"
                                              className="btn btn-secondary btn-sm"
                                              onClick={() =>
                                                setOverrideModalData({
                                                  student,
                                                  roomNumber: room.roomNumber,
                                                  remark: "Verified in person during night warden inspection",
                                                })
                                              }
                                              style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
                                            >
                                              <CheckCircle2 size={13} /> Override Present
                                            </button>

                                            <button
                                              type="button"
                                              className="btn btn-outline-danger btn-sm"
                                              onClick={() =>
                                                setFineModalData({
                                                  student,
                                                  roomNumber: room.roomNumber,
                                                  fineAmount: 200,
                                                  remark: "Unexcused absence from mandatory evening roll-call",
                                                })
                                              }
                                              style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
                                            >
                                              <ShieldAlert size={13} /> Charge Fine
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )
          )}
        </div>
      )}

      {/* MODAL 1: VIEW SELFIE */}
      {selfieModalData && (
        <div className="modal-overlay" onClick={() => setSelfieModalData(null)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Roll-Call Verification Selfie</h3>
              <button
                onClick={() => setSelfieModalData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
              <img
                src={selfieModalData.selfieUrl}
                alt="Attendance Selfie"
                style={{ width: "100%", maxHeight: "380px", objectFit: "contain", backgroundColor: "#0f172a" }}
              />
            </div>

            <div style={{ marginTop: "1rem", fontSize: "0.85rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Student:</span>{" "}
                <strong>{selfieModalData.studentName}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Roll:</span>{" "}
                <strong>{selfieModalData.rollNumber}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Room:</span>{" "}
                <strong>Room {selfieModalData.roomNumber}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Timestamp:</span>{" "}
                <strong>{selfieModalData.time}</strong>
              </div>
            </div>

            {selfieModalData.remarks && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
                Remarks: {selfieModalData.remarks}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW LEAVE NOTE */}
      {leaveModalData && (
        <div className="modal-overlay" onClick={() => setLeaveModalData(null)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Approved Leave Information</h3>
              <button
                onClick={() => setLeaveModalData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>{leaveModalData.studentName}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                Roll: {leaveModalData.rollNumber}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Leave Reason</label>
              <div style={{ padding: "0.65rem", backgroundColor: "#f8fafc", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                {leaveModalData.reason}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Parent Tele-Call Verification Log</label>
              <div style={{ padding: "0.65rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "#166534" }}>
                {leaveModalData.notes || "Parent tele-call confirmed and verified."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL OVERRIDE */}
      {overrideModalData && (
        <div className="modal-overlay" onClick={() => setOverrideModalData(null)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Manual Attendance Override</h3>
              <button
                onClick={() => setOverrideModalData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              You are overriding attendance for <strong>{overrideModalData.student?.name}</strong> in{" "}
              <strong>Room {overrideModalData.roomNumber}</strong> for {selectedDate}.
            </p>

            <form onSubmit={handleConfirmOverride}>
              <div className="form-group">
                <label className="form-label">Official Override Remark</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={overrideModalData.remark}
                  onChange={(e) =>
                    setOverrideModalData({ ...overrideModalData, remark: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setOverrideModalData(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Overriding..." : "Confirm Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CHARGE FINE */}
      {fineModalData && (
        <div className="modal-overlay" onClick={() => setFineModalData(null)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#dc2626" }}>
                Issue Missed Roll-Call Fine
              </h3>
              <button
                onClick={() => setFineModalData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Issue a disciplinary UPI fine bill to <strong>{fineModalData.student?.name}</strong> (Room {fineModalData.roomNumber}) for missing evening roll-call on {selectedDate}.
            </p>

            <form onSubmit={handleConfirmFine}>
              <div className="form-group">
                <label className="form-label">Fine Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={fineModalData.fineAmount}
                  onChange={(e) =>
                    setFineModalData({ ...fineModalData, fineAmount: Number(e.target.value) })
                  }
                  min={50}
                  step={50}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Disciplinary Remark</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={fineModalData.remark}
                  onChange={(e) =>
                    setFineModalData({ ...fineModalData, remark: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setFineModalData(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger btn-sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Issuing..." : "Issue UPI Fine Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
