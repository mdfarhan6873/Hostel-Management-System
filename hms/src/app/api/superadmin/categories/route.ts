import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Hostel, Block, Room } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();

    const hostels = await Hostel.find().sort({ createdAt: -1 }).lean();

    // Fetch related blocks and rooms for each hostel
    const enrichedHostels = await Promise.all(
      hostels.map(async (hostel: any) => {
        const blocks = await Block.find({ hostelId: hostel._id })
          .populate("wardenId", "name email mobile")
          .lean();

        const rooms = await Room.find({ hostelId: hostel._id }).lean();

        let totalCapacity = 0;
        let occupiedBeds = 0;

        rooms.forEach((r: any) => {
          totalCapacity += r.capacity || 0;
          if (r.furnitureGroups && Array.isArray(r.furnitureGroups)) {
            r.furnitureGroups.forEach((fg: any) => {
              if (fg.isOccupied) occupiedBeds++;
            });
          }
        });

        return {
          ...hostel,
          blocksCount: blocks.length,
          blocks,
          roomsCount: rooms.length,
          totalCapacity,
          occupiedBeds,
          availableBeds: Math.max(0, totalCapacity - occupiedBeds),
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      categories: enrichedHostels, 
      hostels: enrichedHostels 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { name, code, type, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Hostel category name and demographic type (boys/girls/coed) are required" },
        { status: 400 }
      );
    }

    const newHostel = await Hostel.create({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : "",
      type: type.toLowerCase(),
      description: description?.trim() || "",
    });

    return NextResponse.json({ 
      success: true, 
      category: newHostel, 
      hostel: newHostel 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, name, code, type, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updated = await Hostel.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(type && { type: type.toLowerCase() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      category: updated, 
      hostel: updated 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const url = new URL(req.url);
    let id = url.searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // Query param fallback
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const deleted = await Hostel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Hostel category deleted successfully", 
      category: deleted 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
