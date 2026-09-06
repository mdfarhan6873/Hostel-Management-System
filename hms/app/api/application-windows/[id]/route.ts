import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ApplicationWindow } from "@/lib/models/ApplicationWindow";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const updated = await ApplicationWindow.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Window not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, window: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update window" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    await ApplicationWindow.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Window deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete window" }, { status: 500 });
  }
}
