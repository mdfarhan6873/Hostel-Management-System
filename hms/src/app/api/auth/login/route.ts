import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Student } from "@/lib/models";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Student Login
    if (role === "student") {
      const student = await Student.findOne({ email: cleanEmail });
      if (!student) {
        return NextResponse.json(
          { error: "No student account found with this email." },
          { status: 401 }
        );
      }

      if (!student.password) {
        return NextResponse.json(
          { error: "Password not set for this account. Contact administration." },
          { status: 401 }
        );
      }

      const isValidPassword = await comparePassword(password, student.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid password. Please try again." },
          { status: 401 }
        );
      }

      // Check Lifecycle status: only ALLOTTED students are permitted
      if (student.status !== "ALLOTTED") {
        const statusMsg =
          student.status === "WAITING"
            ? "Your hostel residency status is currently 'WAITING'. Room allotment is in progress. Only allotted students can log into the portal."
            : `Your hostel residency status is '${student.status}'. Access has been cancelled. Remark: ${student.evictionRemark || "Contact administration."}`;

        return NextResponse.json(
          {
            error: statusMsg,
            status: student.status,
          },
          { status: 403 }
        );
      }

      const token = signToken({
        id: student._id.toString(),
        email: student.email,
        name: student.fullName,
        role: "student",
        status: student.status,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: student._id,
          name: student.fullName,
          email: student.email,
          role: "student",
          status: student.status,
          assignedRoom: student.roomId,
          bedId: student.assignedBedId,
        },
        redirectUrl: "/student",
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });

      return response;
    }

    // 2. Admin Login (Super Admin or Warden)
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { error: "No administrator or warden account found with this email." },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Password not set for this account. Contact administration." },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      assignedCategory: user.assignedCategory,
    });

    const redirectUrl = user.role === "superadmin" ? "/superadmin" : "/warden";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedCategory: user.assignedCategory,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal authentication error. Please try again." },
      { status: 500 }
    );
  }
}
