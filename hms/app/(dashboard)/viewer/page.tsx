"use client";

import React, { useState, useEffect } from "react";
import RoomCard from "@/components/RoomCard";
import {
  Layers,
  Building2,
  Users,
  Search,
  Phone,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ViewerDashboardPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hRes, aRes] = await Promise.all([
          fetch("/api/hostels"),
          fetch("/api/applications?status=ALLOTTED"),
        ]);
        const hData = await hRes.json();
        const aData = await aRes.json();

        if (hData.hostels) setHostels(hData.hostels);
        if (aData.applications) setApplications(aData.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBeds = hostels.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
  const totalOccupied = hostels.reduce((acc, h) => acc + (h.occupiedBeds || 0), 0);
  const occupancyPct = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  const filteredResidents = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.allotmentDetails?.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Hostel Inspection & <span className="text-gradient">Supervisory Overview</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Read-only campus accommodation monitor, emergency medical contacts, and floor-wise occupancy matrix.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="glass-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Hostel Beds
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>{totalBeds}</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Occupied Residents
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a5b4fc", marginTop: "0.25rem" }}>{totalOccupied}</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Occupancy Rate
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399", marginTop: "0.25rem" }}>{occupancyPct}%</div>
        </div>
      </div>

      {/* Searchable Resident Registry & Emergency Medical Directory */}
      <div className="glass-card" style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Resident Directory & Emergency Contacts</h2>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Parent emergency phones and blood group registry for campus wardens and medical staff.
            </div>
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
              placeholder="Search resident, roll no, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.4rem", fontSize: "0.85rem", padding: "0.5rem 0.85rem 0.5rem 2.4rem" }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "0.75rem 1rem", color: "var(--text-primary)", fontWeight: 600 }}>Resident Name</th>
                <th style={{ padding: "0.75rem 1rem" }}>Assigned Room</th>
                <th style={{ padding: "0.75rem 1rem" }}>Student Phone</th>
                <th style={{ padding: "0.75rem 1rem" }}>Emergency Parent Phone</th>
                <th style={{ padding: "0.75rem 1rem" }}>Blood Group</th>
                <th style={{ padding: "0.75rem 1rem" }}>Medical Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((res) => (
                <tr key={res._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 700 }}>{res.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Roll: {res.rollNumber}</div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <strong style={{ color: "#34d399" }}>
                      Room {res.allotmentDetails?.roomNumber} (Bed {res.allotmentDetails?.bedNumber})
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{res.allotmentDetails?.hostelName}</div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <a href={`tel:${res.phone}`} style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>
                      {res.phone}
                    </a>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <a href={`tel:${res.parentPhone}`} style={{ color: "#f59e0b", fontWeight: 700 }}>
                      {res.parentPhone}
                    </a>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
                      {res.bloodGroup || "O+"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {res.medicalRemark || "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Floor Plans */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>
          Campus Hostels & Floor Capacity Tree
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {hostels.map((h) => (
            <div key={h._id} className="glass-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{h.name}</h3>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Gender: {h.gender} • Warden: {h.wardenName} ({h.wardenContact})
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#34d399" }}>
                    {h.occupiedBeds} / {h.totalBeds} Beds Occupied
                  </div>
                </div>
              </div>

              {/* Floor sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {h.blocks?.[0]?.floors?.map((floor: any) => (
                  <div key={floor.floorNumber}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#a5b4fc", marginBottom: "0.75rem" }}>
                      {floor.floorName || `Floor ${floor.floorNumber}`}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {floor.rooms?.map((room: any) => (
                        <RoomCard
                          key={room.roomNumber}
                          hostelId={h._id}
                          hostelName={h.name}
                          blockName={h.blocks?.[0]?.name || "Main"}
                          floorNumber={floor.floorNumber}
                          roomNumber={room.roomNumber}
                          capacityType={room.capacityType}
                          totalBeds={room.totalBeds}
                          beds={room.beds}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
