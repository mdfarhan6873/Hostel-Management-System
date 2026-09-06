"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, CheckCircle2, Bed, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface StudentPickerModalProps {
  student: {
    studentId: string;
    name: string;
    rollNumber: string;
    gender?: string;
  } | null;
  onClose: () => void;
  onAllotted: () => void;
}

export default function StudentPickerModal({ student, onClose, onAllotted }: StudentPickerModalProps) {
  const [hostels, setHostels] = useState<any[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!student) return;
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hostels");
        const data = await res.json();
        if (res.ok && data.hostels) {
          setHostels(data.hostels);
          if (data.hostels.length > 0) {
            setSelectedHostelId(data.hostels[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
  }, [student]);

  if (!student) return null;

  const currentHostel = hostels.find((h) => h._id === selectedHostelId) || hostels[0];
  const currentBlock = currentHostel?.blocks?.[0];
  const floors = currentBlock?.floors || [];
  const currentFloorObj = floors.find((f: any) => f.floorNumber === selectedFloor) || floors[0];

  const handleAllotRoom = async (roomNumber: string, bedNumber: string) => {
    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/allotments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.studentId,
          hostelId: currentHostel._id,
          blockName: currentBlock?.name || "Block A",
          floorNumber: currentFloorObj?.floorNumber || 0,
          roomNumber,
          bedNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to allot bed.");
        setSubmitting(false);
        return;
      }

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onAllotted();
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error while allotting.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Building2 size={22} color="var(--accent-primary)" /> Select Room for {student.name}
            </h2>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Roll Number: <strong style={{ color: "#f8fafc" }}>{student.rollNumber}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
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

        {/* Hostel & Floor Selector */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <label className="form-label">Hostel</label>
            <select
              className="form-select"
              value={selectedHostelId}
              onChange={(e) => {
                setSelectedHostelId(e.target.value);
                setSelectedFloor(0);
              }}
            >
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.gender})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "220px" }}>
            <label className="form-label">Floor</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {floors.map((f: any) => (
                <button
                  key={f.floorNumber}
                  type="button"
                  className={`btn btn-sm ${currentFloorObj?.floorNumber === f.floorNumber ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setSelectedFloor(f.floorNumber)}
                >
                  Floor {f.floorNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div style={{ maxHeight: "380px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Loading available rooms...</div>
          ) : !currentFloorObj || !currentFloorObj.rooms || currentFloorObj.rooms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              No rooms configured on this floor yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {currentFloorObj.rooms.map((room: any) => {
                const vacantBeds = room.beds?.filter((b: any) => !b.isOccupied) || [];
                const isFull = vacantBeds.length === 0;

                return (
                  <div
                    key={room.roomNumber}
                    className="room-card"
                    style={{
                      border: isFull ? "1px solid var(--border-subtle)" : "1px solid rgba(16, 185, 129, 0.4)",
                      opacity: isFull ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Room {room.roomNumber}</div>
                      <span className="badge" style={{ fontSize: "0.65rem", background: "rgba(99,102,241,0.15)" }}>
                        {room.capacityType}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: isFull ? "#f87171" : "#34d399", fontWeight: 600 }}>
                      {vacantBeds.length} of {room.totalBeds} Beds Vacant
                    </div>

                    {/* Beds */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.25rem" }}>
                      {room.beds?.map((bed: any) => {
                        if (bed.isOccupied) {
                          return (
                            <div
                              key={bed.bedNumber}
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.3rem 0.5rem",
                                background: "rgba(30, 41, 59, 0.6)",
                                borderRadius: "4px",
                                color: "var(--text-muted)",
                              }}
                            >
                              Bed {bed.bedNumber}: {bed.studentName || "Occupied"}
                            </div>
                          );
                        } else {
                          return (
                            <button
                              key={bed.bedNumber}
                              type="button"
                              className="btn btn-sm btn-success"
                              style={{ fontSize: "0.75rem", padding: "0.35rem 0.6rem" }}
                              disabled={submitting}
                              onClick={() => handleAllotRoom(room.roomNumber, bed.bedNumber)}
                            >
                              Allot Bed {bed.bedNumber}
                            </button>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
