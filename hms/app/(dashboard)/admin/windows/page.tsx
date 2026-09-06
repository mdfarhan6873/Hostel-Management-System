"use client";

import React, { useState, useEffect } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import { Calendar, PlusCircle, Building2, Link as LinkIcon, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function AdminWindowsPage() {
  const [windows, setWindows] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [blockName, setBlockName] = useState("All Blocks");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState("");
  const [targetRemark, setTargetRemark] = useState("");
  const [feeStructureUrl, setFeeStructureUrl] = useState("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
  const [rulesRegulationsUrl, setRulesRegulationsUrl] = useState("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [winRes, hostRes] = await Promise.all([
        fetch("/api/application-windows"),
        fetch("/api/hostels"),
      ]);
      const winData = await winRes.json();
      const hostData = await hostRes.json();

      if (winData.windows) setWindows(winData.windows);
      if (hostData.hostels) {
        setHostels(hostData.hostels);
        if (hostData.hostels.length > 0 && !hostelId) {
          setHostelId(hostData.hostels[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !hostelId || !endDate || !targetRemark) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/application-windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hostelId,
          blockName,
          startDate,
          endDate,
          targetRemark,
          feeStructureUrl,
          rulesRegulationsUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create application window.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setTitle("");
      setTargetRemark("");
      fetchData();
    } catch (err: any) {
      setError(err.message || "Network error while creating window.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
            Admission <span className="text-gradient">Application Windows</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Configure time-limited student application forms targeted to specific hostels with rules and fee links.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> Open New Admission Window
        </button>
      </div>

      {/* Windows List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading application windows...
        </div>
      ) : windows.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Calendar size={48} color="var(--accent-primary)" style={{ margin: "0 auto 1rem auto" }} />
          <h3>No Application Windows Configured</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Create an admission round specifying target hostel, deadline, and official doc links.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5rem" }}>
          {windows.map((win) => {
            const isClosed = new Date() > new Date(win.endDate) || !win.isActive;

            return (
              <div key={win._id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{win.title}</h3>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.825rem",
                        color: "#a5b4fc",
                        marginTop: "0.25rem",
                        fontWeight: 600,
                      }}
                    >
                      <Building2 size={14} /> Target: {win.hostelName}
                    </div>
                  </div>

                  <span
                    className={`badge ${isClosed ? "badge-cancelled" : "badge-allotted"}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {isClosed ? "Closed" : "Active"}
                  </span>
                </div>

                {/* Target Audience Remark Banner */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Notice / Who this form is open for:
                  </div>
                  <div style={{ color: "#fcd34d", fontWeight: 600, marginTop: "0.2rem" }}>
                    {win.targetRemark}
                  </div>
                </div>

                {/* Countdown / Schedule */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Deadline:</div>
                    <div style={{ fontWeight: 600 }}>{new Date(win.endDate).toLocaleString()}</div>
                  </div>
                  {!isClosed && <CountdownTimer targetDate={win.endDate} />}
                </div>

                {/* Attached Document Links */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                  }}
                >
                  {win.feeStructureUrl && (
                    <a
                      href={win.feeStructureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", flex: 1 }}
                    >
                      <FileText size={13} /> Fee Structure
                    </a>
                  )}
                  {win.rulesRegulationsUrl && (
                    <a
                      href={win.rulesRegulationsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", flex: 1 }}
                    >
                      <FileText size={13} /> Rules & Regulations
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Admission Window Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: "650px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} color="var(--accent-primary)" /> Open Hostel Admission Window
            </h2>

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

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Admission Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Girls Hostel Fresh Admissions 2026-27"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Target Hostel Selection */}
              <div className="form-group">
                <label className="form-label">Target Hostel (Which Hostel form is being created for)</label>
                <select
                  className="form-select"
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)}
                  required
                >
                  {hostels.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.gender}) - Code: {h.code}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Start Date / Opening Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline / Time Limit (Expiry)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience Notice / Remark (Who is this open for)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Open exclusively for 1st Year B.Tech 2026 Batch and Lateral Entry Students"
                  value={targetRemark}
                  onChange={(e) => setTargetRemark(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Fee Structure Document Link (PDF/URL)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={feeStructureUrl}
                    onChange={(e) => setFeeStructureUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rules & Regulations Document Link (PDF/URL)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={rulesRegulationsUrl}
                    onChange={(e) => setRulesRegulationsUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? "Publishing Window..." : "Publish Admission Window"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
