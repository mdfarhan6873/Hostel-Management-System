import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Hostel } from "@/lib/models/Hostel";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const hostels = await Hostel.find({}).lean();

    // Calculate aggregated capacity metrics for each hostel
    const enrichedHostels = hostels.map((hostel: any) => {
      let totalBeds = 0;
      let occupiedBeds = 0;

      hostel.blocks?.forEach((block: any) => {
        block.floors?.forEach((floor: any) => {
          floor.rooms?.forEach((room: any) => {
            totalBeds += room.totalBeds || room.beds?.length || 0;
            const occupiedInRoom = room.beds?.filter((b: any) => b.isOccupied)?.length || 0;
            occupiedBeds += occupiedInRoom;
          });
        });
      });

      const vacantBeds = totalBeds - occupiedBeds;
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      return {
        ...hostel,
        totalBeds,
        occupiedBeds,
        vacantBeds,
        occupancyRate,
      };
    });

    return NextResponse.json({ success: true, hostels: enrichedHostels });
  } catch (error: any) {
    console.error("Hostels GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch hostels" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can create hostels" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { name, code, gender, wardenName, wardenContact, blocks } = body;

    if (!name || !code || !gender) {
      return NextResponse.json({ error: "Name, Code, and Gender are required." }, { status: 400 });
    }

    const existing = await Hostel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "A hostel with this code already exists." }, { status: 400 });
    }

    const hostel = await Hostel.create({
      name,
      code: code.toUpperCase(),
      gender,
      wardenName: wardenName || "",
      wardenContact: wardenContact || "",
      blocks: blocks || [],
    });

    return NextResponse.json({ success: true, hostel }, { status: 201 });
  } catch (error: any) {
    console.error("Hostels POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create hostel" }, { status: 500 });
  }
}
