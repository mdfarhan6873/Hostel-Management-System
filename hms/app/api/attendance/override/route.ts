import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/lib/models/Attendance";
import { Bill } from "@/lib/models/Bill";
import { PaymentAccount } from "@/lib/models/PaymentAccount";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can perform manual attendance overrides" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { studentId, date, action, remark, fineAmount } = body;

    if (!studentId || !date) {
      return NextResponse.json({ error: "Student ID and Date are required" }, { status: 400 });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const targetDateStr = date; // Format: YYYY-MM-DD

    if (action === "MARK_PRESENT") {
      // Create or update attendance record as Present with admin override
      const existing = await Attendance.findOne({
        studentId,
        date: targetDateStr,
      });

      if (existing) {
        existing.status = "PRESENT";
        existing.markedAt = new Date();
        if (!existing.disciplinaryAction) {
          existing.disciplinaryAction = { actionType: "NONE" };
        }
        existing.disciplinaryAction.adminRemark = `[ADMIN OVERRIDE by ${auth.name}]: ${remark || "Verified in person by warden"}`;
        await existing.save();
      } else {
        await Attendance.create({
          studentId: student._id,
          studentName: student.name,
          studentRollNumber: student.rollNumber || "N/A",
          roomNumber: student.roomNumber || "101",
          hostelName: student.hostelName || "Hostel",
          date: targetDateStr,
          markedAt: new Date(),
          status: "PRESENT",
          selfieUrl: student.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300",
          timeWindow: "19:00 - 20:00",
          disciplinaryAction: {
            actionType: "NONE",
            adminRemark: `[ADMIN OVERRIDE by ${auth.name}]: ${remark || "Verified in person by warden"}`,
          },
        });
      }

      return NextResponse.json({ success: true, message: `Marked ${student.name} as Present (Admin Override).` });
    }

    if (action === "CHARGE_FINE") {
      const amount = Number(fineAmount) || 200;
      let paymentAcc = await PaymentAccount.findOne({ isActive: true, isDefault: true });
      if (!paymentAcc) {
        paymentAcc = await PaymentAccount.findOne({ isActive: true });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);

      const bill = await Bill.create({
        billNumber: `FINE-ATT-${Date.now().toString().slice(-6)}`,
        studentId: student._id,
        studentName: student.name,
        studentRollNumber: student.rollNumber || "",
        recipientType: "ALLOTTED_STUDENT",
        billType: "FINE",
        frequency: "FINE",
        items: [
          {
            title: `Missed Evening Roll-Call Fine (${date})`,
            amount,
            category: "FINE",
            isRefundable: false,
            remark: remark || "Unexcused absence from mandatory 7-8 PM room roll-call",
          },
        ],
        totalAmount: amount,
        dueDate,
        overallRemark: `Disciplinary fine for missing evening roll-call on ${date}.`,
        paymentAccountId: paymentAcc?._id,
        paymentAccountSnapshot: paymentAcc
          ? {
              title: paymentAcc.title,
              payeeName: paymentAcc.payeeName,
              upiId: paymentAcc.upiId,
              qrCodeUrl: paymentAcc.qrCodeUrl,
            }
          : undefined,
        status: "UNPAID",
      });

      // Also record disciplinary fine on Attendance
      const attRecord = await Attendance.findOne({ studentId, date: targetDateStr });
      if (attRecord) {
        attRecord.disciplinaryAction = {
          actionType: "FINE",
          billId: bill._id,
          adminRemark: remark || `Fined ₹${amount} for unexcused absence`,
        };
        await attRecord.save();
      }

      return NextResponse.json({
        success: true,
        message: `Fine bill of ₹${amount} issued to ${student.name} with assigned UPI QR code.`,
        bill,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Attendance override error:", error);
    return NextResponse.json({ error: error.message || "Failed to perform attendance override" }, { status: 500 });
  }
}
