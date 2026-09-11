import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Bill, Student } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { billId, paymentMethod = "Online UPI / NetBanking" } = body;

    if (!billId) {
      return NextResponse.json({ error: "Bill ID is required" }, { status: 400 });
    }

    const bill = await Bill.findOne({ _id: billId, studentId: auth.userId });
    if (!bill) {
      return NextResponse.json({ error: "Bill not found or unauthorized" }, { status: 404 });
    }

    if (bill.status === "PAID") {
      return NextResponse.json({ error: "This bill has already been settled" }, { status: 400 });
    }

    const now = new Date();
    const randomTxn = Math.floor(10000000 + Math.random() * 90000000);
    const receiptNum = `REC-GEC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    bill.status = "PAID";
    bill.paidAt = now;
    bill.paymentMethod = paymentMethod;
    bill.transactionId = `UPI/${randomTxn}`;
    bill.receiptNumber = receiptNum;
    await bill.save();

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and institutional receipt generated",
      bill,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 });
  }
}
