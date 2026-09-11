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
    const { title, description, category, refNumber, pdfLinks } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const newNotice = await AdmissionNotice.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "ADMISSION",
      refNumber: refNumber?.trim() || `Ref: GEC/HMS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      publishDate: new Date(),
      pdfLinks: Array.isArray(pdfLinks) ? pdfLinks : [],
      isActive: true,
    });

    return NextResponse.json({ success: true, notice: newNotice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to publish notice" }, { status: 500 });
  }
}
