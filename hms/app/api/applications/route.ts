import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HostelApplication } from "@/lib/models/HostelApplication";
import { ApplicationWindow } from "@/lib/models/ApplicationWindow";
import { User } from "@/lib/models/User";
import { getAuthUser, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query: any = {};

    if (auth.role === "STUDENT") {
      // Students only view their own applications
      query.studentId = auth.userId;
    } else {
      // Admin / Viewer
      if (status && status !== "ALL") {
        query.status = status;
      }
    }

    const applications = await HostelApplication.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("Applications GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      windowId,
      name,
      dob,
      age,
      gender,
      phone,
      email,
      password,
      parentPhone,
      address,
      aadhaarNumber,
      aadhaarFileUrl,
      photoUrl,
      rollNumber,
      registrationNumber,
      branch,
      session,
      semester,
      lastExamType,
      twelfthBoardName,
      twelfthPercentage,
      semesterSgpaList,
      currentCgpa,
      bloodGroup,
      medicalRemark,
    } = body;

    // Verify application window is active
    const appWindow = await ApplicationWindow.findById(windowId);
    if (!appWindow) {
      return NextResponse.json({ error: "Selected admission window does not exist." }, { status: 404 });
    }

    if (!appWindow.isActive || new Date() > new Date(appWindow.endDate)) {
      return NextResponse.json(
        { error: "This application window has expired or is currently closed." },
        { status: 400 }
      );
    }

    // Determine student user account: Check if user is authenticated or newly registering
    const auth = await getAuthUser(req);
    let studentUser: any = null;

    if (auth) {
      studentUser = await User.findById(auth.userId);
    } else {
      // Public applicant: Email, Roll Number and Password are required
      const cleanRoll = rollNumber?.trim().toUpperCase();
      const cleanEmail = (email || `${cleanRoll.toLowerCase()}@hostel.edu`).trim().toLowerCase();
      const cleanPhone = phone?.trim();

      if (!cleanRoll) {
        return NextResponse.json({ error: "College Roll Number is required." }, { status: 400 });
      }
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: "Please choose an account password of at least 6 characters." },
          { status: 400 }
        );
      }

      // Check if user already exists
      studentUser = await User.findOne({
        $or: [{ rollNumber: cleanRoll }, { email: cleanEmail }, { phone: cleanPhone }],
      });

      if (studentUser) {
        if (studentUser.allotmentStatus === "ALLOTTED") {
          return NextResponse.json(
            { error: "A student with this Roll Number or Email already has an active room allotment." },
            { status: 400 }
          );
        }
        if (studentUser.allotmentStatus === "PENDING") {
          return NextResponse.json(
            {
              error: "An application with this Roll Number or Email is already submitted and pending administrative review.",
            },
            { status: 400 }
          );
        }
        // If not applied or eligible, update password and reset to PENDING
        const hashedPassword = await hashPassword(password);
        studentUser.password = hashedPassword;
        studentUser.allotmentStatus = "PENDING";
        studentUser.name = name || studentUser.name;
        studentUser.phone = cleanPhone || studentUser.phone;
        studentUser.guardianPhone = parentPhone || studentUser.guardianPhone;
        studentUser.department = branch || studentUser.department;
        studentUser.batch = session || studentUser.batch;
        studentUser.semester = Number(semester) || studentUser.semester;
        studentUser.bloodGroup = bloodGroup || studentUser.bloodGroup;
        if (photoUrl) studentUser.avatarUrl = photoUrl;
        if (registrationNumber) studentUser.registrationNumber = registrationNumber;
        await studentUser.save();
      } else {
        // Create new student user with PENDING allotment status
        const hashedPassword = await hashPassword(password);
        studentUser = await User.create({
          name,
          email: cleanEmail,
          phone: cleanPhone,
          rollNumber: cleanRoll,
          registrationNumber: registrationNumber || "",
          password: hashedPassword,
          role: "STUDENT",
          allotmentStatus: "PENDING",
          department: branch,
          semester: Number(semester) || 1,
          batch: session,
          guardianPhone: parentPhone,
          bloodGroup: bloodGroup || "",
          avatarUrl: photoUrl || "",
        });
      }
    }

    // Check if duplicate application exists for this window
    const existingApp = await HostelApplication.findOne({
      studentId: studentUser._id,
      windowId: appWindow._id,
      status: { $in: ["PENDING", "ELIGIBLE", "ALLOTTED"] },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "You already have an active application under review or allotted for this window." },
        { status: 400 }
      );
    }

    const application = await HostelApplication.create({
      studentId: studentUser._id,
      windowId: appWindow._id,
      hostelId: appWindow.hostelId,
      hostelName: appWindow.hostelName,
      name,
      dob,
      age: Number(age) || 18,
      gender: gender || "Female",
      phone: studentUser.phone,
      email: studentUser.email,
      passwordHint: password || "",
      parentPhone,
      address,
      aadhaarNumber,
      aadhaarFileUrl: aadhaarFileUrl || "",
      photoUrl: photoUrl || "",
      rollNumber: studentUser.rollNumber || rollNumber,
      registrationNumber: registrationNumber || "",
      branch,
      session,
      semester: Number(semester) || 1,
      lastExamType: lastExamType || "12TH",
      twelfthBoardName: twelfthBoardName || "",
      twelfthPercentage: Number(twelfthPercentage) || 0,
      semesterSgpaList: semesterSgpaList || "",
      currentCgpa: Number(currentCgpa) || 0,
      bloodGroup: bloodGroup || "",
      medicalRemark: medicalRemark || "",
      status: "PENDING",
      statusRemark: "Application submitted successfully and is currently under administrative verification.",
    });

    return NextResponse.json(
      {
        success: true,
        application,
        credentials: {
          rollNumber: studentUser.rollNumber,
          email: studentUser.email,
          phone: studentUser.phone,
          password: password || "",
        },
        message:
          "Application submitted successfully! Your application is under review (Status: PENDING). You can log in once marked ELIGIBLE by administration.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Application submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
  }
}
