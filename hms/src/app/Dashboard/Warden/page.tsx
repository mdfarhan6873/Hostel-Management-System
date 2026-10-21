"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";

interface BlueprintData {
  blocksCount: number;
  floorsCount: number;
  roomsCount: number;
  totalCapacity: number;
  availableBeds: number;
  occupiedBeds: number;
}

export default function WardenCommandCenterPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignedCategory, setAssignedCategory] = useState<string>("");
  const [stats, setStats] = useState<BlueprintData>({
    blocksCount: 0,
    floorsCount: 0,
    roomsCount: 0,
    totalCapacity: 0,
    availableBeds: 0,
    occupiedBeds: 0,
  });

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/warden/blueprint");
      const data = await res.json();

      if (data.success) {
        setAssignedCategory(data.assignedCategory || "Hostel Operations");
        const blocks = data.blocks || [];
        const floors = data.floors || [];
        const rooms = data.rooms || [];

        let totalCap = 0;
        let occupied = 0;

        rooms.forEach((r: any) => {
          totalCap += r.capacity || 0;
          if (r.furnitureGroups && Array.isArray(r.furnitureGroups)) {
            r.furnitureGroups.forEach((fg: any) => {
              if (fg.isOccupied) occupied++;
            });
          }
        });

        setStats({
          blocksCount: blocks.length,
          floorsCount: floors.length,
          roomsCount: rooms.length,
          totalCapacity: totalCap,
          occupiedBeds: occupied,
          availableBeds: Math.max(0, totalCap - occupied),
        });
      }
    } catch (err: any) {
      console.error("Failed to load command center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockName.trim()) {
      error("Block name cannot be empty", "Validation Error");
      return;
    }

    setSubmittingBlock(true);
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_BLOCK",
          name: newBlockName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create block");

      success(`Block "${newBlockName.trim()}" created successfully!`, "Block Added");
      setNewBlockName("");
      setIsBlockModalOpen(false);
      fetchDashboardData();
      router.push("/Dashboard/Warden/blueprint");
    } catch (err: any) {
      error(err.message, "Creation Failed");
    } finally {
      setSubmittingBlock(false);
    }
  };

  const actionCards = [
    {
      title: "Hostel Blueprint",
      description: "Interactive hierarchy of blocks, floors, rooms & group-wise assets.",
      icon: "fa-solid fa-layer-group",
      badge: "Core Architecture",
      btnText: "Open Blueprint",
      href: "/Dashboard/Warden/blueprint",
      primary: true,
    },
    {
      title: "Add Hostel Block",
      description: "Add a new residential wing (e.g. Block A, Ganga Block) to your category.",
      icon: "fa-solid fa-building",
      badge: "Quick Action",
      btnText: "+ Add Block",
      onClick: () => setIsBlockModalOpen(true),
    },
    {
      title: "Student Admissions & Waiting",
      description: "Review new applicants, verify Aadhaar/phone and queue for allotment.",
      icon: "fa-solid fa-user-clock",
      badge: "Roster",
      btnText: "Manage Students",
      href: "/Dashboard/Warden/blueprint",
    },
    {
      title: "1-Click Room Allotment",
      description: "Assign students to specific room, bed ID, table ID & chair ID.",
      icon: "fa-solid fa-bed",
      badge: "Allocation",
      btnText: "Allot Rooms",
      href: "/Dashboard/Warden/blueprint",
    },
    {
      title: "Leave Verification",
      description: "Inspect uploaded handwritten applications & parent confirmation notes.",
      icon: "fa-solid fa-file-signature",
      badge: "Discipline",
      btnText: "Review Leaves",
      href: "/Dashboard/Warden/blueprint",
    },
    {
      title: "Mess Bills & Rebates",
      description: "Generate monthly fee bills with automatic leave day deduction.",
      icon: "fa-solid fa-receipt",
      badge: "Accounts",
      btnText: "Billing Engine",
      href: "/Dashboard/Warden/blueprint",
    },
    {
      title: "Official Circulars & Notices",
      description: "Publish hostel circulars, fee rules & document attachments to portal.",
      icon: "fa-solid fa-bullhorn",
      badge: "Circulars",
      btnText: "Publish Notice",
      href: "/Dashboard/Warden/blueprint",
    },
    {
      title: "Disciplinary & Evictions",
      description: "Cancel residency, record eviction remarks and vacate assigned assets.",
      icon: "fa-solid fa-user-xmark",
      badge: "Compliance",
      btnText: "Eviction Log",
      href: "/Dashboard/Warden/blueprint",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-500">
              Hostel Operations Command Center
            </h1>
            {assignedCategory && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {assignedCategory}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Supervise physical blocks, floors, rooms, group assets, student residency, and operational workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="px-4 py-2 text-sm font-medium border border-gray-400 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Add Block</span>
          </button>
          <Link
            href="/Dashboard/Warden/blueprint"
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-layer-group text-xs"></i>
            <span>Hostel Blueprint</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Blocks</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? "..." : stats.blocksCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Active Wings</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Floors</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? "..." : stats.floorsCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Mapped Levels</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rooms</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? "..." : stats.roomsCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Configured Units</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Capacity</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? "..." : stats.totalCapacity}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Total Bed Spaces</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Available Beds</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {loading ? "..." : stats.availableBeds}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">Ready for Allotment</div>
        </div>
      </div>

      {/* Operational Action Buttons Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Operational Action Modules
          </h2>
          <span className="text-xs text-gray-400">Select an action to launch task</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {actionCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                card.primary ? "border-blue-400 shadow-sm ring-1 ring-blue-100" : "border-gray-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                      card.primary
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}
                  >
                    <i className={card.icon}></i>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100 text-gray-600">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.description}</p>
              </div>

              <div>
                {card.href ? (
                  <Link
                    href={card.href}
                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      card.primary
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{card.btnText}</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </Link>
                ) : (
                  <button
                    onClick={card.onClick}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>{card.btnText}</span>
                    <i className="fa-solid fa-plus text-[10px]"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-building"></i>
                </div>
                <h3 className="text-base font-bold text-gray-900">Add New Hostel Block</h3>
              </div>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Block / Wing Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Block A, Block B, Ganga Wing"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  This block will be attached to your assigned category ({assignedCategory || "Hostel"}).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBlock || !newBlockName.trim()}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submittingBlock ? "Creating..." : "Create Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
