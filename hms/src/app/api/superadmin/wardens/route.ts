import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Block } from "@/lib/models";
import { verifyAuth, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();

    const wardens = await User.find({ role: "warden" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedWardens = await Promise.all(
      wardens.map(async (warden: any) => {
        const assignedBlocks = await Block.find({ wardenId: warden._id })
          .populate("hostelId", "name type")
          .lean();

        return {
          ...warden,
          assignedBlocks,
        };
      })
    );

    return NextResponse.json({ success: true, wardens: enrichedWardens });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch wardens" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { name, email, mobile, password, assignedCategory } = body;

    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { error: "Name, email, mobile, and password are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newWarden = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password: hashedPassword,
      role: "warden",
      assignedCategory: assignedCategory?.trim() || "",
    });

    const sanitized = newWarden.toObject();
    delete sanitized.password;

    return NextResponse.json({ success: true, warden: sanitized }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create warden" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, name, mobile, assignedCategory, password } = body;

    if (!id) {
      return NextResponse.json({ error: "Warden ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (mobile) updateData.mobile = mobile.trim();
    if (assignedCategory !== undefined) updateData.assignedCategory = assignedCategory.trim();
    if (password && password.trim().length >= 6) {
      updateData.password = await hashPassword(password.trim());
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!updated) {
      return NextResponse.json({ error: "Warden not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, warden: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update warden" }, { status: 500 });
  }
}
