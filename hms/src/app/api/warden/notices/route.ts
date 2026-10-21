import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AdmissionNotice } from "@/lib/models";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const notices = await AdmissionNotice.find().sort({ publishDate: -1 }).lean();
    return NextResponse.json({ success: true, notices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch notices" }, { status: 500 });
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
    const { title, description, category, refNumber, pdfLinks, visibility, publishDate, isActive } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const newNotice = await AdmissionNotice.create({
      title: title.trim(),
      description: description.trim(),
      category: (category || "CIRCULAR").toUpperCase(),
      refNumber:
        refNumber?.trim() ||
        `Ref: GEC/HMS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      pdfLinks: Array.isArray(pdfLinks) ? pdfLinks : [],
      visibility: visibility || "PUBLIC",
      isActive: isActive !== false,
      createdBy: auth.userId,
    });

    return NextResponse.json({ success: true, notice: newNotice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to publish notice" }, { status: 500 });
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
    const { noticeId, ...updates } = body;

    if (!noticeId) {
      return NextResponse.json({ error: "Notice ID is required" }, { status: 400 });
    }

    if (updates.publishDate) {
      updates.publishDate = new Date(updates.publishDate);
    }

    const updated = await AdmissionNotice.findByIdAndUpdate(
      noticeId,
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Notice updated successfully", notice: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update notice" }, { status: 500 });
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
    const noticeId = searchParams.get("noticeId");

    if (!noticeId) {
      return NextResponse.json({ error: "Notice ID is required" }, { status: 400 });
    }

    await AdmissionNotice.findByIdAndDelete(noticeId);
    return NextResponse.json({ success: true, message: "Notice deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete notice" }, { status: 500 });
  }
}
