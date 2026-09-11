import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Bill, Student, LeaveRequest } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status && status !== "ALL") {
      filter.status = status;
    }

    const bills = await Bill.find(filter)
      .populate("studentId", "fullName rollNo email branch messCardNo assignedBedId roomId")
      .populate("wardenId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, bills });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      studentId,
      title,
      billType,
      billingPeriod,
      baseAmount,
      leaveDaysRebate = 0,
      rebatePerDay = 100,
      dueDate,
    } = body;

    if (!studentId || !title || !billingPeriod || !baseAmount || !dueDate) {
      return NextResponse.json(
        { error: "Student ID, title, billing period, base amount, and due date are required" },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Calculate rebate
    let rebateAmount = 0;
    let daysRebate = Number(leaveDaysRebate) || 0;

    if (billType === "mess" && daysRebate > 0) {
      rebateAmount = daysRebate * Number(rebatePerDay);
    }

    const numBase = Number(baseAmount);
    const netAmount = Math.max(0, numBase - rebateAmount);

    const newBill = await Bill.create({
      studentId,
      wardenId: auth.userId,
      title: title.trim(),
      billType: billType || "mess",
      billingPeriod: billingPeriod.trim(), // e.g. "August 2026" or "Jan-July 2026"
      baseAmount: numBase,
      leaveDaysRebate: daysRebate,
      rebateAmount,
      netAmount,
      dueDate: new Date(dueDate),
      status: "PENDING",
    });

    return NextResponse.json({ success: true, bill: newBill }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create bill" }, { status: 500 });
  }
}
