"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Bed,
  CheckCircle2,
  Clock,
  CreditCard,
  Camera,
  FileCheck,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState<any | null>(null);
  const [unpaidBill, setUnpaidBill] = useState<any | null>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appRes, billRes, hostelRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/billing?status=UNPAID"),
          fetch("/api/hostels"),
        ]);

        const appData = await appRes.json();
        const billData = await billRes.json();
        const hostData = await hostelRes.json();

        if (appData.applications && appData.applications.length > 0) {
          const myApp = appData.applications[0];
          setApplication(myApp);

          // Find roommates if allotted
          if (myApp.status === "ALLOTTED" && myApp.allotmentDetails) {
            const targetRoomNum = myApp.allotmentDetails.roomNumber;
            const targetHostel = hostData.hostels?.find((h: any) => h.name === myApp.allotmentDetails.hostelName);
            if (targetHostel) {
              let foundRoommates: any[] = [];
              targetHostel.blocks?.forEach((b: any) => {
                b.floors?.forEach((f: any) => {
                  const room = f.rooms?.find((r: any) => r.roomNumber === targetRoomNum);
                  if (room) {
                    foundRoommates = room.beds
                      ?.filter((b: any) => b.isOccupied && b.studentId !== user?.id)
                      ?.map((b: any) => ({
                        name: b.studentName,
                        rollNumber: b.studentRollNumber,
                        bedNumber: b.bedNumber,
                      }));
                  }
                });
              });
              setRoommates(foundRoommates);
            }
          }
        }

        if (billData.bills && billData.bills.length > 0) {
          setUnpaidBill(billData.bills[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const status = application?.status || user?.allotmentStatus || "NOT_APPLIED";

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Welcome back, <span className="text-gradient">{user?.name}</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Roll Number: <strong style={{ color: "#f8fafc" }}>{user?.rollNumber || "Pending"}</strong>{" "}
          {user?.registrationNumber ? (
            <span>• Reg No: <strong>{user.registrationNumber}</strong></span>
          ) : (
            <span style={{ color: "#f59e0b" }}>
              • Reg No: <em>Not set (Update in Profile)</em>
            </span>
          )}
        </p>
      </div>

      {/* Real-time Status Alert Banners */}
      {status === "ELIGIBLE" && (
        <div
          className="glass-card"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
            border: "1px solid var(--accent-primary)",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#a5b4fc", fontWeight: 700 }}>
              <CheckCircle2 size={20} color="var(--accent-secondary)" /> CONGRATULATIONS! YOU ARE ELIGIBLE
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "0.25rem" }}>
              Kindly pay your hostel fee to confirm your seat allotment!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Your application was approved by the administration. Scan the designated UPI QR code to secure your room.
            </p>
          </div>

          <a href="/student/billing" className="btn btn-primary btn-lg">
            Pay Fee & Confirm Seat <ArrowRight size={18} />
          </a>
        </div>
      )}

      {status === "PENDING" && (
        <div
          className="glass-card"
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            padding: "1.25rem 1.75rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Clock size={28} color="#fcd34d" />
          <div>
            <div style={{ fontWeight: 800, color: "#fcd34d", fontSize: "1.05rem" }}>
              Application Under Administrative Review
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>
              Your application for hostel admission has been received and is currently being verified by the warden office.
            </p>
          </div>
        </div>
      )}

      {status === "CANCELLED" && (
        <div
          className="glass-card"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f87171", fontWeight: 800, fontSize: "1.1rem" }}>
            <ShieldAlert size={22} /> ALLOTMENT CANCELLED / EVICTION NOTICE
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.95rem", color: "#fca5a5" }}>
            Remark: <strong>{application?.cancellationDetails?.remark || "Hostel allotment revoked."}</strong>
          </div>
          {application?.cancellationDetails?.noticeUrl && (
            <div style={{ marginTop: "0.85rem" }}>
              <a
                href={application.cancellationDetails.noticeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={14} /> Read Official Disciplinary / Eviction Notice
              </a>
            </div>
          )}
        </div>
      )}

      {status === "NOT_APPLIED" && (
        <div
          className="glass-card"
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid var(--border-glow)",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Apply for Campus Hostel Accommodation</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Hostel admissions are currently open. Submit your details, academic marks, and Aadhaar document.
            </p>
          </div>
          <a href="/student/apply" className="btn btn-primary">
            Start Application <ArrowRight size={16} />
          </a>
        </div>
      )}

      {/* Allotted Room Details Card */}
      {status === "ALLOTTED" && application?.allotmentDetails && (
        <div
          className="glass-card"
          style={{
            padding: "2rem",
            marginBottom: "2.5rem",
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <span className="badge badge-allotted" style={{ marginBottom: "0.5rem" }}>
                ✓ Room Confirmed & Allotted
              </span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
                {application.allotmentDetails.hostelName} — Room {application.allotmentDetails.roomNumber}
              </h2>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Block: {application.allotmentDetails.blockName} • Floor: {application.allotmentDetails.floorNumber} • Assigned Bed Slot: <strong style={{ color: "#34d399" }}>Bed {application.allotmentDetails.bedNumber}</strong>
              </div>
            </div>

            <a href="/student/attendance" className="btn btn-primary">
              <Camera size={16} /> Mark Nightly Attendance (7-8 PM)
            </a>
          </div>

          {/* Roommates Info */}
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.925rem", marginBottom: "0.75rem", color: "#f8fafc" }}>
              Roommates in Room {application.allotmentDetails.roomNumber}:
            </div>
            {roommates.length === 0 ? (
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No other roommates assigned yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {roommates.map((rm, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(15, 23, 42, 0.7)",
                      border: "1px solid var(--border-subtle)",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{rm.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Roll: {rm.rollNumber} • Bed {rm.bedNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <a href="/student/attendance" className="glass-card interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "var(--radius-md)", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
            <Camera size={22} />
          </div>
          <h3 style={{ fontSize: "1.15rem" }}>Nightly Roll Call (7-8 PM)</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Capture your mandatory room-door verification selfie and view your monthly attendance calendar.
          </p>
        </a>

        <a href="/student/leaves" className="glass-card interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-secondary)" }}>
            <FileCheck size={22} />
          </div>
          <h3 style={{ fontSize: "1.15rem" }}>Handwritten Leave Application</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Upload your written leave request letter for parental telephone verification and mess fee rebate credits.
          </p>
        </a>

        <a href="/student/billing" className="glass-card interactive" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-success)" }}>
            <CreditCard size={22} />
          </div>
          <h3 style={{ fontSize: "1.15rem" }}>Fee Invoices & Receipts</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            View due bills, scan Admin UPI QR codes, submit transaction UTR numbers, and print payment receipts.
          </p>
        </a>
      </div>
    </div>
  );
}
