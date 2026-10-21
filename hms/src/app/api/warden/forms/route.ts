import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, CustomForm, FormResponse } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const warden = await User.findById(auth.userId).lean();
    if (!warden) {
      return NextResponse.json({ error: "Warden account not found" }, { status: 404 });
    }

    // Filter forms created by this warden or matching category, or all if superadmin
    let filter: any = {};
    if (auth.role === "warden") {
      filter = {
        $or: [
          { createdBy: warden._id },
          ...(warden.assignedCategory ? [{ hostelCategory: warden.assignedCategory }] : []),
          { hostelCategory: "" },
          { hostelCategory: { $exists: false } },
        ],
      };
    }

    const forms = await CustomForm.find(filter).sort({ createdAt: -1 }).lean();

    // Attach response counts to each form
    const formIds = forms.map((f) => f._id);
    const counts = await FormResponse.aggregate([
      { $match: { formId: { $in: formIds } } },
      { $group: { _id: "$formId", count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enrichedForms = forms.map((f) => ({
      ...f,
      responseCount: countMap[f._id.toString()] || 0,
    }));

    return NextResponse.json({ forms: enrichedForms });
  } catch (err: any) {
    console.error("GET /api/warden/forms error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch forms" }, { status: 500 });
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
      title,
      description,
      formType,
      startDate,
      endDate,
      visibility,
      status,
      fields,
      hostelCategory,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Form title is required" }, { status: 400 });
    }
    if (!formType) {
      return NextResponse.json({ error: "Form type is required" }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates/times are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid start or end date format" }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    const warden = await User.findById(auth.userId).lean();

    const newForm = await CustomForm.create({
      title: title.trim(),
      description: (description || "").trim(),
      formType: formType.toUpperCase(),
      startDate: start,
      endDate: end,
      visibility: visibility || "PUBLIC",
      status: status || "ACTIVE",
      fields: Array.isArray(fields) ? fields : [],
      hostelCategory: hostelCategory || warden?.assignedCategory || "",
      createdBy: auth.userId,
    });

    return NextResponse.json(
      { success: true, message: "Custom form created successfully!", form: newForm },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/warden/forms error:", err);
    return NextResponse.json({ error: err.message || "Failed to create form" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { formId, ...updates } = body;

    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    if (updates.startDate && updates.endDate) {
      const start = new Date(updates.startDate);
      const end = new Date(updates.endDate);
      if (end <= start) {
        return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
      }
      updates.startDate = start;
      updates.endDate = end;
    }

    const updated = await CustomForm.findByIdAndUpdate(formId, { $set: updates }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Form updated successfully", form: updated });
  } catch (err: any) {
    console.error("PUT /api/warden/forms error:", err);
    return NextResponse.json({ error: err.message || "Failed to update form" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");

    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    await CustomForm.findByIdAndDelete(formId);
    await FormResponse.deleteMany({ formId });

    return NextResponse.json({ success: true, message: "Form and responses deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/warden/forms error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete form" }, { status: 500 });
  }
}
