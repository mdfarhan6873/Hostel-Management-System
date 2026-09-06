"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ReceiptModal from "@/components/ReceiptModal";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function StudentBillingPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"UNPAID" | "PAID">("UNPAID");
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [payTargetBill, setPayTargetBill] = useState<any | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Receipt Modal
  const [receiptBill, setReceiptBill] = useState<any | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing");
      const data = await res.json();
      if (res.ok && data.bills) {
        setBills(data.bills);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const unpaidBills = bills.filter((b) => b.status === "UNPAID");
  const paidBills = bills.filter((b) => b.status === "PAID");

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetBill || !utrNumber) {
      setError("Please enter your 12-digit UPI UTR / Transaction Reference Number.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const res = await fetch(`/api/billing/${payTargetBill._id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utrNumber,
          paymentMode: "UPI",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to confirm payment.");
        setPaying(false);
        return;
      }

      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      const updatedBill = data.bill;
      setPayTargetBill(null);
      setUtrNumber("");
      await fetchBills();
      setReceiptBill(updatedBill);
    } catch (err: any) {
      setError(err.message || "Network error while processing payment.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Fee Invoices & <span className="text-gradient">UPI Payments</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          View 6-month residential fees, mess leave rebate credits, scan designated UPI QR codes, and download payment receipts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
        <button
          type="button"
          className={`btn ${activeTab === "UNPAID" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("UNPAID")}
        >
          <Clock size={16} /> Due Invoices ({unpaidBills.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "PAID" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("PAID")}
        >
          <CheckCircle2 size={16} /> Paid Bills & Receipts ({paidBills.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading fee statements...</div>
      ) : activeTab === "UNPAID" ? (
        <div>
          {unpaidBills.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "3.5rem" }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: "0 auto 1rem auto" }} />
              <h3>All Dues Cleared!</h3>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                You have no pending hostel or mess bills. All payments are up to date.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {unpaidBills.map((bill) => (
                <div key={bill._id} className="glass-card" style={{ padding: "2rem", border: "1px solid var(--border-glow)" }}>
                  {/* Top Line */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <span className="badge badge-pending" style={{ marginBottom: "0.4rem" }}>
                        Payment Pending
                      </span>
                      <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Invoice {bill.billNumber}</h2>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        Due Date: <strong style={{ color: "#f8fafc" }}>{new Date(bill.dueDate).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Payable</div>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a5b4fc" }}>
                        ₹{bill.totalAmount?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Itemized Breakdown Table */}
                  <div style={{ marginTop: "1.5rem", background: "rgba(15, 23, 42, 0.6)", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.75rem", color: "#e2e8f0" }}>
                      Charge Breakdown:
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {bill.items?.map((item: any, i: number) => {
                        const isCredit = item.amount < 0;
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "0.85rem",
                              paddingBottom: "0.4rem",
                              borderBottom: i < bill.items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            }}
                          >
                            <div>
                              <span style={{ color: isCredit ? "#34d399" : "#f8fafc", fontWeight: 600 }}>{item.title}</span>
                              {item.isRefundable && (
                                <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.4rem" }}>
                                  (100% Refundable Caution Deposit)
                                </span>
                              )}
                              {item.remark && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.remark}</div>
                              )}
                            </div>
                            <div style={{ fontWeight: 700, color: isCredit ? "#34d399" : "#f8fafc" }}>
                              {isCredit ? `-₹${Math.abs(item.amount).toLocaleString()}` : `₹${item.amount.toLocaleString()}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Designated UPI Account Info & Pay Now */}
                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                      paddingTop: "1.25rem",
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        Assigned Payment Route
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a5b4fc" }}>
                        {bill.paymentAccountSnapshot?.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        Payee: {bill.paymentAccountSnapshot?.payeeName}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={() => setPayTargetBill(bill)}
                    >
                      <QrCode size={18} /> Pay via UPI QR <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {paidBills.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
              No paid bills recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {paidBills.map((bill) => (
                <div
                  key={bill._id}
                  className="glass-card"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{bill.billNumber}</span>
                      <span className="badge badge-allotted">Paid</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      Paid On: {bill.paymentDetails?.paidAt ? new Date(bill.paymentDetails.paidAt).toLocaleDateString() : "Cleared"} •
                      UTR: <strong style={{ color: "#f8fafc" }}>{bill.paymentDetails?.utrNumber}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#34d399" }}>
                        ₹{bill.totalAmount?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Paid</div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setReceiptBill(bill)}
                    >
                      <Printer size={15} /> Official Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay Online UPI QR Modal */}
      {payTargetBill && (
        <div className="modal-overlay" onClick={() => setPayTargetBill(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Scan & Pay via UPI
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Total Payable Amount: <strong style={{ color: "#a5b4fc", fontSize: "1.15rem" }}>₹{payTargetBill.totalAmount?.toLocaleString()}</strong>
            </p>

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
                  textAlign: "left",
                }}
              >
                <AlertCircle size={16} style={{ display: "inline", marginRight: "0.35rem" }} /> {error}
              </div>
            )}

            {/* Render Designated Admin QR Code */}
            {payTargetBill.paymentAccountSnapshot?.qrCodeUrl && (
              <div style={{ marginBottom: "1.25rem" }}>
                <img
                  src={payTargetBill.paymentAccountSnapshot.qrCodeUrl}
                  alt="Admin UPI QR Code"
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "12px",
                    border: "5px solid #ffffff",
                    margin: "0 auto",
                    boxShadow: "var(--shadow-lg)",
                  }}
                />
              </div>
            )}

            {/* UPI ID Info & Copy Button */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Official Payee: {payTargetBill.paymentAccountSnapshot?.payeeName}
                </div>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f8fafc", fontFamily: "var(--font-mono)" }}>
                  {payTargetBill.paymentAccountSnapshot?.upiId}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopyUpi(payTargetBill.paymentAccountSnapshot?.upiId)}
              >
                <Copy size={14} /> {copiedUpi ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Payment Confirmation Form */}
            <form onSubmit={handlePaymentSubmit} style={{ textAlign: "left" }}>
              <div className="form-group">
                <label className="form-label">Enter UPI Reference / UTR Number (from your banking app)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 123456789012"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Located under payment details in Google Pay, PhonePe, or Paytm after successful transfer.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPayTargetBill(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success btn-sm" disabled={paying}>
                  {paying ? "Verifying..." : "Confirm Payment & Generate Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal bill={receiptBill} onClose={() => setReceiptBill(null)} />
    </div>
  );
}
