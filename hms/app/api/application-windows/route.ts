import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ApplicationWindow } from "@/lib/models/ApplicationWindow";
import { Hostel } from "@/lib/models/Hostel";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    const query: any = {};
    if (activeOnly) {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    }

    const windows = await ApplicationWindow.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, windows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch windows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create admission windows" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const {
      title,
      hostelId,
      blockName,
      startDate,
      endDate,
      targetRemark,
      feeStructureUrl,
      rulesRegulationsUrl,
    } = body;

    if (!title || !hostelId || !endDate || !targetRemark) {
      return NextResponse.json(
        { error: "Title, Target Hostel, Deadline (End Date), and Target Remark are required." },
        { status: 400 }
      );
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return NextResponse.json({ error: "Selected hostel does not exist." }, { status: 404 });
    }

    const newWindow = await ApplicationWindow.create({
      title,
      hostelId,
      hostelName: `${hostel.name} (${hostel.code})`,
      blockName: blockName || "All Blocks",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      targetRemark,
      feeStructureUrl: feeStructureUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      rulesRegulationsUrl:
        rulesRegulationsUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      isActive: true,
    });

    return NextResponse.json({ success: true, window: newWindow }, { status: 201 });
  } catch (error: any) {
    console.error("Window POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create window" }, { status: 500 });
  }
}
