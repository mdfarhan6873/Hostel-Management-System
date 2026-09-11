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

    if (student.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "ACCESS_RESTRICTED",
          status: student.status,
          message: `Your hostel residency has been CANCELLED or EVICTED. Remark: ${student.evictionRemark || "Contact warden administration."}`,
        },
        { status: 403 }
      );
    }

    // Roommate and Warden lookup
    let roommate: any = null;
    let wardenInfo: any = null;

    if (student.roomId) {
      const room = await Room.findById(student.roomId).lean();
      if (room && room.furnitureGroups) {
        const otherOcc = room.furnitureGroups.find(
          (fg: any) => fg.isOccupied && fg.occupiedBy && fg.occupiedBy.toString() !== student._id.toString()
        );
        if (otherOcc) {
          roommate = {
            name: otherOcc.occupiedStudentName,
            rollNo: otherOcc.occupiedStudentRoll,
            branch: otherOcc.occupiedStudentBranch,
            session: otherOcc.occupiedStudentSession,
            groupName: otherOcc.groupName,
          };
        }
      }
    }

    if (student.blockId) {
      const block = await Block.findById(student.blockId).populate("wardenId", "name email mobile").lean();
      if (block && block.wardenId) {
        wardenInfo = block.wardenId;
      }
    }

    // Waiting queue position
    let queuePosition = 0;
    if (student.status === "WAITING") {
      queuePosition = await Student.countDocuments({
        status: "WAITING",
        createdAt: { $lte: student.createdAt },
      });
      if (queuePosition === 0) queuePosition = 1;
    }

    const [bills, leaves] = await Promise.all([
      Bill.find({ studentId: student._id as any }).sort({ createdAt: -1 }).lean(),
      LeaveRequest.find({ studentId: student._id as any }).sort({ createdAt: -1 }).lean(),
    ]);

    const pendingBills = bills.filter((b) => b.status === "PENDING");
    const totalPendingDues = pendingBills.reduce((acc, b) => acc + (b.netAmount || 0), 0);
    const totalPaidAmount = bills
      .filter((b) => b.status === "PAID")
      .reduce((acc, b) => acc + (b.netAmount || 0), 0);
    const totalRebateSaved = bills.reduce((acc, b) => acc + (b.rebateAmount || 0), 0);

    return NextResponse.json({
      success: true,
      student,
      roommate,
      wardenInfo,
      queuePosition,
      bills,
      leaves,
      stats: {
        totalBills: bills.length,
        pendingBillsCount: pendingBills.length,
        totalPendingDues,
        totalPaidAmount,
        totalRebateSaved,
        approvedLeavesCount: leaves.filter((l) => l.status === "APPROVED").length,
      },
    });
  } catch (error: any) {
    console.error("Student Dashboard API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load student portal" }, { status: 500 });
  }
}
