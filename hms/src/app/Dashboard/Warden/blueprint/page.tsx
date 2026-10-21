"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastContext";

interface CustomAsset {
  name: string;
  number: string;
  isAvailable?: boolean;
}

interface FurnitureGroup {
  _id?: string;
  groupName: string;
  bedId?: string;
  bedAvailable?: boolean;
  tableId?: string;
  tableAvailable?: boolean;
  chairId?: string;
  chairAvailable?: boolean;
  customAssets?: CustomAsset[];
  isOccupied?: boolean;
  occupiedBy?: string;
  occupiedStudentName?: string;
  occupiedStudentRoll?: string;
  occupiedStudentBranch?: string;
  occupiedStudentSession?: string;
  groupStatus?: "AVAILABLE" | "ASSET_UNAVAILABLE" | "MAINTENANCE";
}

interface Room {
  _id: string;
  roomNumber: string;
  capacity: number;
  roomType: string;
  floorId: string;
  blockId: string;
  hostelId: string;
  furnitureGroups: FurnitureGroup[];
}

interface Floor {
  _id: string;
  name: string;
  floorNumber: number;
  blockId: string;
  rooms?: Room[];
}

interface Block {
  _id: string;
  name: string;
  hostelId: any;
  floors?: Floor[];
}

interface AssetGroupForm {
  groupName: string;
  bedId: string;
  bedAvailable: boolean;
  tableId: string;
  tableAvailable: boolean;
  chairId: string;
  chairAvailable: boolean;
  customAssets: { name: string; number: string; isAvailable: boolean }[];
  isOccupied?: boolean;
  occupiedBy?: string;
  occupiedStudentName?: string;
  occupiedStudentRoll?: string;
  occupiedStudentBranch?: string;
  occupiedStudentSession?: string;
  groupStatus: "AVAILABLE" | "ASSET_UNAVAILABLE" | "MAINTENANCE";
  vacateGroup?: boolean;
}

