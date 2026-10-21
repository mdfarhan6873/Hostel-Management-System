import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AdmissionNotice, CustomForm } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const now = new Date();

    // 1. Fetch public active notices
    const notices = await AdmissionNotice.find({
      isActive: true,
      $or: [{ visibility: "PUBLIC" }, { visibility: { $exists: false } }],
    })
      .sort({ publishDate: -1 })
      .limit(10)
      .lean();

    // 2. Fetch public active forms currently within submission window
    const forms = await CustomForm.find({
      status: "ACTIVE",
      visibility: "PUBLIC",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      notices,
      forms,
    });
  } catch (error: any) {
    console.error("GET /api/public/notices-and-forms error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notices and forms" },
      { status: 500 }
    );
  }
}
