"use client";

import React, { useRef } from "react";
import {
  Printer,
  X,
  Building2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Copy,
  Calendar,
  User,
  Phone,
  Mail,
  GraduationCap,
  Download,
} from "lucide-react";

interface ApplicationSlipModalProps {
  application: any;
  credentials?: {
    rollNumber?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
  onClose: () => void;
}

export default function ApplicationSlipModal({
  application,
  credentials,
  onClose,
}: ApplicationSlipModalProps) {
  const [copied, setCopied] = React.useState(false);

  const passwordToDisplay =
    credentials?.password || application?.passwordHint || "••••••••";

  const handleCopyCredentials = () => {
    const credText = `Campus Hostel Credentials\nRoll Number: ${application.rollNumber}\nEmail: ${application.email || credentials?.email}\nPassword: ${passwordToDisplay}`;
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-content application-print-container"
        style={{
          maxWidth: "850px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#0f172a",
          border: "1px solid var(--border-glow)",
          color: "#f8fafc",
          position: "relative",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-pending">
              {application.status || "PENDING"}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Application Slip & Credentials
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              title="Print to printer or Save as PDF"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyCredentials}
            >
              <Copy size={15} /> {copied ? "Copied!" : "Copy Credentials"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div
          id="printable-slip"
          style={{
            background: "#ffffff",
            color: "#0f172a",
            padding: "2rem",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-sans), sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #0f172a",
              paddingBottom: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#1e1b4b",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                }}
              >
                Campus Hostel Administration
              </div>
              <div style={{ fontSize: "0.9rem", color: "#475569", fontWeight: 600 }}>
                Hostel Residency Application & Credential Acknowledgement
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#334155" }}>
              <div>
                <strong>Ref ID:</strong> <code>{application._id}</code>
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : new Date().toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>

          {/* Status & Important Notice Banner */}
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "6px",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  background: "#d97706",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                STATUS: {application.status || "PENDING"}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e" }}>
                Under Administrative Review — Login Unlocks Once Marked ELIGIBLE
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#78350f", margin: "0.35rem 0 0 0", lineHeight: 1.4 }}>
              Your application has been received. In accordance with hostel regulations, you will only be able to sign in
              to the Student Dashboard after the administration reviews your credentials and marks your status as{" "}
              <strong>ELIGIBLE</strong>. Please save or print this slip for your login details.
            </p>
          </div>

          {/* STUDENT CREDENTIALS RETENTION BOX */}
          <div
            style={{
              border: "2px dashed #4f46e5",
              background: "#eef2ff",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "#3730a3",
                fontWeight: 700,
                fontSize: "0.95rem",
                marginBottom: "0.5rem",
              }}
            >
              <KeyRound size={18} /> Student Portal Login Credentials (Keep Safe)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                fontSize: "0.875rem",
              }}
            >
              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Login Roll Number / ID
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e1b4b" }}>
                  {application.rollNumber}
                </div>
              </div>

              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Registered Email
                </div>
                <div style={{ fontWeight: 700, color: "#1e1b4b" }}>
                  {application.email || credentials?.email || "Registered with application"}
                </div>
              </div>

              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Account Password
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#4338ca",
                    fontFamily: "monospace",
                    background: "#ffffff",
                    display: "inline-block",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "4px",
                    border: "1px solid #c7d2fe",
                  }}
                >
                  {passwordToDisplay}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.5rem" }}>
              * You will use your <strong>Roll Number</strong> (or Email) and this <strong>Password</strong> to sign in once approved.
            </div>
          </div>

          {/* Section: Applied Target Hostel */}
          <div style={{ marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              Applied Hostel & Admission Round
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#64748b" }}>Target Hostel:</span>{" "}
                <strong style={{ color: "#0f172a" }}>{application.hostelName}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Allotment Lifecycle:</span>{" "}
                <strong style={{ color: "#d97706" }}>Pending Eligibility & Room Allocation</strong>
              </div>
            </div>
          </div>

          {/* Section: Personal Details */}
          <div style={{ marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              1. Personal Information
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#64748b" }}>Full Name:</span>{" "}
                <strong style={{ color: "#0f172a" }}>{application.name}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Gender / Age:</span>{" "}
                <strong>
                  {application.gender} ({application.age} yrs)
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Date of Birth:</span>{" "}
                <strong>{application.dob || "Provided"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Student Phone:</span>{" "}
                <strong>{application.phone}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Parent's Mobile:</span>{" "}
                <strong>{application.parentPhone}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Blood Group:</span>{" "}
                <strong>{application.bloodGroup || "Not specified"}</strong>
              </div>
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b" }}>Permanent Address:</span> {application.address}
            </div>
          </div>

          {/* Section: Academic Details */}
          <div style={{ marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              2. Academic & Prior Examination Record
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#64748b" }}>Roll Number:</span>{" "}
                <strong>{application.rollNumber}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Registration No:</span>{" "}
                <strong>{application.registrationNumber || "Optional (Update in Portal)"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Branch / Dept:</span>{" "}
                <strong>{application.branch}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Academic Session:</span>{" "}
                <strong>{application.session}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Semester:</span>{" "}
                <strong>Semester {application.semester}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Exam Evaluated:</span>{" "}
                <strong>
                  {application.lastExamType === "12TH"
                    ? `12th (${application.twelfthPercentage}% - ${application.twelfthBoardName})`
                    : `CGPA: ${application.currentCgpa} (${application.semesterSgpaList})`}
                </strong>
              </div>
            </div>
          </div>

          {/* Section: Documents & Declarations */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", marginTop: "0.75rem" }}>
            <div>
              <span style={{ color: "#64748b" }}>Aadhaar Number:</span>{" "}
              <strong>{application.aadhaarNumber}</strong> (Document Attached)
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Medical Remarks:</span>{" "}
              <strong>{application.medicalRemark || "None declared"}</strong>
            </div>
          </div>

          {/* Official Footer / Signatures */}
          <div
            style={{
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px dashed #94a3b8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: "0.8rem",
            }}
          >
            <div>
              <div style={{ fontStyle: "italic", color: "#64748b" }}>
                This is a computer-generated acknowledgement slip from CampusHMS.
              </div>
              <div style={{ color: "#94a3b8", marginTop: "0.2rem" }}>
                Keep this document safe for physical verification during hostel check-in.
              </div>
            </div>

            <div style={{ textAlign: "center", minWidth: "180px" }}>
              <div style={{ borderBottom: "1px solid #0f172a", height: "35px", marginBottom: "0.3rem" }}></div>
              <span style={{ fontWeight: 600, color: "#334155" }}>Student's Signature</span>
            </div>
          </div>
        </div>

        {/* Print Stylesheet */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .application-print-container,
            .application-print-container #printable-slip,
            .application-print-container #printable-slip * {
              visibility: visible !important;
            }
            .application-print-container {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              border: none !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
