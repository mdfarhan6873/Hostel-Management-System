import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LeaveRequest } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status && status !== "ALL") {
      filter.status = status;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate("studentId", "fullName rollNo email branch assignedBedId messCardNo roomId")
      .populate("reviewedBy", "name email")
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
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { leaveId, action, rejectionReason } = body;

    if (!leaveId || !action) {
      return NextResponse.json({ error: "Leave ID and action (APPROVE/REJECT) are required" }, { status: 400 });
    }

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      leave.status = "APPROVED";
      leave.reviewedBy = auth.userId as any;
      leave.reviewedAt = new Date();
    } else if (action === "REJECT") {
      leave.status = "REJECTED";
      leave.reviewedBy = auth.userId as any;
      leave.reviewedAt = new Date();
      leave.rejectionReason = rejectionReason?.trim() || "Institutional leave criteria not met.";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await leave.save();
    return NextResponse.json({ success: true, leave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
