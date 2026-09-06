"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AttendanceCamera from "@/components/AttendanceCamera";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import { Camera, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance?studentId=${user.id}&month=${selectedMonth}`);
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
  }, [user, selectedMonth]);

  const isAllotted = user?.allotmentStatus === "ALLOTTED";

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Nightly <span className="text-gradient">Roll-Call & Attendance</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Mandatory room-door verification selfie between 7:00 PM and 8:00 PM daily.
        </p>
      </div>

      {!isAllotted ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem", maxWidth: "600px", margin: "0 auto" }}>
          <AlertCircle size={44} color="#f59e0b" style={{ margin: "0 auto 1rem auto" }} />
          <h3>No Active Room Allotment</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Daily nightly attendance roll-call is only enabled for actively allotted hostel residents.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Live Camera Attendance Module */}
          <AttendanceCamera
            studentName={user?.name || "Student"}
            rollNumber={user?.rollNumber || "2024CS001"}
            roomNumber={user?.roomNumber || "101"}
            hostelName={user?.hostelName || "Girls Hostel"}
            onMarked={() => {
              fetchAttendance();
            }}
          />

          {/* Monthly Attendance Calendar Matrix */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>My Attendance Record</h2>
              <input
                type="month"
                className="form-input"
                style={{ width: "auto" }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>Loading attendance calendar...</div>
            ) : attendanceData ? (
              <AttendanceCalendar
                studentName={attendanceData.student.name}
                rollNumber={attendanceData.student.rollNumber}
                roomNumber={attendanceData.student.roomNumber || "101"}
                month={attendanceData.month}
                calendarDays={attendanceData.calendarDays}
                metrics={attendanceData.metrics}
                isAdmin={false}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
