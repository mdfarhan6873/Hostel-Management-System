import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Student, Room, Block, Hostel } from "@/lib/models";
import { verifyAuth, hashPassword } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== "warden" && auth.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    const filter: any = {};
    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (query && query.trim()) {
      const q = query.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { rollNo: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { branch: { $regex: q, $options: "i" } },
      ];
    }

    const students = await Student.find(filter)
      .populate("roomId", "roomNumber roomType")
      .populate("blockId", "name")
      .populate("floorId", "name floorNumber")
      .populate("hostelId", "name type")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch students" }, { status: 500 });
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
    const { action } = body;

    // Action: REGISTER (New student application into WAITING queue)
    if (action === "REGISTER") {
      const {
        fullName,
        email,
        mobile,
        password,
        age,
        completeAddress,
        bloodGroup,
        rollNo,
        branch,
        session,
        registrationNo,
        fatherName,
        motherName,
        parentMobile,
      } = body;

      if (!fullName || !email || !mobile || !rollNo || !branch || !session) {
        return NextResponse.json({ error: "Required student fields missing" }, { status: 400 });
      }

      const existing = await Student.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { rollNo: rollNo.trim() }],
      });

      if (existing) {
        return NextResponse.json(
          { error: "A student with this email or roll number already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password || "Student@123");

      const newStudent = await Student.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        password: hashedPassword,
        age: age ? Number(age) : 20,
        completeAddress: completeAddress?.trim() || "Bihar, India",
        bloodGroup: bloodGroup || "B+",
        rollNo: rollNo.trim(),
        branch: branch.trim(),
        session: session.trim(),
        registrationNo: registrationNo?.trim() || `${rollNo.trim()}/GEC`,
        parents: {
          fatherName: fatherName?.trim() || "N/A",
          motherName: motherName?.trim() || "N/A",
          parentMobile: parentMobile?.trim() || mobile.trim(),
        },
        status: "WAITING",
      });

      return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
    }

    // Action: ALLOT (Allocate Room & Furniture Group)
    if (action === "ALLOT") {
      const { studentId, roomId, furnitureGroupIndex } = body;
      if (!studentId || !roomId || furnitureGroupIndex === undefined) {
        return NextResponse.json(
          { error: "Student ID, Room ID, and Furniture Group selection are required" },
          { status: 400 }
        );
      }

      const student = await Student.findById(studentId);
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

      const room = await Room.findById(roomId);
      if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

      const targetGroup = room.furnitureGroups[furnitureGroupIndex];
      if (!targetGroup) {
        return NextResponse.json({ error: "Invalid furniture group index" }, { status: 400 });
      }

      if (targetGroup.isOccupied) {
        return NextResponse.json(
          { error: `Selected furniture group (${targetGroup.groupName}) is already occupied` },
          { status: 400 }
        );
      }

      // Mark furniture group as occupied
      targetGroup.isOccupied = true;
      targetGroup.occupiedBy = student._id as any;
      targetGroup.occupiedStudentName = student.fullName;
      targetGroup.occupiedStudentRoll = student.rollNo;
      targetGroup.occupiedStudentBranch = student.branch;
      targetGroup.occupiedStudentSession = student.session;
      await room.save();

      // Update student record
      student.status = "ALLOTTED";
      student.hostelId = room.hostelId;
      student.blockId = room.blockId;
      student.floorId = room.floorId;
      student.roomId = room._id as any;
      student.furnitureGroupName = targetGroup.groupName;
      student.assignedBedId = targetGroup.bedId;
      student.assignedTableId = targetGroup.tableId;
      student.assignedChairId = targetGroup.chairId;
      student.messCardNo = student.messCardNo || `MESS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      await student.save();

      return NextResponse.json({ success: true, student, room });
    }

    // Action: EVICT / CANCEL
    if (action === "EVICT") {
      const { studentId, evictionRemark, evictionNoticeLink } = body;
      if (!studentId || !evictionRemark) {
        return NextResponse.json(
          { error: "Student ID and mandatory eviction remark are required" },
          { status: 400 }
        );
      }

      const student = await Student.findById(studentId);
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

      // If student had a room assigned, vacate the furniture group
      if (student.roomId) {
        const room = await Room.findById(student.roomId);
        if (room && room.furnitureGroups) {
          const groupIndex = room.furnitureGroups.findIndex(
            (fg: any) =>
              fg.occupiedBy?.toString() === student._id.toString() ||
              fg.bedId === student.assignedBedId
          );
          if (groupIndex !== -1) {
            room.furnitureGroups[groupIndex].isOccupied = false;
            room.furnitureGroups[groupIndex].occupiedBy = undefined;
            room.furnitureGroups[groupIndex].occupiedStudentName = undefined;
            room.furnitureGroups[groupIndex].occupiedStudentRoll = undefined;
            room.furnitureGroups[groupIndex].occupiedStudentBranch = undefined;
            room.furnitureGroups[groupIndex].occupiedStudentSession = undefined;
            await room.save();
          }
        }
      }

      // Update student lifecycle status
      student.status = "CANCELLED";
      student.evictionRemark = evictionRemark.trim();
      student.evictionNoticeLink = evictionNoticeLink?.trim() || "";
      student.evictedAt = new Date();
      await student.save();

      return NextResponse.json({ success: true, student });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
