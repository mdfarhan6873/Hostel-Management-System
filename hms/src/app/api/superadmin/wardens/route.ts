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

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        const assignedBlocks = await Block.find({ wardenId: user._id })
          .populate("hostelId", "name type")
          .lean();

        return {
          ...user,
          assignedBlocks,
        };
      })
    );

    return NextResponse.json({ success: true, wardens: enrichedUsers, users: enrichedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
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
    const { name, email, mobile, password, role = "warden", assignedCategory, designation } = body;

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

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password: hashedPassword,
      role: role || "warden",
      assignedCategory: assignedCategory?.trim() || "",
      designation: designation?.trim() || (role === "superadmin" ? "Institutional Head" : role === "warden" ? "Hostel Warden" : "Institutional Observer"),
      status: "ACTIVE",
    });

    const sanitized = newUser.toObject();
    delete sanitized.password;

    return NextResponse.json({ success: true, warden: sanitized, user: sanitized }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
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
    const { id, name, mobile, assignedCategory, designation, status, password, role } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (mobile) updateData.mobile = mobile.trim();
    if (role) updateData.role = role;
    if (designation !== undefined) updateData.designation = designation.trim();
    if (status !== undefined) updateData.status = status;
    if (assignedCategory !== undefined) updateData.assignedCategory = assignedCategory.trim();
    if (password && password.trim().length >= 6) {
      updateData.password = await hashPassword(password.trim());
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, warden: updated, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
