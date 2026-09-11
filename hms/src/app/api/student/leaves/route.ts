import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LeaveRequest, Student } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const leaves = await LeaveRequest.find({ studentId: auth.userId })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, leaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const student = await Student.findById(auth.userId);
    if (!student || student.status !== "ALLOTTED") {
      return NextResponse.json({ error: "Only actively allotted students may apply for leaves" }, { status: 403 });
    }

    const body = await req.json();
    const { startDate, endDate, reason, handwrittenApplicationUrl } = body;

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: "Start date, end date, and reason are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json({ error: "End date must be on or after start date" }, { status: 400 });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = await LeaveRequest.create({
      studentId: auth.userId,
      startDate: start,
      endDate: end,
      daysCount,
      reason: reason.trim(),
      handwrittenApplicationUrl: handwrittenApplicationUrl?.trim() || "",
      status: "PENDING",
    });

    return NextResponse.json({ success: true, leave: newLeave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to apply for leave" }, { status: 500 });
  }
}
