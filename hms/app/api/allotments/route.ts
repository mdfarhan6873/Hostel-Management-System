import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Hostel } from "@/lib/models/Hostel";
import { HostelApplication } from "@/lib/models/HostelApplication";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can allot rooms." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { studentId, hostelId, blockName, floorNumber, roomNumber, bedNumber } = body;

    if (!studentId || !hostelId || !roomNumber || !bedNumber) {
      return NextResponse.json(
        { error: "Student ID, Hostel ID, Room Number, and Bed Number are required." },
        { status: 400 }
      );
    }

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found." }, { status: 404 });
    }

    // Locate block, floor, room, and bed
    let targetBlock = hostel.blocks.find((b) => b.name === blockName);
    if (!targetBlock && hostel.blocks.length > 0) {
      targetBlock = hostel.blocks[0]; // fallback to first block
    }

    if (!targetBlock) {
      return NextResponse.json({ error: "Specified block not found in hostel." }, { status: 404 });
    }

    const targetFloor = targetBlock.floors.find((f) => f.floorNumber === Number(floorNumber));
    if (!targetFloor) {
      return NextResponse.json({ error: "Specified floor not found." }, { status: 404 });
    }

    const targetRoom = targetFloor.rooms.find((r) => r.roomNumber === roomNumber);
    if (!targetRoom) {
      return NextResponse.json({ error: "Specified room not found." }, { status: 404 });
    }

    const targetBed = targetRoom.beds.find((b) => b.bedNumber === bedNumber);
    if (!targetBed) {
      return NextResponse.json({ error: "Specified bed slot not found in room." }, { status: 404 });
    }

    if (targetBed.isOccupied) {
      return NextResponse.json(
        { error: `Bed ${bedNumber} in Room ${roomNumber} is already occupied by another student.` },
        { status: 400 }
      );
    }

    // Free any previous bed this student might have occupied
    hostel.blocks.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          r.beds.forEach((bed) => {
            if (bed.studentId && bed.studentId.toString() === studentId.toString()) {
              bed.isOccupied = false;
              bed.studentId = undefined;
              bed.studentName = "";
              bed.studentRollNumber = "";
            }
          });
        });
      });
    });

    // Allot target bed
    targetBed.isOccupied = true;
    targetBed.studentId = student._id;
    targetBed.studentName = student.name;
    targetBed.studentRollNumber = student.rollNumber || "";
    targetBed.allottedAt = new Date();

    await hostel.save();

    // Update student's application
    const application = await HostelApplication.findOne({
      studentId: student._id,
      status: { $in: ["PENDING", "ELIGIBLE", "ALLOTTED"] },
    });

    if (application) {
      application.status = "ALLOTTED";
      application.statusRemark = `Successfully allotted to ${hostel.name}, Room ${roomNumber}, Bed ${bedNumber}.`;
      application.allotmentDetails = {
        hostelName: hostel.name,
        blockName: targetBlock.name,
        floorNumber: Number(floorNumber),
        roomNumber,
        bedNumber,
        allottedAt: new Date(),
      };
      await application.save();
    }

    // Update User model
    student.allotmentStatus = "ALLOTTED";
    student.hostelName = hostel.name;
    student.roomNumber = roomNumber;
    student.bedNumber = bedNumber;
    await student.save();

    return NextResponse.json({
      success: true,
      message: `Successfully allotted ${student.name} to Room ${roomNumber} (Bed ${bedNumber})`,
      allotment: {
        hostelName: hostel.name,
        blockName: targetBlock.name,
        floorNumber: Number(floorNumber),
        roomNumber,
        bedNumber,
      },
    });
  } catch (error: any) {
    console.error("Allotment POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to allot room" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can cancel allotments." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { studentId, remark, noticeUrl } = body;

    if (!studentId || !remark) {
      return NextResponse.json(
        { error: "Student ID and mandatory cancellation remark are required." },
        { status: 400 }
      );
    }

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // Free the bed in all hostels
    const hostels = await Hostel.find({});
    for (const hostel of hostels) {
      let modified = false;
      hostel.blocks.forEach((b) => {
        b.floors.forEach((f) => {
          f.rooms.forEach((r) => {
            r.beds.forEach((bed) => {
              if (bed.studentId && bed.studentId.toString() === studentId.toString()) {
                bed.isOccupied = false;
                bed.studentId = undefined;
                bed.studentName = "";
                bed.studentRollNumber = "";
                bed.allottedAt = undefined;
                modified = true;
              }
            });
          });
        });
      });
      if (modified) {
        await hostel.save();
      }
    }

    // Update active applications to CANCELLED
    const application = await HostelApplication.findOne({
      studentId: student._id,
      status: { $in: ["ALLOTTED", "ELIGIBLE", "PENDING"] },
    });

    if (application) {
      application.status = "CANCELLED";
      application.statusRemark = `Hostel allotment cancelled/evicted: ${remark}`;
      application.cancellationDetails = {
        remark,
        noticeUrl: noticeUrl || "",
        cancelledAt: new Date(),
        issuedBy: auth.name,
      };
      await application.save();
    }

    // Update User
    student.allotmentStatus = "CANCELLED";
    student.roomNumber = "";
    student.bedNumber = "";
    await student.save();

    return NextResponse.json({
      success: true,
      message: `Allotment for ${student.name} has been cancelled successfully.`,
    });
  } catch (error: any) {
    console.error("Allotment DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel allotment" }, { status: 500 });
  }
}
