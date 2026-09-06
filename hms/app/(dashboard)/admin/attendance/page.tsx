"use client";

import React, { useState, useEffect } from "react";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import { Camera, Calendar, User, Search, AlertCircle, ShieldAlert } from "lucide-react";

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch allotted students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/applications?status=ALLOTTED");
        const data = await res.json();
        if (res.ok && data.applications) {
          setStudents(data.applications);
          if (data.applications.length > 0) {
            setSelectedStudentId(data.applications[0].studentId);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  // Fetch attendance for chosen student & month
  const fetchAttendance = async () => {
    if (!selectedStudentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance?studentId=${selectedStudentId}&month=${selectedMonth}`);
      const data = await res.json();
      if (res.ok) {
        setAttendanceData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedStudentId, selectedMonth]);

  const handleResolveMissedDay = async (params: {
    date: string;
    actionType: "WARNING" | "FINE" | "EXCUSED" | "EVICTION";
    remark: string;
    fineAmount?: number;
  }) => {
    const res = await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudentId,
        date: params.date,
        actionType: params.actionType,
        remark: params.remark,
        fineAmount: params.fineAmount,
      }),
    });

    if (res.ok) {
      fetchAttendance();
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Roll-Call & <span className="text-gradient">Attendance Calendar</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Inspect nightly 7–8 PM room-selfie attendance, review approved leaves, and manage missed roll-call disciplinary actions.
        </p>
      </div>

      {/* Selectors Bar */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px" }}>
          <label className="form-label">Select Allotted Student</label>
          <select
            className="form-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map((st) => (
              <option key={st.studentId} value={st.studentId}>
                {st.name} ({st.rollNumber}) — Room {st.allotmentDetails?.roomNumber || "N/A"}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: "200px" }}>
          <label className="form-label">Attendance Month</label>
          <input
            type="month"
            className="form-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Calendar Matrix */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          Loading student monthly calendar matrix...
        </div>
      ) : !attendanceData ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          No attendance records found for this student.
        </div>
      ) : (
        <AttendanceCalendar
          studentName={attendanceData.student.name}
          rollNumber={attendanceData.student.rollNumber}
          roomNumber={attendanceData.student.roomNumber || "101"}
          month={attendanceData.month}
          calendarDays={attendanceData.calendarDays}
          metrics={attendanceData.metrics}
          isAdmin={true}
          onResolveMissedDay={handleResolveMissedDay}
        />
      )}
    </div>
  );
}
