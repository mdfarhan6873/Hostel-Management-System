"use client";

import React, { useState, useEffect } from "react";
import { QrCode, PlusCircle, Trash2, CheckCircle2, Building2, ShieldCheck, AlertCircle, X } from "lucide-react";

export default function AdminPaymentAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payment-accounts");
      const data = await res.json();
      if (res.ok && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !payeeName || !upiId) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/payment-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          payeeName,
          upiId,
          qrCodeUrl,
          description,
          isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create payment account.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setTitle("");
      setPayeeName("");
      setUpiId("");
      setDescription("");
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || "Network error while saving account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment account?")) return;
    try {
      const res = await fetch(`/api/payment-accounts/${id}`, { method: "DELETE" });
      if (res.ok) fetchAccounts();
    } catch (err) {
      console.error(err);
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
            Official <span className="text-gradient">UPI Payment Accounts & QR</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Configure designated UPI IDs and QR codes for hostel rent, mess fees, and security deposit collections.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> Add New UPI Payment Account
        </button>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading UPI accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <QrCode size={48} color="var(--accent-primary)" style={{ margin: "0 auto 1rem auto" }} />
          <h3>No Payment Accounts Configured</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Add your college or hostel bank UPI ID to receive payments from students.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {accounts.map((acc) => (
            <div key={acc._id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{acc.title}</h3>
                  <div style={{ fontSize: "0.85rem", color: "#a5b4fc", fontWeight: 600 }}>{acc.payeeName}</div>
                </div>

                {acc.isDefault && (
                  <span className="badge badge-allotted" style={{ fontSize: "0.65rem" }}>
                    Default
                  </span>
                )}
              </div>

              {/* UPI ID Banner */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Official UPI ID
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>
                  {acc.upiId}
                </div>
              </div>

              {/* QR Code Preview */}
              {acc.qrCodeUrl && (
                <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                  <img
                    src={acc.qrCodeUrl}
                    alt="UPI QR Code"
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "8px",
                      border: "4px solid #ffffff",
                      margin: "0 auto",
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Scan to pay via any UPI App (GPay, PhonePe, Paytm)
                  </div>
                </div>
              )}

              {acc.description && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{acc.description}</div>
              )}

              <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(acc._id)}
                  style={{ fontSize: "0.75rem" }}
                >
                  <Trash2 size={14} /> Remove Account
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <QrCode size={22} color="var(--accent-primary)" /> Configure UPI Payment Destination
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label">Account Label / Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hostel Maintenance & Rent Account"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Payee Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ABC College Hostel Welfare Trust"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">UPI ID / VPA</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. hosteladmin@sbi or hostelmess@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Custom QR Code Image URL (Optional - Auto-generates if blank)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Leave blank to automatically render live UPI QR code"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purpose / Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Designated account for 6-month hostel rent payments"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    style={{ cursor: "pointer", accentColor: "var(--accent-primary)" }}
                  />
                  Set as default UPI destination for new invoices
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? "Saving Account..." : "Save UPI Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
