"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import RoomCard from "@/components/RoomCard";
import AllotmentModal from "@/components/AllotmentModal";
import StudentPickerModal from "@/components/StudentPickerModal";
import {
  Building2,
  Bed,
  Users,
  CheckCircle2,
  PlusCircle,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [hostels, setHostels] = useState<any[]>([]);
  const [selectedHostelIndex, setSelectedHostelIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [allotmentTarget, setAllotmentTarget] = useState<any | null>(null);
  const [studentPickerTarget, setStudentPickerTarget] = useState<any | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // New room state
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState(0);
  const [newRoomCapacity, setNewRoomCapacity] = useState<"SINGLE" | "DOUBLE" | "TRIPLE">("DOUBLE");
  const [addingRoom, setAddingRoom] = useState(false);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hostels");
      const data = await res.json();
      if (res.ok && data.hostels) {
        setHostels(data.hostels);
      }
    } catch (err) {
      console.error("Failed to load hostels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const currentHostel = hostels[selectedHostelIndex] || hostels[0];
  const currentBlock = currentHostel?.blocks?.[0];
  const floors = currentBlock?.floors || [];

  // Totals across all hostels
  const totalSystemBeds = hostels.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
  const totalSystemOccupied = hostels.reduce((acc, h) => acc + (h.occupiedBeds || 0), 0);
  const totalSystemVacant = totalSystemBeds - totalSystemOccupied;
  const overallOccupancy = totalSystemBeds > 0 ? Math.round((totalSystemOccupied / totalSystemBeds) * 100) : 0;

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !currentHostel) return;

    try {
      setAddingRoom(true);
      const numBeds = newRoomCapacity === "SINGLE" ? 1 : newRoomCapacity === "DOUBLE" ? 2 : 3;
      const beds = Array.from({ length: numBeds }).map((_, i) => ({
        bedNumber: String.fromCharCode(65 + i), // "A", "B", "C"
        isOccupied: false,
        studentId: null,
        studentName: "",
        studentRollNumber: "",
      }));

      // Update current hostel blocks
      const updatedBlocks = [...currentHostel.blocks];
      let targetBlock = updatedBlocks[0];
      let targetFloor = targetBlock.floors.find((f: any) => f.floorNumber === Number(newRoomFloor));

      if (!targetFloor) {
        targetFloor = {
          floorNumber: Number(newRoomFloor),
          floorName: newRoomFloor === 0 ? "Ground Floor" : `Floor ${newRoomFloor}`,
          roomRange: `${newRoomFloor * 100}-${newRoomFloor * 100 + 99}`,
          rooms: [],
        };
        targetBlock.floors.push(targetFloor);
      }

      targetFloor.rooms.push({
        roomNumber: newRoomNumber,
        capacityType: newRoomCapacity,
        totalBeds: numBeds,
        beds,
      });

      const res = await fetch(`/api/hostels/${currentHostel._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: updatedBlocks }),
      });

      if (res.ok) {
        setShowAddRoomModal(false);
        setNewRoomNumber("");
        fetchHostels();
      }
    } finally {
      setAddingRoom(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Top Banner */}
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
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Hostel Capacity & <span className="text-gradient">Allotment Matrix</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Interactive real-time floor plan showing room capacities and 1-click bed allocation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddRoomModal(true)}
          >
            <PlusCircle size={17} /> Add Room
          </button>
          <a href="/admin/applications" className="btn btn-primary">
            Review Applications <ArrowRight size={17} />
          </a>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="glass-card" style={{ borderLeft: "4px solid var(--accent-primary)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Campus Capacity
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, marginTop: "0.25rem" }}>{totalSystemBeds}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
            Total residential beds modeled
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: "4px solid #6366f1" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Occupied Beds
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#a5b4fc", marginTop: "0.25rem" }}>
            {totalSystemOccupied}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
            Currently assigned students
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Available / Vacant Beds
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#34d399", marginTop: "0.25rem" }}>
            {totalSystemVacant}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
            Ready for instant 1-click allotment
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: "4px solid #06b6d4" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Occupancy Rate
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#38bdf8", marginTop: "0.25rem" }}>
            {overallOccupancy}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
            System-wide residency load
          </div>
        </div>
      </div>

      {/* Hostel Selector Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
        {hostels.map((hostel, idx) => (
          <button
            key={hostel._id}
            type="button"
            className={`btn ${selectedHostelIndex === idx ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedHostelIndex(idx)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Building2 size={18} />
            <span>{hostel.name}</span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.15)",
              }}
            >
              {hostel.gender}
            </span>
          </button>
        ))}
      </div>

      {/* Current Hostel Details & Live Floor Plan */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          Loading live hostel capacity tree...
        </div>
      ) : !currentHostel ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>No hostels configured yet.</div>
      ) : (
        <div>
          {/* Hostel Header Info */}
          <div
            className="glass-card"
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              background: "rgba(15, 23, 42, 0.6)",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                {currentHostel.name} ({currentBlock?.name || currentHostel.code})
              </h2>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                Warden: <strong style={{ color: "#f8fafc" }}>{currentHostel.wardenName || "Dr. Sunita Deshmukh"}</strong> • Contact: {currentHostel.wardenContact || "9876543299"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", textAlign: "right" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Hostel Capacity</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  {currentHostel.occupiedBeds} / {currentHostel.totalBeds} Beds
                </div>
              </div>
            </div>
          </div>

          {/* Floors & Rooms Hierarchy */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {floors.map((floor: any) => (
              <div key={floor.floorNumber} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Floor Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(99, 102, 241, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-primary)",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                  >
                    F{floor.floorNumber}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                      {floor.floorName || (floor.floorNumber === 0 ? "Ground Floor (0-100)" : `Floor ${floor.floorNumber}`)}
                    </h3>
                  </div>
                  <span className="badge" style={{ marginLeft: "auto", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
                    {floor.rooms?.length || 0} Rooms Configured
                  </span>
                </div>

                {/* Rooms Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1.25rem",
                  }}
                >
                  {floor.rooms?.map((room: any) => (
                    <RoomCard
                      key={room.roomNumber}
                      hostelId={currentHostel._id}
                      hostelName={currentHostel.name}
                      blockName={currentBlock?.name || "Main Block"}
                      floorNumber={floor.floorNumber}
                      roomNumber={room.roomNumber}
                      capacityType={room.capacityType}
                      totalBeds={room.totalBeds}
                      beds={room.beds}
                      onSelectVacantBed={(target) => setAllotmentTarget(target)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1-Click Allotment Modal (Triggered by clicking vacant bed slot) */}
      <AllotmentModal
        target={allotmentTarget}
        onClose={() => setAllotmentTarget(null)}
        onAllotted={() => {
          fetchHostels();
        }}
      />

      {/* Student Picker Modal */}
      <StudentPickerModal
        student={studentPickerTarget}
        onClose={() => setStudentPickerTarget(null)}
        onAllotted={() => {
          fetchHostels();
        }}
      />

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="modal-overlay" onClick={() => setShowAddRoomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PlusCircle size={20} color="var(--accent-primary)" /> Add Room to {currentHostel?.name}
            </h2>

            <form onSubmit={handleAddRoomSubmit}>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <select
                  className="form-select"
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                >
                  {floors.map((f: any) => (
                    <option key={f.floorNumber} value={f.floorNumber}>
                      Floor {f.floorNumber} ({f.floorName})
                    </option>
                  ))}
                  <option value={floors.length}>+ New Floor (Floor {floors.length})</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 104, 203, G04"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity Type</label>
                <select
                  className="form-select"
                  value={newRoomCapacity}
                  onChange={(e: any) => setNewRoomCapacity(e.target.value)}
                >
                  <option value="SINGLE">SINGLE (1 Bed)</option>
                  <option value="DOUBLE">DOUBLE (2 Beds)</option>
                  <option value="TRIPLE">TRIPLE (3 Beds)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddRoomModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={addingRoom}>
                  {addingRoom ? "Adding..." : "Add Room to Floor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
