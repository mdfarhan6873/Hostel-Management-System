import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Bill } from "@/lib/models/Bill";
import { User } from "@/lib/models/User";
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
    const studentIdParam = searchParams.get("studentId");
    const statusParam = searchParams.get("status");

    let query: any = {};

    if (auth.role === "STUDENT") {
      query.studentId = auth.userId;
    } else {
      if (studentIdParam) query.studentId = studentIdParam;
      if (statusParam && statusParam !== "ALL") query.status = statusParam;
    }

    const bills = await Bill.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, bills });
  } catch (error: any) {
    console.error("Billing GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can generate bills." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const {
      studentId,
      recipientType,
      applicationId,
      billType,
      frequency,
      items,
      dueDate,
      overallRemark,
      paymentAccountId,
      applyMessRebate,
      rebateDaysCount,
      rebatePercentage,
    } = body;

    if (!studentId || !items || !Array.isArray(items) || items.length === 0 || !paymentAccountId) {
      return NextResponse.json(
        { error: "Student, Bill line items, and a selected UPI Payment Account are required." },
        { status: 400 }
      );
    }

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Target student not found." }, { status: 404 });
    }

    const paymentAccount = await PaymentAccount.findById(paymentAccountId);
    if (!paymentAccount) {
      return NextResponse.json({ error: "Selected UPI payment account not found." }, { status: 404 });
    }

    // Process line items and compute total
    let finalItems = [...items];
    let calculatedRebateAmount = 0;
    const finalRebateDays = Number(rebateDaysCount) || 0;
    const finalRebatePct = Number(rebatePercentage) || 70;

    if (applyMessRebate && finalRebateDays > 0) {
      // Find mess fee item in list to base daily rate, default e.g. 18000 / 180 days = 100/day
      const messItem = finalItems.find((it) => it.category === "MESS_FEE");
      const baseMessFee = messItem ? messItem.amount : 18000;
      const dailyMessRate = baseMessFee / 180; // approximate 6-month day count
      calculatedRebateAmount = Math.round(dailyMessRate * finalRebateDays * (finalRebatePct / 100));

      finalItems.push({
        title: `Mess Fee Leave Rebate (${finalRebateDays} Days @ ${finalRebatePct}%)`,
        amount: -calculatedRebateAmount,
        category: "MESS_REBATE",
        isRefundable: false,
        remark: `Deducted for ${finalRebateDays} days approved leave at ${finalRebatePct}% rate`,
      });
    }

    const totalAmount = finalItems.reduce((acc, item) => acc + Number(item.amount), 0);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const billNumber = `HMS-BILL-${new Date().getFullYear()}-${randomSuffix}`;

    const newBill = await Bill.create({
      billNumber,
      studentId: student._id,
      studentName: student.name,
      studentRollNumber: student.rollNumber || "N/A",
      recipientType: recipientType || "ALLOTTED_STUDENT",
      applicationId: applicationId || undefined,
      billType: billType || "PERIODIC_HOSTEL_MESS",
      frequency: frequency || "SIX_MONTHS",
      items: finalItems,
      totalAmount: Math.max(0, totalAmount),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      overallRemark: overallRemark || "",

      messRebateDetails: {
        applied: Boolean(applyMessRebate),
        leaveDaysCount: finalRebateDays,
        rebatePercentage: finalRebatePct,
        rebateAmount: calculatedRebateAmount,
      },

      paymentAccountId: paymentAccount._id,
      paymentAccountSnapshot: {
        title: paymentAccount.title,
        payeeName: paymentAccount.payeeName,
        upiId: paymentAccount.upiId,
        qrCodeUrl: paymentAccount.qrCodeUrl,
      },

      status: "UNPAID",
    });

    return NextResponse.json({ success: true, bill: newBill }, { status: 201 });
  } catch (error: any) {
    console.error("Billing POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create bill" }, { status: 500 });
  }
}
