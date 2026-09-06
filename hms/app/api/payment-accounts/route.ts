import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PaymentAccount } from "@/lib/models/PaymentAccount";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const accounts = await PaymentAccount.find({ isActive: true }).sort({ isDefault: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch payment accounts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can configure payment UPI accounts." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { title, payeeName, upiId, qrCodeUrl, description, isDefault } = body;

    if (!title || !payeeName || !upiId) {
      return NextResponse.json({ error: "Account Title, Payee Name, and UPI ID are required." }, { status: 400 });
    }

    // Auto-generate QR code if not provided
    const resolvedQr =
      qrCodeUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(
        upiId
      )}%26pn=${encodeURIComponent(payeeName)}`;

    if (isDefault) {
      await PaymentAccount.updateMany({}, { isDefault: false });
    }

    const account = await PaymentAccount.create({
      title,
      payeeName,
      upiId,
      qrCodeUrl: resolvedQr,
      description: description || "",
      isDefault: Boolean(isDefault),
      isActive: true,
    });

    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (error: any) {
    console.error("PaymentAccount POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment account" }, { status: 500 });
  }
}
