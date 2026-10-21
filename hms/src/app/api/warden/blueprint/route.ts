import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Hostel, Block, Floor, Room, Student } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const warden = await User.findById(auth.userId).lean();
    if (!warden) {
      return NextResponse.json({ error: "Warden account not found" }, { status: 404 });
    }

    // Find blocks supervised by this warden, or all if superadmin
    let blockFilter: any = {};
    if (auth.role === "warden") {
      // Find blocks matching either wardenId or assignedCategory
      const hostelCategory = warden.assignedCategory
        ? await Hostel.findOne({ name: warden.assignedCategory }).lean()
        : null;

      if (hostelCategory) {
        blockFilter = {
          $or: [{ wardenId: warden._id }, { hostelId: hostelCategory._id }],
        };
      } else {
        blockFilter = { wardenId: warden._id };
      }
    }

    const blocks = await Block.find(blockFilter).populate("hostelId", "name type").lean();
    const blockIds = blocks.map((b) => b._id);

    const floors = await Floor.find({ blockId: { $in: blockIds } as any })
      .sort({ floorNumber: 1 })
      .lean();

    const rooms = await Room.find({ blockId: { $in: blockIds } as any })
      .sort({ roomNumber: 1 })
      .lean();

    // Map hierarchy: Blocks -> Floors -> Rooms with furniture groups
    const blueprint = blocks.map((block: any) => {
      const blockFloors = floors
        .filter((f) => f.blockId.toString() === block._id.toString())
        .map((floor: any) => {
          const floorRooms = rooms.filter(
            (r) => r.floorId.toString() === floor._id.toString()
          );
          return {
            ...floor,
            rooms: floorRooms,
          };
        });

      return {
        ...block,
        floors: blockFloors,
      };
    });

    const allHostels = await Hostel.find().lean();
    return NextResponse.json({ 
      success: true, 
      blueprint, 
      blocks, 
      floors, 
      rooms, 
      assignedCategory: warden.assignedCategory,
      hostels: allHostels 
    });
  } catch (error: any) {
    console.error("Blueprint API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch blueprint" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { action } = body;

    // Action: CREATE_ROOM
    if (action === "CREATE_ROOM") {
      const { blockId, floorId, roomNumber, capacity, roomType, furnitureGroups: inputGroups } = body;
      if (!blockId || !floorId || !roomNumber || !capacity) {
        return NextResponse.json({ error: "Missing required room parameters" }, { status: 400 });
      }

      const block = await Block.findById(blockId).lean();
      if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });

      // Generate or parse furniture groups
      let furnitureGroups = [];
      const numCapacity = Number(capacity) || 1;
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

      if (Array.isArray(inputGroups) && inputGroups.length > 0) {
        furnitureGroups = inputGroups.slice(0, numCapacity).map((group: any, i: number) => {
          const letter = letters[i] || `${i + 1}`;
          const bedAvail = group.bedAvailable !== undefined ? Boolean(group.bedAvailable) : true;
          const tableAvail = group.tableAvailable !== undefined ? Boolean(group.tableAvailable) : true;
          const chairAvail = group.chairAvailable !== undefined ? Boolean(group.chairAvailable) : true;

          return {
            groupName: group.groupName || `Asset Group ${letter}`,
            bedId: bedAvail ? String(group.bedId || "").trim() : "",
            bedAvailable: bedAvail,
            tableId: tableAvail ? String(group.tableId || "").trim() : "",
            tableAvailable: tableAvail,
            chairId: chairAvail ? String(group.chairId || "").trim() : "",
            chairAvailable: chairAvail,
            customAssets: Array.isArray(group.customAssets)
              ? group.customAssets
                  .map((ca: any) => ({
                    name: String(ca.name || "").trim(),
                    number: String(ca.number || "").trim(),
                    isAvailable: ca.isAvailable !== undefined ? Boolean(ca.isAvailable) : true,
                  }))
                  .filter((ca: any) => ca.name)
              : [],
            isOccupied: false,
            groupStatus: group.groupStatus || (bedAvail ? "AVAILABLE" : "ASSET_UNAVAILABLE"),
          };
        });
      } else {
        for (let i = 0; i < numCapacity; i++) {
          const letter = letters[i] || `${i + 1}`;
          furnitureGroups.push({
            groupName: `Asset Group ${letter}`,
            bedId: `BED-${roomNumber}-${letter}`,
            bedAvailable: true,
            tableId: `TAB-${roomNumber}-${letter}`,
            tableAvailable: true,
            chairId: `CHR-${roomNumber}-${letter}`,
            chairAvailable: true,
            customAssets: [],
            isOccupied: false,
            groupStatus: "AVAILABLE",
          });
        }
      }

      const newRoom = await Room.create({
        roomNumber: String(roomNumber).trim(),
        floorId,
        blockId,
        hostelId: block.hostelId,
        capacity: numCapacity,
        roomType: roomType || (numCapacity === 1 ? "Single" : numCapacity === 2 ? "Double" : numCapacity === 3 ? "Triple" : `${numCapacity}-Bedded`),
        furnitureGroups,
      });

      return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
    }

    // Action: CREATE_BLOCK (Warden creates a new block in their hostel category)
    if (action === "CREATE_BLOCK") {
      const { name, hostelId } = body;
      if (!name) {
        return NextResponse.json({ error: "Block name is required" }, { status: 400 });
      }

      let targetHostelId = hostelId;
      if (!targetHostelId) {
        const warden = await User.findById(auth.userId).lean();
        if (warden?.assignedCategory) {
          const cat = await Hostel.findOne({ name: warden.assignedCategory }).lean();
          if (cat) targetHostelId = cat._id;
        }
      }
      if (!targetHostelId) {
        const firstHostel = await Hostel.findOne().lean();
        if (firstHostel) targetHostelId = firstHostel._id;
      }

      const newBlock = await Block.create({
        name: name.trim(),
        hostelId: targetHostelId,
        wardenId: auth.userId,
      });

      return NextResponse.json({ success: true, block: newBlock }, { status: 201 });
    }

    // Action: CREATE_FLOOR (Warden creates a floor in a block)
    if (action === "CREATE_FLOOR") {
      const { name, floorNumber, blockId } = body;
      if (!name || floorNumber === undefined || !blockId) {
        return NextResponse.json({ error: "Floor name, number, and block ID are required" }, { status: 400 });
      }

      const newFloor = await Floor.create({
        name: name.trim(),
        floorNumber: Number(floorNumber),
        blockId,
      });

      return NextResponse.json({ success: true, floor: newFloor }, { status: 201 });
    }

    // Action: UPDATE_ROOM_ASSETS
    if (action === "UPDATE_ROOM_ASSETS") {
      const { roomId, furnitureGroups: inputGroups } = body;
      if (!roomId || !Array.isArray(inputGroups)) {
        return NextResponse.json({ error: "Room ID and furnitureGroups array required" }, { status: 400 });
      }

      const room = await Room.findById(roomId);
      if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

      // Merge updated asset values while preserving or vacating occupancy state
      for (let idx = 0; idx < inputGroups.length; idx++) {
        const fg = inputGroups[idx];
        const existing = room.furnitureGroups[idx];
        if (!existing) continue;

        const bedAvail = fg.bedAvailable !== undefined ? Boolean(fg.bedAvailable) : (existing.bedAvailable !== undefined ? existing.bedAvailable : true);
        const tableAvail = fg.tableAvailable !== undefined ? Boolean(fg.tableAvailable) : (existing.tableAvailable !== undefined ? existing.tableAvailable : true);
        const chairAvail = fg.chairAvailable !== undefined ? Boolean(fg.chairAvailable) : (existing.chairAvailable !== undefined ? existing.chairAvailable : true);

        // If explicitly requested to vacate group
        const shouldVacate = fg.vacateGroup === true || fg.makeVacant === true;

        if (shouldVacate && existing.occupiedBy) {
          await Student.findByIdAndUpdate(existing.occupiedBy, {
            status: "WAITING",
            hostelId: undefined,
            blockId: undefined,
            floorId: undefined,
            roomId: undefined,
            furnitureGroupName: undefined,
            assignedBedId: undefined,
            assignedTableId: undefined,
            assignedChairId: undefined,
          });
        }

        existing.groupName = fg.groupName || existing.groupName || `Asset Group ${String.fromCharCode(65 + idx)}`;
        existing.bedId = bedAvail ? (fg.bedId !== undefined ? String(fg.bedId).trim() : (existing.bedId || "")) : "";
        existing.bedAvailable = bedAvail;
        existing.tableId = tableAvail ? (fg.tableId !== undefined ? String(fg.tableId).trim() : (existing.tableId || "")) : "";
        existing.tableAvailable = tableAvail;
        existing.chairId = chairAvail ? (fg.chairId !== undefined ? String(fg.chairId).trim() : (existing.chairId || "")) : "";
        existing.chairAvailable = chairAvail;

        if (Array.isArray(fg.customAssets)) {
          existing.customAssets = fg.customAssets
            .map((ca: any) => ({
              name: String(ca.name || "").trim(),
              number: String(ca.number || "").trim(),
              isAvailable: ca.isAvailable !== undefined ? Boolean(ca.isAvailable) : true,
            }))
            .filter((ca: any) => ca.name);
        }

        if (shouldVacate) {
          existing.isOccupied = false;
          existing.occupiedBy = undefined;
          existing.occupiedStudentName = undefined;
          existing.occupiedStudentRoll = undefined;
          existing.occupiedStudentBranch = undefined;
          existing.occupiedStudentSession = undefined;
        }

        existing.groupStatus = fg.groupStatus || (!bedAvail ? "ASSET_UNAVAILABLE" : "AVAILABLE");
      }

      await room.save();
      return NextResponse.json({ success: true, room });
    }

    // Action: VACATE_GROUP (Explicitly make an allotted group vacant)
    if (action === "VACATE_GROUP") {
      const { roomId, groupIndex } = body;
      if (!roomId || groupIndex === undefined) {
        return NextResponse.json({ error: "Room ID and groupIndex are required" }, { status: 400 });
      }

      const room = await Room.findById(roomId);
      if (!room || !room.furnitureGroups[groupIndex]) {
        return NextResponse.json({ error: "Room or furniture group not found" }, { status: 404 });
      }

      const targetGroup = room.furnitureGroups[groupIndex];
      const studentId = targetGroup.occupiedBy;

      targetGroup.isOccupied = false;
      targetGroup.occupiedBy = undefined;
      targetGroup.occupiedStudentName = undefined;
      targetGroup.occupiedStudentRoll = undefined;
      targetGroup.occupiedStudentBranch = undefined;
      targetGroup.occupiedStudentSession = undefined;
      await room.save();

      if (studentId) {
        await Student.findByIdAndUpdate(studentId, {
          status: "WAITING",
          hostelId: undefined,
          blockId: undefined,
          floorId: undefined,
          roomId: undefined,
          furnitureGroupName: undefined,
          assignedBedId: undefined,
          assignedTableId: undefined,
          assignedChairId: undefined,
        });
      }

      return NextResponse.json({ success: true, room, message: "Group successfully vacated" });
    }

    // Action: DELETE_ROOM
    if (action === "DELETE_ROOM") {
      const { roomId } = body;
      if (!roomId) return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
      await Room.findByIdAndDelete(roomId);
      return NextResponse.json({ success: true, message: "Room deleted successfully" });
    }

    // Action: DELETE_FLOOR
    if (action === "DELETE_FLOOR") {
      const { floorId } = body;
      if (!floorId) return NextResponse.json({ error: "Floor ID is required" }, { status: 400 });
      await Room.deleteMany({ floorId });
      await Floor.findByIdAndDelete(floorId);
      return NextResponse.json({ success: true, message: "Floor and its rooms deleted successfully" });
    }

    // Action: DELETE_BLOCK
    if (action === "DELETE_BLOCK") {
      const { blockId } = body;
      if (!blockId) return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
      await Room.deleteMany({ blockId });
      await Floor.deleteMany({ blockId });
      await Block.findByIdAndDelete(blockId);
      return NextResponse.json({ success: true, message: "Block and its contents deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}

