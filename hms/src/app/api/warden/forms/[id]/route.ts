import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CustomForm } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const form = await CustomForm.findById(id).lean();
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (err: any) {
    console.error("GET /api/warden/forms/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch form" }, { status: 500 });
  }
}
