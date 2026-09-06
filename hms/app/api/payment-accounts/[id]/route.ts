import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PaymentAccount } from "@/lib/models/PaymentAccount";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    if (body.isDefault) {
      await PaymentAccount.updateMany({}, { isDefault: false });
    }

    const updated = await PaymentAccount.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Payment account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, account: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update payment account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    await PaymentAccount.findByIdAndUpdate(params.id, { isActive: false });
    return NextResponse.json({ success: true, message: "Payment account removed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete payment account" }, { status: 500 });
  }
}
