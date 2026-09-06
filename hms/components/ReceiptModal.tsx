"use client";

import React from "react";
import { X, Printer, CheckCircle, Building2, Download } from "lucide-react";

interface ReceiptModalProps {
  bill: any | null;
  onClose: () => void;
}

export default function ReceiptModal({ bill, onClose }: ReceiptModalProps) {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNum = bill.paymentDetails?.receiptNumber || `HMS-RCP-${bill._id.slice(-6)}`;
  const paidDate = bill.paymentDetails?.paidAt
    ? new Date(bill.paymentDetails.paidAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: "680px",
          background: "#ffffff",
          color: "#0f172a",
          padding: "2.5rem 2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actions bar (hidden during print) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Official Fee Payment Receipt</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handlePrint}
              className="btn btn-sm"
              style={{ background: "#4f46e5", color: "#fff", border: "none" }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <Building2 size={24} color="#4f46e5" />
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.01em" }}>
                CAMPUS HOSTEL AUTHORITY
              </span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Residential Life & Mess Dining Management • Central Campus
            </div>
            <div
              style={{
                display: "inline-block",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: "0.25rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginTop: "0.65rem",
                textTransform: "uppercase",
              }}
            >
              ✓ Official Payment Receipt
            </div>
          </div>

          {/* Receipt & Student Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              background: "#f8fafc",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <div style={{ color: "#64748b" }}>Receipt No:</div>
              <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>{receiptNum}</strong>
              <div style={{ color: "#64748b", marginTop: "0.4rem" }}>Bill Number:</div>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{bill.billNumber}</div>
            </div>
            <div>
              <div style={{ color: "#64748b" }}>Student Name:</div>
              <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>{bill.studentName}</strong>
              <div style={{ color: "#64748b", marginTop: "0.4rem" }}>Roll Number:</div>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{bill.studentRollNumber}</div>
            </div>
          </div>

          {/* Charges Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1" }}>Description / Item</th>
                <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1" }}>Category</th>
                <th style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #cbd5e1", textAlign: "right" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item: any, idx: number) => {
                const isCredit = item.amount < 0;
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <div style={{ fontWeight: 600, color: isCredit ? "#059669" : "#1e293b" }}>{item.title}</div>
                      {item.isRefundable && (
                        <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 700 }}>
                          (100% Refundable Caution Deposit)
                        </span>
                      )}
                      {item.remark && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>{item.remark}</div>
                      )}
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#64748b" }}>{item.category}</td>
                    <td
                      style={{
                        padding: "0.6rem 0.75rem",
                        textAlign: "right",
                        fontWeight: 700,
                        color: isCredit ? "#059669" : "#0f172a",
                      }}
                    >
                      {isCredit ? `-₹${Math.abs(item.amount).toLocaleString()}` : `₹${item.amount.toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f8fafc", fontWeight: 800 }}>
                <td colSpan={2} style={{ padding: "0.75rem", textAlign: "right" }}>
                  Total Amount Paid:
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right", fontSize: "1.1rem", color: "#4f46e5" }}>
                  ₹{bill.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Payment Verification Proof details */}
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "8px",
              padding: "0.85rem 1rem",
              fontSize: "0.8rem",
              color: "#065f46",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div>
                <strong>Payment Mode:</strong> {bill.paymentDetails?.paymentMode || "UPI"}
              </div>
              <div>
                <strong>UPI UTR / Txn Ref:</strong> {bill.paymentDetails?.utrNumber || "N/A"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>
                <strong>Payment Date:</strong> {paidDate}
              </div>
              <div>
                <strong>Status:</strong> <span style={{ color: "#059669", fontWeight: 800 }}>CONFIRMED & CLEARED</span>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1rem", fontSize: "0.8rem", color: "#64748b" }}>
            <div>
              Generated electronically by CampusHMS
              <br />
              No physical signature required.
            </div>
            <div style={{ textAlign: "center", borderTop: "1px solid #94a3b8", width: "160px", paddingTop: "0.35rem" }}>
              Accounts Officer
              <br />
              <strong style={{ color: "#0f172a" }}>Hostel Office</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
