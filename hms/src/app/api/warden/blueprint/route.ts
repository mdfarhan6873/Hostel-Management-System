import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Hostel, Block, Floor, Room } from "@/lib/models";
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

    const floors = await Floor.find({ blockId: { $in: blockIds } })
      .sort({ floorNumber: 1 })
      .lean();

    const rooms = await Room.find({ blockId: { $in: blockIds } })
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

    return NextResponse.json({ success: true, blueprint, blocks, floors, rooms });
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
      const { blockId, floorId, roomNumber, capacity, roomType } = body;
      if (!blockId || !floorId || !roomNumber || !capacity) {
        return NextResponse.json({ error: "Missing required room parameters" }, { status: 400 });
      }

      const block = await Block.findById(blockId).lean();
      if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });

      // Generate sequential furniture groups
      const furnitureGroups = [];
      const letters = ["A", "B", "C", "D", "E", "F"];
      for (let i = 0; i < capacity; i++) {
        const letter = letters[i] || `${i + 1}`;
        furnitureGroups.push({
          groupName: `Furniture Group ${letter}`,
          bedId: `BED-${roomNumber}-${letter}`,
          tableId: `TAB-${roomNumber}-${letter}`,
          chairId: `CHR-${roomNumber}-${letter}`,
          isOccupied: false,
        });
      }

      const newRoom = await Room.create({
        roomNumber: roomNumber.trim(),
        floorId,
        blockId,
        hostelId: block.hostelId,
        capacity,
        roomType: roomType || (capacity === 1 ? "Single" : capacity === 2 ? "Double" : "Triple"),
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

    // Action: UPDATE_FURNITURE_IDS
    if (action === "UPDATE_FURNITURE") {
      const { roomId, groupIndex, bedId, tableId, chairId } = body;
      const room = await Room.findById(roomId);
      if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

      if (room.furnitureGroups[groupIndex]) {
        if (bedId) room.furnitureGroups[groupIndex].bedId = bedId.trim();
        if (tableId) room.furnitureGroups[groupIndex].tableId = tableId.trim();
        if (chairId) room.furnitureGroups[groupIndex].chairId = chairId.trim();
        await room.save();
        return NextResponse.json({ success: true, room });
      }
      return NextResponse.json({ error: "Invalid furniture group index" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}

