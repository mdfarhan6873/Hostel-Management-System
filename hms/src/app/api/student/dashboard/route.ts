import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Student, Bill, LeaveRequest, Room, Block, Floor, Hostel } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findById(auth.userId)
      .populate("hostelId", "name type")
      .populate("blockId", "name")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType capacity")
      .lean();

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    if (student.status !== "ALLOTTED") {
      return NextResponse.json(
        {
          error: "ACCESS_RESTRICTED",
          status: student.status,
          message:
            student.status === "WAITING"
              ? "Your hostel admission application is currently in the WAITING QUEUE. Room and furniture allocation has not been finalized by the warden office."
              : "Your hostel residency has been CANCELLED or EVICTED by the warden administration.",
        },
        { status: 403 }
      );
    }

    const [bills, leaves] = await Promise.all([
      Bill.find({ studentId: student._id }).sort({ createdAt: -1 }).lean(),
      LeaveRequest.find({ studentId: student._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const pendingBills = bills.filter((b) => b.status === "PENDING");
    const totalPendingDues = pendingBills.reduce((acc, b) => acc + (b.netAmount || 0), 0);

    return NextResponse.json({
      success: true,
      student,
      bills,
      leaves,
      stats: {
        totalBills: bills.length,
        pendingBillsCount: pendingBills.length,
        totalPendingDues,
        approvedLeavesCount: leaves.filter((l) => l.status === "APPROVED").length,
      },
    });
  } catch (error: any) {
    console.error("Student Dashboard API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load student portal" }, { status: 500 });
  }
}
