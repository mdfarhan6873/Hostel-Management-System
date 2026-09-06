import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HostelApplication } from "@/lib/models/HostelApplication";
import { User } from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier")?.trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Please provide your Roll Number, Email, or Application ID." },
        { status: 400 }
      );
    }

    // Try finding by Application ID first (if valid ObjectId)
    let application: any = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      application = await HostelApplication.findById(identifier).lean();
    }

    // Try by uppercase Roll Number
    if (!application) {
      application = await HostelApplication.findOne({
        rollNumber: identifier.toUpperCase(),
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Try by lowercase Email
    if (!application) {
      application = await HostelApplication.findOne({
        email: identifier.toLowerCase(),
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Try by Phone
    if (!application) {
      application = await HostelApplication.findOne({
        phone: identifier,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!application) {
      return NextResponse.json(
        { error: "No hostel application found matching the provided identifier." },
        { status: 404 }
      );
    }

    // Also get the current user status
    const user = await User.findById(application.studentId).lean();

    const canLogin = user?.allotmentStatus === "ELIGIBLE" || user?.allotmentStatus === "ALLOTTED";

    return NextResponse.json({
      success: true,
      application,
      userStatus: user?.allotmentStatus || application.status,
      canLogin,
      message: canLogin
        ? "Your application is ELIGIBLE! You can now log in to pay your fees and view room details."
        : "Your application is under administrative review (Status: PENDING). You can log in once approved.",
    });
  } catch (error: any) {
    console.error("Application status lookup error:", error);
    return NextResponse.json({ error: error.message || "Failed to look up application status" }, { status: 500 });
  }
}
