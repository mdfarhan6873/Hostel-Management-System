import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/lib/models/Attendance";
import { User } from "@/lib/models/User";
import { Bill } from "@/lib/models/Bill";
import { PaymentAccount } from "@/lib/models/PaymentAccount";
import { LeaveRequest } from "@/lib/models/LeaveRequest";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const targetStudentId = searchParams.get("studentId") || (auth.role === "STUDENT" ? auth.userId : null);
    const monthParam = searchParams.get("month") || new Date().toISOString().slice(0, 7); // e.g. "2026-09"

    if (!targetStudentId) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    const student = await User.findById(targetStudentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // Fetch all attendance logs for this student in this month
    const regex = new RegExp(`^${monthParam}`);
    const logs = await Attendance.find({
      studentId: targetStudentId,
      date: { $regex: regex },
    }).lean();

    // Check approved leaves for this month
    const leaves = await LeaveRequest.find({
      studentId: targetStudentId,
      status: "APPROVED",
    }).lean();

    // Construct day-by-day map
    const [year, month] = monthParam.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarDays = [];
    let presentCount = 0;
    let leaveCount = 0;
    let missedCount = 0;

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${monthParam}-${d < 10 ? `0${d}` : d}`;
      const log = logs.find((l) => l.date === dayStr);

      // Check if day falls within any approved leave
      const isApprovedLeaveDay = leaves.some((leave) => {
        return dayStr >= leave.startDate && dayStr <= leave.endDate;
      });

      let status: "PRESENT" | "LEAVE" | "MISSED" | "EXCUSED" | "UPCOMING" = "UPCOMING";

      if (log) {
        status = log.status;
      } else if (isApprovedLeaveDay) {
        status = "LEAVE";
      } else if (dayStr < todayStr) {
        status = "MISSED";
      } else if (dayStr === todayStr) {
        status = "UPCOMING";
      }

      if (status === "PRESENT") presentCount++;
      if (status === "LEAVE") leaveCount++;
      if (status === "MISSED") missedCount++;

      calendarDays.push({
        day: d,
        date: dayStr,
        status,
        log: log || null,
        isApprovedLeave: isApprovedLeaveDay,
      });
    }

    const evaluatedDays = presentCount + leaveCount + missedCount;
    const attendanceRate = evaluatedDays > 0 ? Math.round(((presentCount + leaveCount) / evaluatedDays) * 100) : 100;

    return NextResponse.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        roomNumber: student.roomNumber,
        hostelName: student.hostelName,
      },
      month: monthParam,
      daysInMonth,
      metrics: {
        presentCount,
        leaveCount,
        missedCount,
        attendanceRate,
      },
      calendarDays,
    });
  } catch (error: any) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can mark room attendance." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { selfieUrl, roomNumber, bypassWindowCheck } = body;

    const student = await User.findById(auth.userId);
    if (!student || student.allotmentStatus !== "ALLOTTED") {
      return NextResponse.json(
        { error: "Only actively allotted students can mark hostel room attendance." },
        { status: 400 }
      );
    }

    // Time window enforcement: 7:00 PM (19:00) to 8:00 PM (20:00)
    const now = new Date();
    const hours = now.getHours();

    // Allow testing bypass if specified or during 19:00 - 20:00
    const isInWindow = hours >= 19 && hours < 20;
    if (!isInWindow && !bypassWindowCheck) {
      return NextResponse.json(
        {
          error: "Attendance window is closed. Daily attendance must be marked between 7:00 PM and 8:00 PM.",
          window: "19:00 - 20:00",
          currentTime: now.toLocaleTimeString(),
        },
        { status: 400 }
      );
    }

    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    // Check if already marked
    const existing = await Attendance.findOne({
      studentId: student._id,
      date: todayStr,
    });

    if (existing && existing.status === "PRESENT") {
      return NextResponse.json(
        { error: "You have already marked your room attendance for today!" },
        { status: 400 }
      );
    }

    const attendanceLog = await Attendance.findOneAndUpdate(
      { studentId: student._id, date: todayStr },
      {
        studentId: student._id,
        studentName: student.name,
        studentRollNumber: student.rollNumber || "",
        hostelName: student.hostelName || "Girls Hostel",
        roomNumber: roomNumber || student.roomNumber || "N/A",
        date: todayStr,
        markedAt: now,
        selfieUrl: selfieUrl || "",
        status: "PRESENT",
        timeWindow: "19:00 - 20:00",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Nightly room attendance successfully marked for ${student.name}!`,
      attendance: attendanceLog,
    });
  } catch (error: any) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to mark attendance" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can take disciplinary actions." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { attendanceId, studentId, date, actionType, remark, fineAmount, paymentAccountId } = body;

    let targetAttendance;
    if (attendanceId) {
      targetAttendance = await Attendance.findById(attendanceId);
    } else if (studentId && date) {
      targetAttendance = await Attendance.findOne({ studentId, date });
    }

    if (!targetAttendance) {
      return NextResponse.json({ error: "Attendance entry not found." }, { status: 404 });
    }

    const student = await User.findById(targetAttendance.studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    let createdBill = null;

    if (actionType === "FINE") {
      const amount = Number(fineAmount) || 500;
      let pAccount = await PaymentAccount.findById(paymentAccountId);
      if (!pAccount) {
        pAccount = await PaymentAccount.findOne({ isDefault: true });
      }

      if (!pAccount) {
        pAccount = await PaymentAccount.findOne({});
      }

      const billNumber = `HMS-FINE-${Date.now().toString().slice(-6)}`;
      createdBill = await Bill.create({
        billNumber,
        studentId: student._id,
        studentName: student.name,
        studentRollNumber: student.rollNumber || "N/A",
        recipientType: "ALLOTTED_STUDENT",
        billType: "FINE",
        frequency: "FINE",
        items: [
          {
            title: `Disciplinary Fine for Missed Roll-Call on ${targetAttendance.date}`,
            amount,
            category: "FINE",
            isRefundable: false,
            remark: remark || "Unexcused absence during mandatory 7-8 PM roll-call.",
          },
        ],
        totalAmount: amount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        overallRemark: `Disciplinary penalty for missed room attendance on ${targetAttendance.date}`,
        paymentAccountId: pAccount!._id,
        paymentAccountSnapshot: {
          title: pAccount!.title,
          payeeName: pAccount!.payeeName,
          upiId: pAccount!.upiId,
          qrCodeUrl: pAccount!.qrCodeUrl,
        },
        status: "UNPAID",
      });
    }

    targetAttendance.disciplinaryAction = {
      actionType: actionType || "NONE",
      billId: createdBill ? createdBill._id : undefined,
      warningNotice: actionType === "WARNING" ? remark : "",
      adminRemark: remark || "",
      resolvedAt: new Date(),
    };

    if (actionType === "EXCUSED") {
      targetAttendance.status = "EXCUSED";
    }

    await targetAttendance.save();

    return NextResponse.json({
      success: true,
      message: `Disciplinary action (${actionType}) applied successfully.`,
      attendance: targetAttendance,
      bill: createdBill,
    });
  } catch (error: any) {
    console.error("Attendance PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to resolve attendance" }, { status: 500 });
  }
}
