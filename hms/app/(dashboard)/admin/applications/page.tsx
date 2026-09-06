"use client";

import React, { useState, useEffect } from "react";
import StudentPickerModal from "@/components/StudentPickerModal";
import {
  FileText,
  CheckCircle,
  XCircle,
  Bed,
  Search,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  X,
  FileCheck,
} from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Inspection Drawer
  const [inspectApp, setInspectApp] = useState<any | null>(null);

  // Allotment Modal
  const [allotStudentTarget, setAllotStudentTarget] = useState<any | null>(null);

  // Cancellation Modal
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancellationRemark, setCancellationRemark] = useState("");
  const [cancellationNoticeUrl, setCancellationNoticeUrl] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications?status=${filterStatus}`);
      const data = await res.json();
      if (res.ok && data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const filtered = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.branch.toLowerCase().includes(search.toLowerCase()) ||
      app.hostelName.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkEligible = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ELIGIBLE",
          statusRemark: "Eligible, kindly pay fee and confirm your seat in hostel.",
        }),
      });
      if (res.ok) {
        fetchApplications();
        if (inspectApp && inspectApp._id === id) {
          setInspectApp((prev: any) => ({ ...prev, status: "ELIGIBLE" }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          statusRemark: reason,
        }),
      });
      if (res.ok) {
        fetchApplications();
        if (inspectApp && inspectApp._id === id) {
          setInspectApp((prev: any) => ({ ...prev, status: "REJECTED" }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelAllotmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget || !cancellationRemark) return;

    try {
      setCancelling(true);
      const res = await fetch("/api/allotments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: cancelTarget.studentId,
          remark: cancellationRemark,
          noticeUrl: cancellationNoticeUrl,
        }),
      });

      if (res.ok) {
        setCancelTarget(null);
        setCancellationRemark("");
        setCancellationNoticeUrl("");
        fetchApplications();
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Student <span className="text-gradient">Hostel Applications</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Verify submitted student documents, mark eligibility, trigger visual room allotment, or manage cancellations.
        </p>
      </div>

      {/* Filter Tabs & Search */}
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
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "ELIGIBLE", "ALLOTTED", "CANCELLED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${filterStatus === st ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search
            size={15}
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
            placeholder="Search student or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.4rem", fontSize: "0.85rem", padding: "0.5rem 0.85rem 0.5rem 2.4rem" }}
          />
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading applications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <FileText size={40} color="var(--accent-primary)" style={{ margin: "0 auto 0.75rem auto" }} />
          <h3>No applications found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            No student applications match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "rgba(15, 23, 42, 0.7)", textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "1rem" }}>Applicant</th>
                <th style={{ padding: "1rem" }}>Hostel & Branch</th>
                <th style={{ padding: "1rem" }}>Academics</th>
                <th style={{ padding: "1rem" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                let badgeClass = "badge-pending";
                if (app.status === "ELIGIBLE") badgeClass = "badge-eligible";
                if (app.status === "ALLOTTED") badgeClass = "badge-allotted";
                if (app.status === "CANCELLED" || app.status === "REJECTED") badgeClass = "badge-cancelled";

                return (
                  <tr
                    key={app._id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 700, color: "#f8fafc" }}>{app.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        Roll: <strong style={{ color: "#e2e8f0" }}>{app.rollNumber}</strong>{" "}
                        {app.registrationNumber && `• Reg: ${app.registrationNumber}`}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Phone: {app.phone} • Parent: {app.parentPhone}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600 }}>{app.hostelName}</div>
                      <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)" }}>
                        {app.branch} (Sem {app.semester})
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      {app.lastExamType === "12TH" ? (
                        <div>
                          <span style={{ fontWeight: 600 }}>{app.twelfthPercentage}%</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "0.3rem" }}>
                            ({app.twelfthBoardName || "12th"})
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontWeight: 600 }}>CGPA: {app.currentCgpa}</span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{app.semesterSgpaList}</div>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <span className={`badge ${badgeClass}`}>{app.status}</span>
                      {app.status === "ALLOTTED" && app.allotmentDetails && (
                        <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "0.25rem", fontWeight: 600 }}>
                          Room {app.allotmentDetails.roomNumber} (Bed {app.allotmentDetails.bedNumber})
                        </div>
                      )}
                      {app.status === "CANCELLED" && app.cancellationDetails && (
                        <div style={{ fontSize: "0.725rem", color: "#f87171", marginTop: "0.2rem" }}>
                          {app.cancellationDetails.remark}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setInspectApp(app)}
                          title="View Full Application & Documents"
                        >
                          Details
                        </button>

                        {app.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleMarkEligible(app._id)}
                            >
                              <CheckCircle size={14} /> Mark Eligible
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(app._id)}
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}

                        {app.status === "ELIGIBLE" && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              setAllotStudentTarget({
                                studentId: app.studentId,
                                name: app.name,
                                rollNumber: app.rollNumber,
                              })
                            }
                          >
                            <Bed size={14} /> Allot Room
                          </button>
                        )}

                        {app.status === "ALLOTTED" && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setCancelTarget(app)}
                            title="Cancel Allotment / Evict with official notice link"
                          >
                            <ShieldAlert size={14} /> Cancel / Evict
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Application Drawer / Modal */}
      {inspectApp && (
        <div className="modal-overlay" onClick={() => setInspectApp(null)}>
          <div className="modal-content" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileCheck size={22} color="var(--accent-primary)" /> Application: {inspectApp.name}
              </h2>
              <button
                onClick={() => setInspectApp(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Roll Number:</span>{" "}
                <strong style={{ color: "#fff" }}>{inspectApp.rollNumber}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Registration No:</span>{" "}
                <strong>{inspectApp.registrationNumber || "Not registered yet (Can update later)"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Branch / Dept:</span> <strong>{inspectApp.branch}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Session & Semester:</span>{" "}
                <strong>
                  {inspectApp.session} (Sem {inspectApp.semester})
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Student Mobile:</span> <strong>{inspectApp.phone}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Parents Mobile:</span> <strong>{inspectApp.parentPhone}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Blood Group:</span> <strong>{inspectApp.bloodGroup || "N/A"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Medical Remarks:</span>{" "}
                <strong>{inspectApp.medicalRemark || "None"}</strong>
              </div>
            </div>

            <div style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Address:</span> {inspectApp.address}
            </div>

            {/* Document Links */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Uploaded Verification Documents</div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {inspectApp.aadhaarFileUrl ? (
                  <a href={inspectApp.aadhaarFileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <ExternalLink size={14} /> View Aadhaar ({inspectApp.aadhaarNumber})
                  </a>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No Aadhaar doc attached</span>
                )}

                {inspectApp.photoUrl && (
                  <a href={inspectApp.photoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <ExternalLink size={14} /> View Student Photograph
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allot Room Modal */}
      <StudentPickerModal
        student={allotStudentTarget}
        onClose={() => setAllotStudentTarget(null)}
        onAllotted={() => {
          fetchApplications();
        }}
      />

      {/* Cancel Allotment / Evict Modal with Mandatory Remark & Notice Link */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#f87171" }}>
              <ShieldAlert size={22} /> Cancel Allotment / Eviction
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.35rem", marginBottom: "1.25rem" }}>
              You are revoking the hostel room allotment for <strong style={{ color: "#fff" }}>{cancelTarget.name}</strong> ({cancelTarget.rollNumber}).
            </p>

            <form onSubmit={handleCancelAllotmentSubmit}>
              <div className="form-group">
                <label className="form-label">Mandatory Cancellation / Eviction Reason Remark</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="State the clear disciplinary, academic, or administrative reason..."
                  value={cancellationRemark}
                  onChange={(e) => setCancellationRemark(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Disciplinary Notice / Eviction Order Link</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/notices/eviction-order-2026.pdf"
                  value={cancellationNoticeUrl}
                  onChange={(e) => setCancellationNoticeUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCancelTarget(null)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={cancelling}>
                  {cancelling ? "Revoking..." : "Confirm Cancellation & Free Bed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
