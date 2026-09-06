"use client";

import React from "react";
import { Bed, User, PlusCircle, CheckCircle } from "lucide-react";

interface BedInfo {
  bedNumber: string;
  isOccupied: boolean;
  studentId?: string;
  studentName?: string;
  studentRollNumber?: string;
}

interface RoomCardProps {
  hostelId: string;
  hostelName: string;
  blockName: string;
  floorNumber: number;
  roomNumber: string;
  capacityType: "SINGLE" | "DOUBLE" | "TRIPLE";
  totalBeds: number;
  beds: BedInfo[];
  onSelectVacantBed?: (params: {
    hostelId: string;
    hostelName: string;
    blockName: string;
    floorNumber: number;
    roomNumber: string;
    bedNumber: string;
  }) => void;
}

export default function RoomCard({
  hostelId,
  hostelName,
  blockName,
  floorNumber,
  roomNumber,
  capacityType,
  totalBeds,
  beds,
  onSelectVacantBed,
}: RoomCardProps) {
  const occupiedCount = beds.filter((b) => b.isOccupied).length;
  const isFull = occupiedCount >= totalBeds;

  return (
    <div className="room-card" style={{ borderColor: isFull ? "var(--border-subtle)" : "rgba(16, 185, 129, 0.3)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.125rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Room {roomNumber}
          </div>
          <span
            className="badge"
            style={{
              fontSize: "0.65rem",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            {capacityType}
          </span>
        </div>

        <div style={{ fontSize: "0.775rem", fontWeight: 700, color: isFull ? "#f87171" : "#34d399" }}>
          {occupiedCount}/{totalBeds} Beds
        </div>
      </div>

      {/* Bed Slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        {beds.map((bed) => {
          if (bed.isOccupied) {
            return (
              <div key={bed.bedNumber} className="bed-slot occupied">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                      background: "var(--accent-primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {bed.bedNumber}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.825rem", color: "#f8fafc" }}>
                      {bed.studentName || "Occupied"}
                    </div>
                    {bed.studentRollNumber && (
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {bed.studentRollNumber}
                      </div>
                    )}
                  </div>
                </div>
                <CheckCircle size={15} color="#10b981" />
              </div>
            );
          } else {
            return (
              <div
                key={bed.bedNumber}
                className="bed-slot vacant"
                onClick={() =>
                  onSelectVacantBed &&
                  onSelectVacantBed({
                    hostelId,
                    hostelName,
                    blockName,
                    floorNumber,
                    roomNumber,
                    bedNumber: bed.bedNumber,
                  })
                }
                title="Click to allot an eligible student to this bed"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {bed.bedNumber}
                  </div>
                  <span style={{ fontWeight: 600 }}>Vacant Bed</span>
                </div>
                {onSelectVacantBed && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    <PlusCircle size={14} /> Allot
                  </span>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
