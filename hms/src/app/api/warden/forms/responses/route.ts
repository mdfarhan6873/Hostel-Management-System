import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { FormResponse, User } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const formType = searchParams.get("formType");
    const status = searchParams.get("status");
    const formId = searchParams.get("formId");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate") || searchParams.get("fromDate");
    const endDate = searchParams.get("endDate") || searchParams.get("toDate");

    const query: any = {};

    if (formType && formType !== "ALL") {
      query.formType = formType.toUpperCase();
    }

    if (status && status !== "ALL") {
      query.status = status.toUpperCase();
    }

    if (formId && formId !== "ALL") {
      query.formId = formId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const from = new Date(startDate);
        from.setHours(0, 0, 0, 0);
        query.createdAt.$gte = from;
      }
      if (endDate) {
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { "applicantInfo.name": regex },
        { "applicantInfo.email": regex },
        { "applicantInfo.phone": regex },
        { "applicantInfo.rollNo": regex },
        { formTitle: regex },
      ];
    }

    const responses = await FormResponse.find(query).sort({ createdAt: -1 }).lean();

    // Available forms for specific form dropdown
    const availableForms = await FormResponse.aggregate([
      {
        $group: {
          _id: "$formId",
          formTitle: { $first: "$formTitle" },
          formType: { $first: "$formType" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate count totals by formType for tab badges (considering date range if set)
    const dateQuery: any = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        const from = new Date(startDate);
        from.setHours(0, 0, 0, 0);
        dateQuery.createdAt.$gte = from;
      }
      if (endDate) {
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = to;
      }
    }

    const counts = await FormResponse.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: dateQuery }] : []),
      {
        $group: {
          _id: "$formType",
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
        },
      },
    ]);

    const tabCounts: Record<string, { total: number; pending: number }> = {
      ADMISSION: { total: 0, pending: 0 },
      REALLOCATION: { total: 0, pending: 0 },
      MAINTENANCE: { total: 0, pending: 0 },
      NOTICE: { total: 0, pending: 0 },
      GENERAL: { total: 0, pending: 0 },
    };

    counts.forEach((c) => {
      if (tabCounts[c._id]) {
        tabCounts[c._id] = { total: c.total, pending: c.pending };
      }
    });

    return NextResponse.json({ responses, tabCounts, availableForms });
  } catch (err: any) {
    console.error("GET /api/warden/forms/responses error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch responses" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { responseId, status, wardenNotes } = body;

    if (!responseId) {
      return NextResponse.json({ error: "Response ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (wardenNotes !== undefined) updateData.wardenNotes = wardenNotes;
    updateData.reviewedBy = auth.userId;
    updateData.reviewedAt = new Date();

    const updated = await FormResponse.findByIdAndUpdate(
      responseId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      response: updated,
    });
  } catch (err: any) {
    console.error("PATCH /api/warden/forms/responses error:", err);
    return NextResponse.json({ error: err.message || "Failed to update response" }, { status: 500 });
  }
}
