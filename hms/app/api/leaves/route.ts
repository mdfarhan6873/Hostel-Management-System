import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LeaveRequest } from "@/lib/models/LeaveRequest";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("studentId");
    const statusParam = searchParams.get("status");

    let query: any = {};

    if (auth.role === "STUDENT") {
      query.studentId = auth.userId;
    } else {
      if (studentIdParam) query.studentId = studentIdParam;
      if (statusParam && statusParam !== "ALL") query.status = statusParam;
    }

    const leaves = await LeaveRequest.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, leaves });
  } catch (error: any) {
    console.error("Leaves GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit leave applications." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { startDate, endDate, reason, handwrittenDocUrl, emergencyContact } = body;

    if (!startDate || !endDate || !reason || !handwrittenDocUrl) {
      return NextResponse.json(
        { error: "Start Date, End Date, Reason, and Handwritten Application Letter are required." },
        { status: 400 }
      );
    }

    const student = await User.findById(auth.userId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = await LeaveRequest.create({
      studentId: student._id,
      studentName: student.name,
      studentRollNumber: student.rollNumber || "N/A",
      roomNumber: student.roomNumber || "N/A",
      hostelName: student.hostelName || "Girls Hostel",
      startDate,
      endDate,
      totalDays,
      reason,
      handwrittenDocUrl,
      emergencyContact: emergencyContact || student.guardianPhone || student.phone,
      status: "PENDING_PARENT_VERIFICATION",
    });

    return NextResponse.json({ success: true, leave: newLeave }, { status: 201 });
  } catch (error: any) {
    console.error("Leaves POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit leave" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can verify and approve leaves." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const {
      leaveId,
      status, // "APPROVED" or "REJECTED"
      spokenWith,
      parentConsentConfirmed,
      adminNotes,
      adminDecisionRemark,
    } = body;

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return NextResponse.json({ error: "Leave request not found." }, { status: 404 });
    }

    const student = await User.findById(leave.studentId);

    leave.status = status;
    leave.parentVerification = {
      calledAt: new Date(),
      parentPhoneCalled: student?.guardianPhone || leave.emergencyContact,
      spokenWith: spokenWith || "Parent",
      consentConfirmed: Boolean(parentConsentConfirmed),
      adminNotes: adminNotes || "",
      verifiedBy: auth.name,
    };
    leave.adminDecisionRemark = adminDecisionRemark || "";

    if (status === "APPROVED") {
      leave.approvedAt = new Date();
    } else {
      leave.rejectedAt = new Date();
    }

    await leave.save();

    return NextResponse.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} with parent call verification recorded.`,
      leave,
    });
  } catch (error: any) {
    console.error("Leaves PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to process leave approval" }, { status: 500 });
  }
}