export default function HostelBlueprintPage() {
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assignedCategory, setAssignedCategory] = useState<string>("");

  // Active Block Selection (Tabs)
  const [activeBlockId, setActiveBlockId] = useState<string>("");

  // Add Block Modal
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [creatingBlock, setCreatingBlock] = useState(false);

  // Add Floor Modal
  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorNumber, setNewFloorNumber] = useState<number>(0);
  const [creatingFloor, setCreatingFloor] = useState(false);

  // Add Room Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedFloorForRoom, setSelectedFloorForRoom] = useState<string>("");
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(2);
  const [newRoomType, setNewRoomType] = useState("Double");
  const [roomAssetGroups, setRoomAssetGroups] = useState<AssetGroupForm[]>([]);
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Manage / Edit Assets Modal State
  const [isManageAssetsOpen, setIsManageAssetsOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingAssetGroups, setEditingAssetGroups] = useState<AssetGroupForm[]>([]);
  const [savingAssets, setSavingAssets] = useState(false);

  // Fetch Blueprint Data
  const fetchBlueprint = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/warden/blueprint");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch blueprint");

      setAssignedCategory(data.assignedCategory || "Hostel");
      const fetchedBlocks = data.blocks || [];
      const fetchedFloors = data.floors || [];
      const fetchedRooms = data.rooms || [];

      setBlocks(fetchedBlocks);
      setFloors(fetchedFloors);
      setRooms(fetchedRooms);

      // Default to first block if no active block is selected or current active is deleted
      if (fetchedBlocks.length > 0) {
        if (!activeBlockId || !fetchedBlocks.some((b: Block) => b._id === activeBlockId)) {
          setActiveBlockId(fetchedBlocks[0]._id);
        }
      } else {
        setActiveBlockId("");
      }
    } catch (err: any) {
      error(err.message, "Failed to Load Blueprint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprint();
  }, []);

  // When room capacity changes in Add Room modal, generate groups with default availability
  const handleCapacityChange = (cap: number, roomNo: string = newRoomNumber) => {
    setNewRoomCapacity(cap);
    if (cap === 1) setNewRoomType("Single");
    else if (cap === 2) setNewRoomType("Double");
    else if (cap === 3) setNewRoomType("Triple");
    else setNewRoomType(`${cap}-Bedded`);

    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const groups: AssetGroupForm[] = [];
    for (let i = 0; i < cap; i++) {
      const letter = letters[i] || `${i + 1}`;
      const rNum = roomNo.trim() || "101";
      groups.push({
        groupName: `Asset Group ${letter}`,
        bedId: `BED-${rNum}-${letter}`,
        bedAvailable: true,
        tableId: `TAB-${rNum}-${letter}`,
        tableAvailable: true,
        chairId: `CHR-${rNum}-${letter}`,
        chairAvailable: true,
        customAssets: [],
        groupStatus: "AVAILABLE",
      });
    }
    setRoomAssetGroups(groups);
  };

  const openAddRoomModal = (floorId: string) => {
    setSelectedFloorForRoom(floorId);
    const fl = floors.find((f) => f._id === floorId);
    const defaultNum = fl ? (fl.floorNumber === 0 ? "001" : `${fl.floorNumber}01`) : "101";
    setNewRoomNumber(defaultNum);
    handleCapacityChange(2, defaultNum);
    setIsAddRoomOpen(true);
  };

  // Helper to accurately render group asset availability badge
  const renderGroupStatusBadge = (
    group: {
      bedAvailable?: boolean;
      tableAvailable?: boolean;
      chairAvailable?: boolean;
      isOccupied?: boolean;
      groupStatus?: string;
      bedId?: string;
      tableId?: string;
      chairId?: string;
    },
    isVacantPrefix = false
  ) => {
    if (group.isOccupied) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
          Occupied
        </span>
      );
    }

    const isBed = group.bedAvailable !== false && (group.bedId === undefined || Boolean(group.bedId));
    const isTable = group.tableAvailable !== false && (group.tableId === undefined || Boolean(group.tableId));
    const isChair = group.chairAvailable !== false && (group.chairId === undefined || Boolean(group.chairId));
    const prefix = isVacantPrefix ? "Vacant • " : "";

    if (!group.bedAvailable || group.groupStatus === "ASSET_UNAVAILABLE") {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
          {prefix}Asset Not Available
        </span>
      );
    }

    // All available
    if (isTable && isChair) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
          {isVacantPrefix ? "Vacant & Ready" : "All Assets Available"}
        </span>
      );
    }

    // Bed & Table available, but Chair not available
    if (isTable && !isChair) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-medium">
          {prefix}Available [Bed, Table]
        </span>
      );
    }

    // Bed & Chair available, but Table not available
    if (!isTable && isChair) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-medium">
          {prefix}Available [Bed, Chair]
        </span>
      );
    }

    // Only Bed available
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-medium">
        {isVacantPrefix ? "Vacant • Bed Only" : "Bed Only"}
      </span>
    );
  };

  // Custom Assets in Add Room Modal
  const addCustomAssetToAddRoomGroup = (groupIndex: number) => {
    setRoomAssetGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].customAssets.push({ name: "", number: "", isAvailable: true });
      return copy;
    });
  };

  const removeCustomAssetFromAddRoomGroup = (groupIndex: number, assetIndex: number) => {
    setRoomAssetGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].customAssets.splice(assetIndex, 1);
      return copy;
    });
  };

  const updateCustomAssetInAddRoomGroup = (
    groupIndex: number,
    assetIndex: number,
    field: "name" | "number" | "isAvailable",
    val: any
  ) => {
    setRoomAssetGroups((prev) => {
      const copy = [...prev];
      (copy[groupIndex].customAssets[assetIndex] as any)[field] = val;
      return copy;
    });
  };

  // Open Edit Assets Modal
  const openManageAssetsModal = (room: Room) => {
    setEditingRoom(room);
    const groups: AssetGroupForm[] = room.furnitureGroups.map((fg, idx) => ({
      groupName: fg.groupName || `Asset Group ${String.fromCharCode(65 + idx)}`,
      bedId: fg.bedId || "",
      bedAvailable: fg.bedAvailable !== undefined ? fg.bedAvailable : Boolean(fg.bedId),
      tableId: fg.tableId || "",
      tableAvailable: fg.tableAvailable !== undefined ? fg.tableAvailable : Boolean(fg.tableId),
      chairId: fg.chairId || "",
      chairAvailable: fg.chairAvailable !== undefined ? fg.chairAvailable : Boolean(fg.chairId),
      customAssets: Array.isArray(fg.customAssets)
        ? fg.customAssets.map((ca) => ({
            name: ca.name,
            number: ca.number,
            isAvailable: ca.isAvailable !== undefined ? ca.isAvailable : true,
          }))
        : [],
      isOccupied: fg.isOccupied || false,
      occupiedBy: fg.occupiedBy,
      occupiedStudentName: fg.occupiedStudentName,
      occupiedStudentRoll: fg.occupiedStudentRoll,
      occupiedStudentBranch: fg.occupiedStudentBranch,
      occupiedStudentSession: fg.occupiedStudentSession,
      groupStatus: fg.groupStatus || (fg.bedAvailable === false ? "ASSET_UNAVAILABLE" : "AVAILABLE"),
    }));
    setEditingAssetGroups(groups);
    setIsManageAssetsOpen(true);
  };


  // Custom Assets in Edit Modal
  const addCustomAssetToEditGroup = (groupIndex: number) => {
    setEditingAssetGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].customAssets.push({ name: "", number: "", isAvailable: true });
      return copy;
    });
  };

  const removeCustomAssetFromEditGroup = (groupIndex: number, assetIndex: number) => {
    setEditingAssetGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].customAssets.splice(assetIndex, 1);
      return copy;
    });
  };

  const updateCustomAssetInEditGroup = (
    groupIndex: number,
    assetIndex: number,
    field: "name" | "number" | "isAvailable",
    val: any
  ) => {
    setEditingAssetGroups((prev) => {
      const copy = [...prev];
      (copy[groupIndex].customAssets[assetIndex] as any)[field] = val;
      return copy;
    });
  };

  // 1. Create Block
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockName.trim()) {
      error("Block name is required", "Validation Error");
      return;
    }
    setCreatingBlock(true);
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
      setIsAddBlockOpen(false);
      await fetchBlueprint();
      if (data.block?._id) setActiveBlockId(data.block._id);
    } catch (err: any) {
      error(err.message, "Block Creation Failed");
    } finally {
      setCreatingBlock(false);
    }
  };

  // 2. Create Floor
  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBlockId) {
      error("No active block selected", "Validation Error");
      return;
    }
    if (!newFloorName.trim()) {
      error("Floor name is required", "Validation Error");
      return;
    }
    setCreatingFloor(true);
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_FLOOR",
          blockId: activeBlockId,
          name: newFloorName.trim(),
          floorNumber: newFloorNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create floor");

      success(`Floor "${newFloorName.trim()}" created successfully!`, "Floor Added");
      setNewFloorName("");
      setNewFloorNumber((prev) => prev + 1);
      setIsAddFloorOpen(false);
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Floor Creation Failed");
    } finally {
      setCreatingFloor(false);
    }
  };

  // 3. Create Room with Group Assets
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBlockId || !selectedFloorForRoom) {
      error("Invalid block or floor selection", "Validation Error");
      return;
    }
    if (!newRoomNumber.trim()) {
      error("Room number is required", "Validation Error");
      return;
    }

    setCreatingRoom(true);
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ROOM",
          blockId: activeBlockId,
          floorId: selectedFloorForRoom,
          roomNumber: newRoomNumber.trim(),
          capacity: newRoomCapacity,
          roomType: newRoomType,
          furnitureGroups: roomAssetGroups,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      success(`Room ${newRoomNumber.trim()} created with ${newRoomCapacity} asset groups!`, "Room Configured");
      setIsAddRoomOpen(false);
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Room Creation Failed");
    } finally {
      setCreatingRoom(false);
    }
  };

  // 4. Save Updated Assets for a Room
  const handleSaveAssets = async () => {
    if (!editingRoom) return;
    setSavingAssets(true);
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ROOM_ASSETS",
          roomId: editingRoom._id,
          furnitureGroups: editingAssetGroups,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update assets");

      success(`Assets updated for Room ${editingRoom.roomNumber}!`, "Assets Saved");
      setIsManageAssetsOpen(false);
      setEditingRoom(null);
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Failed to Update Assets");
    } finally {
      setSavingAssets(false);
    }
  };

  // 5. Vacate a Group (Direct One-Click Action)
  const handleVacateGroup = async (roomId: string, groupIndex: number, groupName?: string) => {
    if (!confirm(`Are you sure you want to make ${groupName || `Group ${String.fromCharCode(65 + groupIndex)}`} vacant? The resident student will be unassigned and returned to the waiting list.`)) {
      return;
    }

    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VACATE_GROUP",
          roomId,
          groupIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to vacate group");

      success(`Group has been made vacant. Student moved to waiting queue.`, "Group Vacated");
      setIsManageAssetsOpen(false);
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Vacate Failed");
    }
  };

  // Delete Actions
  const handleDeleteRoom = async (roomId: string, roomNum: string) => {
    if (!confirm(`Are you sure you want to delete Room ${roomNum}? All its asset groups will be removed.`)) return;
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_ROOM", roomId }),
      });
      if (!res.ok) throw new Error("Failed to delete room");
      success(`Room ${roomNum} deleted.`, "Room Removed");
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Deletion Failed");
    }
  };

  const handleDeleteFloor = async (floorId: string, floorName: string) => {
    if (!confirm(`Are you sure you want to delete "${floorName}" and all its rooms?`)) return;
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_FLOOR", floorId }),
      });
      if (!res.ok) throw new Error("Failed to delete floor");
      success(`Floor "${floorName}" and its rooms deleted.`, "Floor Removed");
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Deletion Failed");
    }
  };

  const handleDeleteBlock = async (blockId: string, blockName: string) => {
    if (!confirm(`Are you sure you want to delete "${blockName}" with all its floors and rooms?`)) return;
    try {
      const res = await fetch("/api/warden/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_BLOCK", blockId }),
      });
      if (!res.ok) throw new Error("Failed to delete block");
      success(`Block "${blockName}" deleted.`, "Block Removed");
      fetchBlueprint();
    } catch (err: any) {
      error(err.message, "Deletion Failed");
    }
  };

  // Filter items for active block
  const activeBlock = blocks.find((b) => b._id === activeBlockId);
  const activeFloors = floors
    .filter((f) => f.blockId === activeBlockId)
    .sort((a, b) => a.floorNumber - b.floorNumber);
  const selectedFloorObj = floors.find((f) => f._id === selectedFloorForRoom);
  const editingRoomFloor = floors.find((f) => f._id === editingRoom?.floorId);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-500">Hostel Physical Blueprint</h1>
            {assignedCategory && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                {assignedCategory}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configure blocks, floors, rooms, asset availability status (Bed/Table/Chair/Custom) & vacancy controls.
          </p>
        </div>

        {/* Global Action: Add Block */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddBlockOpen(true)}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Add Hostel Block</span>
          </button>
        </div>
      </div>

      {/* Block Tabs Strip */}
      {loading ? (
        <div className="text-sm text-gray-500 py-4">Loading hostel structure...</div>
      ) : blocks.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto mb-4">
            <i className="fa-solid fa-building"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">No Blocks Added Yet</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Get started by adding the first block (wing) of your assigned hostel category.
          </p>
          <button
            onClick={() => setIsAddBlockOpen(true)}
            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Add Your First Block</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Horizontal Block Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
            {blocks.map((block) => {
              const blockRooms = rooms.filter((r) => r.blockId === block._id);
              const blockBeds = blockRooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
              const isSelected = block._id === activeBlockId;

              return (
                <button
                  key={block._id}
                  onClick={() => setActiveBlockId(block._id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                    isSelected
                      ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                  }`}
                >
                  <i className="fa-solid fa-building text-xs"></i>
                  <span>{block.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                      isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {blockRooms.length} R • {blockBeds} Beds
                  </span>
                </button>
              );
            })}

            {/* Quick Add Tab Button */}
            <button
              onClick={() => setIsAddBlockOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-300 ml-1"
              title="Add another block"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Add Block</span>
            </button>
          </div>

          {/* Active Block Content Container */}
          {activeBlock && (
            <div className="mt-6 space-y-6">
              {/* Active Block Action Bar */}
              <div className="bg-white border border-gray-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-gray-900">{activeBlock.name}</h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md font-medium">
                      {activeFloors.length} Floors Configured
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage floors, room capacity, asset availability, and group occupancy.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setNewFloorNumber(activeFloors.length);
                      setNewFloorName(
                        activeFloors.length === 0
                          ? "Ground Floor"
                          : activeFloors.length === 1
                          ? "1st Floor"
                          : `${activeFloors.length}nd Floor`
                      );
                      setIsAddFloorOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold border border-gray-400 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>Add Floor</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(activeBlock._id, activeBlock.name)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete entire block"
                  >
                    <i className="fa-solid fa-trash-can mr-1"></i>
                    <span>Delete Block</span>
                  </button>
                </div>
              </div>

              {/* Floors List under Active Block */}
              {activeFloors.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <i className="fa-solid fa-layer-group text-3xl text-gray-400 mb-2"></i>
                  <h3 className="text-sm font-bold text-gray-800">No Floors in {activeBlock.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    Add the first floor (e.g. Ground Floor) to start placing rooms and asset groups.
                  </p>
                  <button
                    onClick={() => {
                      setNewFloorName("Ground Floor");
                      setNewFloorNumber(0);
                      setIsAddFloorOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    + Add Ground Floor
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeFloors.map((floor) => {
                    const floorRooms = rooms.filter((r) => r.floorId === floor._id);
                    const floorCapacity = floorRooms.reduce((acc, r) => acc + (r.capacity || 0), 0);

                    return (
                      <div
                        key={floor._id}
                        className="bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-xs"
                      >
                        {/* Floor Header */}
                        <div className="bg-gray-50/70 border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              F{floor.floorNumber}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">{floor.name}</h3>
                              <span className="text-[11px] text-gray-500">
                                {floorRooms.length} Rooms • {floorCapacity} Total Bed Capacity
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openAddRoomModal(floor._id)}
                              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5"
                            >
                              <i className="fa-solid fa-plus text-[10px]"></i>
                              <span>Add Room to Floor</span>
                            </button>

                            <button
                              onClick={() => handleDeleteFloor(floor._id, floor.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors text-xs"
                              title="Delete floor and rooms"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>

                        {/* Rooms Grid under Floor */}
                        <div className="p-5">
                          {floorRooms.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                              No rooms added to this floor yet. Click "+ Add Room to Floor" above.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {floorRooms.map((room) => {
                                const occupiedCount = room.furnitureGroups.filter((fg) => fg.isOccupied).length;

                                return (
                                  <div
                                    key={room._id}
                                    className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col justify-between hover:border-blue-300 transition-colors shadow-2xs"
                                  >
                                    {/* Room Card Header */}
                                    <div>
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-gray-900">
                                              Room {room.roomNumber}
                                            </span>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                              {room.roomType || `${room.capacity}-Bed`}
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-gray-500 mt-0.5">
                                            Capacity: {room.capacity} | Occupied: {occupiedCount}/{room.capacity}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => openManageAssetsModal(room)}
                                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                            title="Manage Assets, Availability & Vacancy"
                                          >
                                            <i className="fa-solid fa-wrench text-xs"></i>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                            title="Delete room"
                                          >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Occupancy Indicator Bar */}
                                      <div className="w-full bg-gray-100 rounded-full h-1.5 my-2.5 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            occupiedCount === room.capacity
                                              ? "bg-red-500"
                                              : occupiedCount > 0
                                              ? "bg-amber-500"
                                              : "bg-emerald-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(100, (occupiedCount / room.capacity) * 100)}%`,
                                          }}
                                        ></div>
                                      </div>

                                      {/* Group-wise Assets Breakdown */}
                                      <div className="mt-3 space-y-2.5">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                          Asset Groups ({room.furnitureGroups.length})
                                        </div>

                                        {room.furnitureGroups.map((group, gIdx) => {
                                          const bedAvailable = group.bedAvailable !== false && Boolean(group.bedId);
                                          const tableAvailable = group.tableAvailable !== false && Boolean(group.tableId);
                                          const chairAvailable = group.chairAvailable !== false && Boolean(group.chairId);
                                          const isAssetUnavailable = group.bedAvailable === false || group.groupStatus === "ASSET_UNAVAILABLE";

                                          return (
                                            <div
                                              key={gIdx}
                                              className={`border rounded-lg p-2.5 text-xs transition-colors ${
                                                group.isOccupied
                                                  ? "bg-emerald-50/40 border-emerald-200"
                                                  : isAssetUnavailable
                                                  ? "bg-amber-50/40 border-amber-200"
                                                  : "bg-gray-50/70 border-gray-150"
                                              }`}
                                            >
                                              <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-semibold text-gray-800">
                                                  {group.groupName}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                  {renderGroupStatusBadge(group, true)}
                                                </div>
                                              </div>

                                              {/* Standard Assets with Availability Indicators */}
                                              <div className="grid grid-cols-3 gap-1.5 text-[11px] text-gray-600 mt-1">
                                                <div
                                                  className={`px-2 py-1 rounded border text-center ${
                                                    bedAvailable
                                                      ? "bg-white border-gray-200"
                                                      : "bg-amber-50/80 border-amber-200 text-amber-700"
                                                  }`}
                                                >
                                                  <span className="text-gray-400 block text-[9px] uppercase">Bed</span>
                                                  <span className="font-mono truncate block font-medium">
                                                    {bedAvailable ? group.bedId : <span className="text-amber-600 font-sans text-[10px]">Not Available</span>}
                                                  </span>
                                                </div>

                                                <div
                                                  className={`px-2 py-1 rounded border text-center ${
                                                    tableAvailable
                                                      ? "bg-white border-gray-200"
                                                      : "bg-amber-50/80 border-amber-200 text-amber-700"
                                                  }`}
                                                >
                                                  <span className="text-gray-400 block text-[9px] uppercase">Table</span>
                                                  <span className="font-mono truncate block font-medium">
                                                    {tableAvailable ? group.tableId : <span className="text-amber-600 font-sans text-[10px]">Not Available</span>}
                                                  </span>
                                                </div>

                                                <div
                                                  className={`px-2 py-1 rounded border text-center ${
                                                    chairAvailable
                                                      ? "bg-white border-gray-200"
                                                      : "bg-amber-50/80 border-amber-200 text-amber-700"
                                                  }`}
                                                >
                                                  <span className="text-gray-400 block text-[9px] uppercase">Chair</span>
                                                  <span className="font-mono truncate block font-medium">
                                                    {chairAvailable ? group.chairId : <span className="text-amber-600 font-sans text-[10px]">Not Available</span>}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Additional Custom Assets */}
                                              {group.customAssets && group.customAssets.length > 0 && (
                                                <div className="mt-2 pt-1.5 border-t border-gray-200/60">
                                                  <div className="flex flex-wrap gap-1">
                                                    {group.customAssets.map((ca, cIdx) => (
                                                      <span
                                                        key={cIdx}
                                                        className={`text-[10px] font-medium rounded px-1.5 py-0.5 border ${
                                                          ca.isAvailable !== false
                                                            ? "bg-blue-50 text-blue-700 border-blue-100"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                        }`}
                                                      >
                                                        {ca.name}:{" "}
                                                        <span className="font-mono">
                                                          {ca.isAvailable !== false ? ca.number : "Not Available"}
                                                        </span>
                                                      </span>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Occupant details & One-Click Vacate Button */}
                                              {group.isOccupied && (
                                                <div className="mt-2 text-[10px] text-gray-700 bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 flex items-center justify-between">
                                                  <div>
                                                    <span className="font-semibold text-emerald-900 block">
                                                      {group.occupiedStudentName || "Allotted Student"}
                                                    </span>
                                                    <span className="text-emerald-700">
                                                      {group.occupiedStudentRoll ? `${group.occupiedStudentRoll} • ` : ""}
                                                      {group.occupiedStudentBranch || ""}
                                                    </span>
                                                  </div>
                                                  <button
                                                    onClick={() => handleVacateGroup(room._id, gIdx, group.groupName)}
                                                    className="px-2 py-1 text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors flex items-center gap-1"
                                                    title="Make this group vacant and return student to waiting list"
                                                  >
                                                    <i className="fa-solid fa-user-minus text-[9px]"></i>
                                                    <span>Make Vacant</span>
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Card Footer Action */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                      <span className="text-[11px] text-gray-400">
                                        {occupiedCount === 0 ? "All Vacant" : `${room.capacity - occupiedCount} Bed(s) Available`}
                                      </span>
                                      <button
                                        onClick={() => openManageAssetsModal(room)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                      >
                                        <i className="fa-solid fa-wrench text-[10px]"></i>
                                        <span>Manage Assets</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADD BLOCK MODAL */}
      {/* ========================================================================= */}
      {isAddBlockOpen && (
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
                onClick={() => setIsAddBlockOpen(false)}
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
                  placeholder="e.g. Block A, Block B, Ganga Wing, Kosi Block"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  This block will automatically appear as a navigation tab in your blueprint.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddBlockOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBlock || !newBlockName.trim()}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {creatingBlock ? "Adding..." : "Add Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD FLOOR MODAL */}
      {/* ========================================================================= */}
      {isAddFloorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Add Floor to {activeBlock?.name || "Block"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddFloorOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateFloor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Floor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, 1st Floor, 2nd Floor"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Floor Level / Sequence Number
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={newFloorNumber}
                  onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  0 for Ground Floor, 1 for First Floor, etc.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddFloorOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFloor || !newFloorName.trim()}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {creatingFloor ? "Adding..." : "Add Floor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADD ROOM MODAL (WITH ASSET AVAILABILITY TOGGLES & NOT AVAILABLE CONTROLS) */}
      {/* ========================================================================= */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col my-8">
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-sm shadow-xs">
                  <i className="fa-solid fa-door-open"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">Add Room & Configure Asset Groups</h3>
                    {selectedFloorObj && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                        {selectedFloorObj.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Adding room to <strong className="text-gray-700 font-semibold">{selectedFloorObj ? selectedFloorObj.name : "Selected Floor"}</strong> in <strong className="text-gray-700 font-semibold">{activeBlock?.name || "Hostel"}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRoomOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Target Floor Indicator Banner & Floor Switcher */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                    {selectedFloorObj ? `F${selectedFloorObj.floorNumber}` : <i className="fa-solid fa-layer-group"></i>}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        {selectedFloorObj ? selectedFloorObj.name : "Selected Floor"}
                      </span>
                      <span className="text-[11px] text-gray-400">&bull;</span>
                      <span className="text-xs text-gray-600 font-medium">
                        {activeBlock?.name || "Block"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      This room and its assets will be assigned to this floor.
                    </p>
                  </div>
                </div>

                {/* Floor Selector Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Floor:
                  </label>
                  <select
                    value={selectedFloorForRoom}
                    onChange={(e) => {
                      const newFloorId = e.target.value;
                      setSelectedFloorForRoom(newFloorId);
                      const fl = floors.find((f) => f._id === newFloorId);
                      const defaultNum = fl ? (fl.floorNumber === 0 ? "001" : `${fl.floorNumber}01`) : "101";
                      setNewRoomNumber(defaultNum);
                      handleCapacityChange(newRoomCapacity, defaultNum);
                    }}
                    className="text-xs font-semibold bg-white border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs text-gray-800"
                  >
                    {activeFloors.map((fl) => (
                      <option key={fl._id} value={fl._id}>
                        {fl.name} (Floor {fl.floorNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 001, 101"
                    value={newRoomNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRoomNumber(val);
                      handleCapacityChange(newRoomCapacity, val);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Capacity (Beds) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRoomCapacity}
                    onChange={(e) => handleCapacityChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value={1}>1 Bed (Single Room)</option>
                    <option value={2}>2 Beds (Double Room)</option>
                    <option value={3}>3 Beds (Triple Room)</option>
                    <option value={4}>4 Beds (4-Bedded)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Room Type Label
                  </label>
                  <input
                    type="text"
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Asset Groups List */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Asset Groups for this Room ({roomAssetGroups.length} Groups)
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    Toggle individual asset availability
                  </span>
                </div>

                {roomAssetGroups.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className={`border rounded-xl p-4 space-y-3 transition-colors ${
                      !group.bedAvailable || group.groupStatus === "ASSET_UNAVAILABLE"
                        ? "bg-amber-50/30 border-amber-200"
                        : "bg-gray-50/80 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gray-200/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
                          <i className="fa-solid fa-shapes text-xs"></i>
                          {group.groupName}
                        </span>
                        {renderGroupStatusBadge(group, false)}
                      </div>
                    </div>

                    {/* Standard Assets Row with Individual Availability Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Bed Asset */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-gray-700">Bed Number</label>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...roomAssetGroups];
                              copy[gIdx].bedAvailable = !copy[gIdx].bedAvailable;
                              if (!copy[gIdx].bedAvailable) {
                                copy[gIdx].bedId = "";
                              } else if (!copy[gIdx].bedId) {
                                copy[gIdx].bedId = `BED-${newRoomNumber.trim() || "001"}-${String.fromCharCode(65 + gIdx)}`;
                              }
                              setRoomAssetGroups(copy);
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                              group.bedAvailable
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                                : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                            }`}
                          >
                            {group.bedAvailable ? "✓ Available" : "✕ Not Available"}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={group.bedAvailable ? "e.g. BED-001-A" : "Asset Not Available"}
                          disabled={!group.bedAvailable}
                          value={group.bedId}
                          onChange={(e) => {
                            const copy = [...roomAssetGroups];
                            copy[gIdx].bedId = e.target.value;
                            setRoomAssetGroups(copy);
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs border rounded-md font-mono transition-colors ${
                            group.bedAvailable
                              ? "bg-white border-gray-300 text-gray-900"
                              : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                          }`}
                        />
                      </div>

                      {/* Table Asset */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-gray-700">Table Number</label>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...roomAssetGroups];
                              copy[gIdx].tableAvailable = !copy[gIdx].tableAvailable;
                              if (!copy[gIdx].tableAvailable) {
                                copy[gIdx].tableId = "";
                              } else if (!copy[gIdx].tableId) {
                                copy[gIdx].tableId = `TAB-${newRoomNumber.trim() || "001"}-${String.fromCharCode(65 + gIdx)}`;
                              }
                              setRoomAssetGroups(copy);
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                              group.tableAvailable
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                                : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                            }`}
                          >
                            {group.tableAvailable ? "✓ Available" : "✕ Not Available"}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={group.tableAvailable ? "e.g. TAB-001-A" : "Asset Not Available"}
                          disabled={!group.tableAvailable}
                          value={group.tableId}
                          onChange={(e) => {
                            const copy = [...roomAssetGroups];
                            copy[gIdx].tableId = e.target.value;
                            setRoomAssetGroups(copy);
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs border rounded-md font-mono transition-colors ${
                            group.tableAvailable
                              ? "bg-white border-gray-300 text-gray-900"
                              : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                          }`}
                        />
                      </div>

                      {/* Chair Asset */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-gray-700">Chair Number</label>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...roomAssetGroups];
                              copy[gIdx].chairAvailable = !copy[gIdx].chairAvailable;
                              if (!copy[gIdx].chairAvailable) {
                                copy[gIdx].chairId = "";
                              } else if (!copy[gIdx].chairId) {
                                copy[gIdx].chairId = `CHR-${newRoomNumber.trim() || "001"}-${String.fromCharCode(65 + gIdx)}`;
                              }
                              setRoomAssetGroups(copy);
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                              group.chairAvailable
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                                : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                            }`}
                          >
                            {group.chairAvailable ? "✓ Available" : "✕ Not Available"}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={group.chairAvailable ? "e.g. CHR-001-A" : "Asset Not Available"}
                          disabled={!group.chairAvailable}
                          value={group.chairId}
                          onChange={(e) => {
                            const copy = [...roomAssetGroups];
                            copy[gIdx].chairId = e.target.value;
                            setRoomAssetGroups(copy);
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs border rounded-md font-mono transition-colors ${
                            group.chairAvailable
                              ? "bg-white border-gray-300 text-gray-900"
                              : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Custom Assets Section for this Group */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-gray-600">
                          Other Custom Assets (Almirah, Fan, Bookshelf, etc.)
                        </span>
                        <button
                          type="button"
                          onClick={() => addCustomAssetToAddRoomGroup(gIdx)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <i className="fa-solid fa-plus text-[9px]"></i>
                          <span>+ Add Other Asset</span>
                        </button>
                      </div>

                      {group.customAssets.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">
                          No other assets added. Click "+ Add Other Asset" to include almirah, fan, etc.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {group.customAssets.map((ca, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Asset Name (e.g. Almirah, Fan)"
                                value={ca.name}
                                onChange={(e) =>
                                  updateCustomAssetInAddRoomGroup(gIdx, aIdx, "name", e.target.value)
                                }
                                className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white"
                              />
                              <input
                                type="text"
                                placeholder={ca.isAvailable ? "Asset No (e.g. ALM-001-A)" : "Asset Not Available"}
                                disabled={!ca.isAvailable}
                                value={ca.number}
                                onChange={(e) =>
                                  updateCustomAssetInAddRoomGroup(gIdx, aIdx, "number", e.target.value)
                                }
                                className={`flex-1 px-2.5 py-1 text-xs border rounded-md font-mono ${
                                  ca.isAvailable
                                    ? "bg-white border-gray-300 text-gray-900"
                                    : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateCustomAssetInAddRoomGroup(gIdx, aIdx, "isAvailable", !ca.isAvailable)
                                }
                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors ${
                                  ca.isAvailable
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                                    : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                                }`}
                              >
                                {ca.isAvailable ? "✓ Available" : "✕ Not Available"}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCustomAssetFromAddRoomGroup(gIdx, aIdx)}
                                className="p-1 text-gray-400 hover:text-red-600 text-xs"
                                title="Remove asset"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRoom || !newRoomNumber.trim()}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {creatingRoom ? "Configuring..." : "Create Room & Save Assets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MANAGE / EDIT ASSETS MODAL (WITH ASSET AVAILABILITY & MAKE VACANT OPTION) */}
      {/* ========================================================================= */}
      {isManageAssetsOpen && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col my-8">
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-sm shadow-xs">
                  <i className="fa-solid fa-wrench"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">
                      Manage Assets &bull; Room {editingRoom.roomNumber}
                    </h3>
                    {editingRoomFloor && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                        {editingRoomFloor.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    <strong className="text-gray-700 font-semibold">{activeBlock?.name || "Hostel"}</strong> &bull; <strong className="text-gray-700 font-semibold">{editingRoomFloor ? editingRoomFloor.name : "Floor"}</strong> &bull; Room {editingRoom.roomNumber} ({editingRoom.capacity} Beds)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageAssetsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {editingAssetGroups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    group.isOccupied
                      ? "bg-emerald-50/30 border-emerald-200"
                      : !group.bedAvailable || group.groupStatus === "ASSET_UNAVAILABLE"
                      ? "bg-amber-50/30 border-amber-200"
                      : "bg-gray-50/80 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-gray-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
                        <i className="fa-solid fa-shapes text-xs"></i>
                        {group.groupName}
                      </span>
                      {renderGroupStatusBadge(group, false)}
                    </div>
                  </div>

                  {/* Occupant Notice with Make Vacant Button */}
                  {group.isOccupied && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-600 block uppercase tracking-wider">
                          Currently Allotted Student
                        </span>
                        <span className="font-bold text-emerald-950">
                          {group.occupiedStudentName || "Allotted Student"}
                        </span>
                        <span className="text-emerald-700 ml-2">
                          {group.occupiedStudentRoll ? `Roll: ${group.occupiedStudentRoll} • ` : ""}
                          {group.occupiedStudentBranch || ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVacateGroup(editingRoom._id, gIdx, group.groupName)}
                        className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-2xs flex items-center gap-1.5"
                        title="Make this group vacant and return student to waiting list"
                      >
                        <i className="fa-solid fa-user-minus text-[10px]"></i>
                        <span>Make Vacant</span>
                      </button>
                    </div>
                  )}

                  {/* Standard Assets with Availability Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Bed Asset */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-gray-700">Bed Number</label>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...editingAssetGroups];
                            copy[gIdx].bedAvailable = !copy[gIdx].bedAvailable;
                            if (!copy[gIdx].bedAvailable) {
                              copy[gIdx].bedId = "";
                            } else if (!copy[gIdx].bedId) {
                              copy[gIdx].bedId = `BED-${editingRoom.roomNumber}-${String.fromCharCode(65 + gIdx)}`;
                            }
                            setEditingAssetGroups(copy);
                          }}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                            group.bedAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                              : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                          }`}
                        >
                          {group.bedAvailable ? "✓ Available" : "✕ Not Available"}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder={group.bedAvailable ? "e.g. BED-101-A" : "Asset Not Available"}
                        disabled={!group.bedAvailable}
                        value={group.bedId}
                        onChange={(e) => {
                          const copy = [...editingAssetGroups];
                          copy[gIdx].bedId = e.target.value;
                          setEditingAssetGroups(copy);
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-md font-mono transition-colors ${
                          group.bedAvailable
                            ? "bg-white border-gray-300 text-gray-900"
                            : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                        }`}
                      />
                    </div>

                    {/* Table Asset */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-gray-700">Table Number</label>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...editingAssetGroups];
                            copy[gIdx].tableAvailable = !copy[gIdx].tableAvailable;
                            if (!copy[gIdx].tableAvailable) {
                              copy[gIdx].tableId = "";
                            } else if (!copy[gIdx].tableId) {
                              copy[gIdx].tableId = `TAB-${editingRoom.roomNumber}-${String.fromCharCode(65 + gIdx)}`;
                            }
                            setEditingAssetGroups(copy);
                          }}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                            group.tableAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                              : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                          }`}
                        >
                          {group.tableAvailable ? "✓ Available" : "✕ Not Available"}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder={group.tableAvailable ? "e.g. TAB-101-A" : "Asset Not Available"}
                        disabled={!group.tableAvailable}
                        value={group.tableId}
                        onChange={(e) => {
                          const copy = [...editingAssetGroups];
                          copy[gIdx].tableId = e.target.value;
                          setEditingAssetGroups(copy);
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-md font-mono transition-colors ${
                          group.tableAvailable
                            ? "bg-white border-gray-300 text-gray-900"
                            : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                        }`}
                      />
                    </div>

                    {/* Chair Asset */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-gray-700">Chair Number</label>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...editingAssetGroups];
                            copy[gIdx].chairAvailable = !copy[gIdx].chairAvailable;
                            if (!copy[gIdx].chairAvailable) {
                              copy[gIdx].chairId = "";
                            } else if (!copy[gIdx].chairId) {
                              copy[gIdx].chairId = `CHR-${editingRoom.roomNumber}-${String.fromCharCode(65 + gIdx)}`;
                            }
                            setEditingAssetGroups(copy);
                          }}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                            group.chairAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                              : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                          }`}
                        >
                          {group.chairAvailable ? "✓ Available" : "✕ Not Available"}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder={group.chairAvailable ? "e.g. CHR-101-A" : "Asset Not Available"}
                        disabled={!group.chairAvailable}
                        value={group.chairId}
                        onChange={(e) => {
                          const copy = [...editingAssetGroups];
                          copy[gIdx].chairId = e.target.value;
                          setEditingAssetGroups(copy);
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-md font-mono transition-colors ${
                          group.chairAvailable
                            ? "bg-white border-gray-300 text-gray-900"
                            : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Custom Named Assets */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-gray-600">
                        Other Assets (Almirah, Fan, Bookshelf, etc.)
                      </span>
                      <button
                        type="button"
                        onClick={() => addCustomAssetToEditGroup(gIdx)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <i className="fa-solid fa-plus text-[9px]"></i>
                        <span>+ Add Other Asset</span>
                      </button>
                    </div>

                    {group.customAssets.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">
                        No extra assets configured for this group.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {group.customAssets.map((ca, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Asset Name (e.g. Almirah, Fan)"
                              value={ca.name}
                              onChange={(e) =>
                                updateCustomAssetInEditGroup(gIdx, aIdx, "name", e.target.value)
                              }
                              className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white"
                            />
                            <input
                              type="text"
                              placeholder={ca.isAvailable ? "Asset No (e.g. ALM-101-A)" : "Asset Not Available"}
                              disabled={!ca.isAvailable}
                              value={ca.number}
                              onChange={(e) =>
                                updateCustomAssetInEditGroup(gIdx, aIdx, "number", e.target.value)
                              }
                              className={`flex-1 px-2.5 py-1 text-xs border rounded-md font-mono ${
                                ca.isAvailable
                                  ? "bg-white border-gray-300 text-gray-900"
                                  : "bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateCustomAssetInEditGroup(gIdx, aIdx, "isAvailable", !ca.isAvailable)
                              }
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors ${
                                ca.isAvailable
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                                  : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200/70"
                              }`}
                            >
                              {ca.isAvailable ? "✓ Available" : "✕ Not Available"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomAssetFromEditGroup(gIdx, aIdx)}
                              className="p-1 text-gray-400 hover:text-red-600 text-xs"
                              title="Remove asset"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsManageAssetsOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssets}
                disabled={savingAssets}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {savingAssets ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
