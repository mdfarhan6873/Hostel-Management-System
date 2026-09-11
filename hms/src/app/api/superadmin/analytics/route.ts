import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Hostel, Block, Room, Student, User } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();

    const [
      hostelCount,
      boysHostelCount,
      girlsHostelCount,
      blockCount,
      roomCount,
      rooms,
      allottedStudents,
      waitingStudents,
      cancelledStudents,
      wardenCount,
    ] = await Promise.all([
      Hostel.countDocuments(),
      Hostel.countDocuments({ type: "boys" }),
      Hostel.countDocuments({ type: "girls" }),
      Block.countDocuments(),
      Room.countDocuments(),
      Room.find().lean(),
      Student.countDocuments({ status: "ALLOTTED" }),
      Student.countDocuments({ status: "WAITING" }),
      Student.countDocuments({ status: "CANCELLED" }),
      User.countDocuments({ role: "warden" }),
    ]);

    let totalCapacity = 0;
    let totalOccupied = 0;

    rooms.forEach((room: any) => {
      totalCapacity += room.capacity || 0;
      if (room.furnitureGroups && Array.isArray(room.furnitureGroups)) {
        room.furnitureGroups.forEach((fg: any) => {
          if (fg.isOccupied) totalOccupied++;
        });
      }
    });

    const occupancyRate =
      totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        hostels: {
          total: hostelCount,
          boys: boysHostelCount,
          girls: girlsHostelCount,
        },
        blocks: blockCount,
        rooms: roomCount,
        capacity: {
          total: totalCapacity,
          occupied: totalOccupied,
          available: Math.max(0, totalCapacity - totalOccupied),
          occupancyRate,
        },
        students: {
          allotted: allottedStudents,
          waiting: waitingStudents,
          cancelled: cancelledStudents,
          total: allottedStudents + waitingStudents + cancelledStudents,
        },
        wardens: wardenCount,
      },
    });
  } catch (error: any) {
    console.error("Super Admin Analytics Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
