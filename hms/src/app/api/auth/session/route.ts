import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User, Student } from "@/lib/models";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    await connectToDatabase();

    if (session.role === "student") {
      const student = await Student.findById(session.id).select("-password");
      if (!student) {
        return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
      }
      return NextResponse.json({ authenticated: true, user: student, role: "student" });
    }

    const user = await User.findById(session.id).select("-password");
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }
    return NextResponse.json({ authenticated: true, user, role: user.role });
  } catch (error: any) {
    console.error("Get Session Error:", error);
    return NextResponse.json({ authenticated: false, error: "Failed to fetch session" }, { status: 500 });
  }
}
