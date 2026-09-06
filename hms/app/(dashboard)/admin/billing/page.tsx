"use client";

import React, { useState, useEffect } from "react";
import ReceiptModal from "@/components/ReceiptModal";
import {
  CreditCard,
  PlusCircle,
  QrCode,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  Trash2,
  AlertCircle,
  X,
  Printer,
} from "lucide-react";

export default function AdminBillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [upiAccounts, setUpiAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<any | null>(null);

  // Form State
  const [recipientType, setRecipientType] = useState<"ALLOTTED_STUDENT" | "ELIGIBLE_APPLICANT">("ALLOTTED_STUDENT");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedUpiId, setSelectedUpiId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [overallRemark, setOverallRemark] = useState("");
  const [billType, setBillType] = useState<"PERIODIC_HOSTEL_MESS" | "ADMISSION_CONFIRMATION" | "FINE" | "CUSTOM">("PERIODIC_HOSTEL_MESS");

  // Mess Rebate Checkbox & settings
  const [applyMessRebate, setApplyMessRebate] = useState(false);
  const [leaveDaysCount, setLeaveDaysCount] = useState(5);
  const [rebatePercentage, setRebatePercentage] = useState(70);

  // Line items
  const [items, setItems] = useState<any[]>([
    { title: "Hostel Room Rent (6 Months)", amount: 24000, category: "HOSTEL_RENT", isRefundable: false, remark: "Room accommodation" },
    { title: "Mess Dining Charges (6 Months)", amount: 18000, category: "MESS_FEE", isRefundable: false, remark: "3 Meals daily" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, upiRes, appsRes] = await Promise.all([
        fetch("/api/billing"),
        fetch("/api/payment-accounts"),
        fetch("/api/applications"),
      ]);

      const billsData = await billsRes.json();
      const upiData = await upiRes.json();
      const appsData = await appsRes.json();

      if (billsData.bills) setBills(billsData.bills);
      if (upiData.accounts) {
        setUpiAccounts(upiData.accounts);
        if (upiData.accounts.length > 0 && !selectedUpiId) {
          setSelectedUpiId(upiData.accounts[0]._id);
        }
      }
      if (appsData.applications) {
        setStudents(appsData.applications);
        if (appsData.applications.length > 0 && !selectedStudentId) {
          setSelectedStudentId(appsData.applications[0].studentId);
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

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { title: "Custom Charge", amount: 1000, category: "OTHER", isRefundable: false, remark: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  // Switch presets
  const handlePresetChange = (type: string) => {
    if (type === "ADMISSION_CONFIRMATION") {
      setRecipientType("ELIGIBLE_APPLICANT");
      setBillType("ADMISSION_CONFIRMATION");
      setItems([
        { title: "One-Time Hostel Admission Fee", amount: 5000, category: "OTHER", isRefundable: false, remark: "Non-refundable processing" },
        { title: "Hostel Caution Security Deposit (100% Refundable)", amount: 10000, category: "SECURITY_DEPOSIT", isRefundable: true, remark: "Refundable on vacating hostel" },
        { title: "First Term Hostel Rent (6 Months)", amount: 24000, category: "HOSTEL_RENT", isRefundable: false, remark: "Term 1 accommodation" },
      ]);
      setApplyMessRebate(false);
    } else if (type === "PERIODIC_HOSTEL_MESS") {
      setRecipientType("ALLOTTED_STUDENT");
      setBillType("PERIODIC_HOSTEL_MESS");
      setItems([
        { title: "Hostel Room Rent (6 Months)", amount: 24000, category: "HOSTEL_RENT", isRefundable: false, remark: "Standard sharing rent" },
        { title: "Mess Dining Charges (6 Months)", amount: 18000, category: "MESS_FEE", isRefundable: false, remark: "Complete dining service" },
      ]);
    } else if (type === "FINE") {
      setRecipientType("ALLOTTED_STUDENT");
      setBillType("FINE");
      setItems([
        { title: "Disciplinary Penalty / Late Roll-Call Fine", amount: 500, category: "FINE", isRefundable: false, remark: "Penalty fee" },
      ]);
      setApplyMessRebate(false);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedUpiId || items.length === 0) {
      setError("Please select a student, at least one charge item, and a designated UPI account.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          recipientType,
          billType,
          items,
          dueDate: dueDate || undefined,
          overallRemark,
          paymentAccountId: selectedUpiId,
          applyMessRebate,
          rebateDaysCount: leaveDaysCount,
          rebatePercentage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate bill.");
        setSubmitting(false);
        return;
      }

      setShowGenerateModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Network error while creating bill.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUpiAccountObj = upiAccounts.find((a) => a._id === selectedUpiId);

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
            Billing & <span className="text-gradient">Fee Management</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Generate 6-month hostel & mess bills, apply leave rebates, and assign designated UPI QR payment accounts.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
          <PlusCircle size={18} /> Generate Custom Student Bill
        </button>
      </div>

      {/* Bills Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading fee invoices...
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <CreditCard size={48} color="var(--accent-primary)" style={{ margin: "0 auto 1rem auto" }} />
          <h3>No Bills Generated Yet</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Click Generate Custom Student Bill to issue a fee invoice to an eligible or allotted student.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "rgba(15, 23, 42, 0.7)", textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "1rem" }}>Bill Number</th>
                <th style={{ padding: "1rem" }}>Student</th>
                <th style={{ padding: "1rem" }}>Designated UPI QR</th>
                <th style={{ padding: "1rem" }}>Amount & Rebate</th>
                <th style={{ padding: "1rem" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const isPaid = bill.status === "PAID";

                return (
                  <tr key={bill._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 700, color: "#f8fafc" }}>{bill.billNumber}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600 }}>{bill.studentName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        Roll: {bill.studentRollNumber}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#a5b4fc" }}>
                        {bill.paymentAccountSnapshot?.title || "Hostel Account"}
                      </div>
                      <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                        UPI ID: <code>{bill.paymentAccountSnapshot?.upiId}</code>
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f8fafc" }}>
                        ₹{bill.totalAmount?.toLocaleString()}
                      </div>
                      {bill.messRebateDetails?.applied && (
                        <div style={{ fontSize: "0.725rem", color: "#34d399", fontWeight: 600 }}>
                          ✓ Rebate Applied ({bill.messRebateDetails.leaveDaysCount} Days)
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <span className={`badge ${isPaid ? "badge-allotted" : "badge-pending"}`}>
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                      {isPaid && bill.paymentDetails?.utrNumber && (
                        <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          UTR: {bill.paymentDetails.utrNumber}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      {isPaid ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReceiptBill(bill)}
                        >
                          <Printer size={14} /> Receipt
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Awaiting payment</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Custom Bill Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={22} color="var(--accent-primary)" /> Generate Custom Student Bill
              </h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
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
                }}
              >
                <AlertCircle size={16} style={{ display: "inline", marginRight: "0.35rem" }} /> {error}
              </div>
            )}

            <form onSubmit={handleGenerateSubmit}>
              {/* Preset Quick Selectors */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Fee Template Preset</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${billType === "PERIODIC_HOSTEL_MESS" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handlePresetChange("PERIODIC_HOSTEL_MESS")}
                  >
                    6-Month Hostel & Mess (Allotted)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${billType === "ADMISSION_CONFIRMATION" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handlePresetChange("ADMISSION_CONFIRMATION")}
                  >
                    Admission & Caution Deposit (Eligible)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${billType === "FINE" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handlePresetChange("FINE")}
                  >
                    Disciplinary Fine
                  </button>
                </div>
              </div>

              {/* Student Selector */}
              <div className="form-group">
                <label className="form-label">Target Student</label>
                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                >
                  {students.map((app) => (
                    <option key={app.studentId} value={app.studentId}>
                      {app.name} ({app.rollNumber}) — {app.hostelName} [{app.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Designated UPI QR Selector */}
              <div className="form-group">
                <label className="form-label">Select Designated Admin UPI Account (Which QR student will pay to)</label>
                <select
                  className="form-select"
                  value={selectedUpiId}
                  onChange={(e) => setSelectedUpiId(e.target.value)}
                  required
                >
                  {upiAccounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.title} — UPI ID: {acc.upiId} ({acc.payeeName})
                    </option>
                  ))}
                </select>
                {selectedUpiAccountObj && (
                  <div style={{ fontSize: "0.75rem", color: "#a5b4fc", marginTop: "0.25rem" }}>
                    Selected Payee: <strong>{selectedUpiAccountObj.payeeName}</strong> | UPI ID: <code>{selectedUpiAccountObj.upiId}</code>
                  </div>
                )}
              </div>

              {/* Mess Fee Leave Rebate System */}
              <div
                style={{
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={applyMessRebate}
                    onChange={(e) => setApplyMessRebate(e.target.checked)}
                    style={{ cursor: "pointer", width: "1.1rem", height: "1.1rem", accentColor: "var(--accent-primary)" }}
                  />
                  <span>Apply Mess Fee Rebate for Approved Leave</span>
                </label>

                {applyMessRebate && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.85rem" }}>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.775rem" }}>Deduct for Days</label>
                      <input
                        type="number"
                        className="form-input"
                        value={leaveDaysCount}
                        onChange={(e) => setLeaveDaysCount(Number(e.target.value))}
                        min={1}
                        max={60}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.775rem" }}>Rebate Percentage / Rate (%)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={rebatePercentage}
                        onChange={(e) => setRebatePercentage(Number(e.target.value))}
                        min={10}
                        max={100}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Line Items Builder */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label className="form-label" style={{ margin: 0 }}>Itemized Charge Breakdown</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem} style={{ fontSize: "0.75rem" }}>
                    + Add Charge Item
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr auto",
                        gap: "0.5rem",
                        alignItems: "center",
                        background: "rgba(15, 23, 42, 0.5)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Item Title"
                        value={item.title}
                        onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                        style={{ fontSize: "0.825rem", padding: "0.45rem" }}
                        required
                      />

                      <input
                        type="number"
                        className="form-input"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => handleItemChange(idx, "amount", Number(e.target.value))}
                        style={{ fontSize: "0.825rem", padding: "0.45rem" }}
                        required
                      />

                      <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={item.isRefundable}
                          onChange={(e) => handleItemChange(idx, "isRefundable", e.target.checked)}
                        />
                        <span>Refundable?</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "0.25rem" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Remark / Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6-Month Hostel and Mess invoice for Semester 3"
                  value={overallRemark}
                  onChange={(e) => setOverallRemark(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? "Generating Bill..." : "Issue & Send Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal bill={selectedReceiptBill} onClose={() => setSelectedReceiptBill(null)} />
    </div>
  );
}
