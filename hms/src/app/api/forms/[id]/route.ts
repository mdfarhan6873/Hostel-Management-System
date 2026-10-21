import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CustomForm } from "@/lib/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const form = await CustomForm.findById(id).lean();
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const now = new Date();
    const isWithinWindow =
      new Date(form.startDate) <= now && now <= new Date(form.endDate);

    return NextResponse.json({
      form,
      isWithinWindow,
      isClosed: form.status === "CLOSED" || !isWithinWindow,
    });
  } catch (err: any) {
    console.error("GET /api/forms/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to load form" }, { status: 500 });
  }
}
