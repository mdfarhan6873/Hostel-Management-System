import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { registrationNumber, phone, guardianPhone, bloodGroup, avatarUrl } = body;

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber.trim();
    if (phone) user.phone = phone.trim();
    if (guardianPhone !== undefined) user.guardianPhone = guardianPhone.trim();
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup.trim();
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rollNumber: user.rollNumber,
        registrationNumber: user.registrationNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
        guardianPhone: user.guardianPhone,
        bloodGroup: user.bloodGroup,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
