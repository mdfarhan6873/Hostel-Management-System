import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        rollNumber: user.rollNumber,
        registrationNumber: user.registrationNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
        department: user.department,
        semester: user.semester,
        batch: user.batch,
        guardianPhone: user.guardianPhone,
        bloodGroup: user.bloodGroup,
        allotmentStatus: user.allotmentStatus,
        hostelName: user.hostelName,
        roomNumber: user.roomNumber,
        bedNumber: user.bedNumber,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
