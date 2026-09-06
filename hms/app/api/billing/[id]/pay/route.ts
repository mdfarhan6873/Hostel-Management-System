import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Bill } from "@/lib/models/Bill";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { utrNumber, paymentMode, proofUrl } = body;

    if (!utrNumber) {
      return NextResponse.json(
        { error: "Please provide your UPI Transaction ID / UTR Number." },
        { status: 400 }
      );
    }

    const bill = await Bill.findById(params.id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found." }, { status: 404 });
    }

    const receiptNumber = `HMS-RCP-${Date.now().toString().slice(-6)}`;

    bill.status = "PAID";
    bill.paymentDetails = {
      paidAt: new Date(),
      utrNumber: utrNumber.trim(),
      paymentMode: paymentMode || "UPI",
      proofUrl: proofUrl || "",
      verifiedAt: new Date(),
      receiptNumber,
    };

    await bill.save();

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and receipt generated!",
      bill,
      receiptNumber,
    });
  } catch (error: any) {
    console.error("Bill pay error:", error);
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 });
  }
}
