import { NextRequest, NextResponse } from "next/server";
import { findUserByIdentifier, comparePassword, signToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please enter your Roll Number, Email, or Phone, along with password." },
        { status: 400 }
      );
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. No user found matching the provided identifier." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials. Incorrect password." }, { status: 401 });
    }

    // Enforce Student Eligibility Check: Student can login ONLY after marked ELIGIBLE (or already ALLOTTED)
    if (user.role === "STUDENT") {
      if (user.allotmentStatus === "PENDING") {
        return NextResponse.json(
          {
            error: "Your application is currently under review (Status: PENDING). You can log in to the student portal only after your application has been verified and marked ELIGIBLE by the administration.",
            status: "PENDING",
            canLogin: false,
            rollNumber: user.rollNumber,
          },
          { status: 403 }
        );
      }

      if (user.allotmentStatus === "NOT_APPLIED") {
        return NextResponse.json(
          {
            error: "No hostel application found. Please submit your hostel admission application first.",
            status: "NOT_APPLIED",
            canLogin: false,
          },
          { status: 403 }
        );
      }

      if (user.allotmentStatus === "REJECTED") {
        return NextResponse.json(
          {
            error: "Your hostel application was not approved by the administration.",
            status: "REJECTED",
            canLogin: false,
          },
          { status: 403 }
        );
      }

      if (user.allotmentStatus === "CANCELLED") {
        return NextResponse.json(
          {
            error: "Your hostel allotment has been cancelled / revoked by administration.",
            status: "CANCELLED",
            canLogin: false,
          },
          { status: 403 }
        );
      }
    }

    const tokenPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      roomNumber: user.roomNumber,
      hostelName: user.hostelName,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        rollNumber: user.rollNumber,
        registrationNumber: user.registrationNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
        allotmentStatus: user.allotmentStatus,
        hostelName: user.hostelName,
        roomNumber: user.roomNumber,
        bedNumber: user.bedNumber,
      },
      token,
    });

    response.cookies.set("hms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
