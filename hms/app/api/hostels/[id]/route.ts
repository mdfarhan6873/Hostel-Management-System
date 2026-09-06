import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Hostel } from "@/lib/models/Hostel";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const hostel = await Hostel.findById(params.id).lean();
    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, hostel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch hostel" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const updated = await Hostel.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, hostel: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update hostel" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    await Hostel.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Hostel deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete hostel" }, { status: 500 });
  }
}
