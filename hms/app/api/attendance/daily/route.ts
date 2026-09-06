import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Hostel } from "@/lib/models/Hostel";
import { Attendance } from "@/lib/models/Attendance";
import { LeaveRequest } from "@/lib/models/LeaveRequest";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "VIEWER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);

    // Date defaults to today YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];
    const targetDateStr = searchParams.get("date") || todayStr;
    const hostelId = searchParams.get("hostelId");
    const floorFilter = searchParams.get("floor"); // e.g. "1"
    const statusFilter = searchParams.get("status"); // "ALL", "MISSED", "PRESENT", "LEAVE"

    // Construct Date Range for the target day
    const dayStart = new Date(`${targetDateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${targetDateStr}T23:59:59.999Z`);

    // 1. Fetch Hostels
    let hostelQuery: any = {};
    if (hostelId) {
      hostelQuery._id = hostelId;
    }
    const hostels = await Hostel.find(hostelQuery).lean();

    // 2. Fetch all Attendance records for this target date (stored as YYYY-MM-DD string)
    const attendances = await Attendance.find({
      date: targetDateStr,
    }).lean();

    const attendanceMap = new Map();
    attendances.forEach((att: any) => {
      attendanceMap.set(att.studentId.toString(), att);
    });

    // 3. Fetch all approved Leaves covering this target date (startDate and endDate in YYYY-MM-DD format)
    const leaves = await LeaveRequest.find({
      status: "APPROVED",
      startDate: { $lte: targetDateStr },
      endDate: { $gte: targetDateStr },
    }).lean();

    const leaveMap = new Map();
    leaves.forEach((lv: any) => {
      leaveMap.set(lv.studentId.toString(), lv);
    });

    // 4. Fetch User photos and details
    const allottedUsers = await User.find({
      allotmentStatus: "ALLOTTED",
    })
      .select("_id name rollNumber phone guardianPhone avatarUrl roomNumber hostelName bedNumber")
      .lean();

    const userMap = new Map();
    allottedUsers.forEach((u: any) => {
      userMap.set(u._id.toString(), u);
    });

    let totalAllotted = 0;
    let presentCount = 0;
    let leaveCount = 0;
    let missedCount = 0;

    // 5. Structure Floor-Wise & Room-Wise Hierarchy
    const structuredHostels = hostels.map((hostel: any) => {
      const blocks = (hostel.blocks || []).map((block: any) => {
        const floors = (block.floors || [])
          .filter((floor: any) => {
            if (floorFilter && floorFilter !== "ALL") {
              return floor.floorNumber.toString() === floorFilter;
            }
            return true;
          })
          .map((floor: any) => {
            let floorTotalResidents = 0;
            let floorPresent = 0;
            let floorLeave = 0;
            let floorMissed = 0;

            const rooms = (floor.rooms || []).map((room: any) => {
              const beds = (room.beds || []).map((bed: any) => {
                if (!bed.isOccupied || !bed.studentId) {
                  return {
                    bedNumber: bed.bedNumber,
                    isOccupied: false,
                    student: null,
                    attendance: null,
                  };
                }

                totalAllotted++;
                floorTotalResidents++;
                const studentIdStr = bed.studentId.toString();
                const studentProfile = userMap.get(studentIdStr) || {
                  _id: bed.studentId,
                  name: bed.studentName,
                  rollNumber: bed.studentRollNumber,
                };

                // Check attendance
                const attRecord = attendanceMap.get(studentIdStr);
                const leaveRecord = leaveMap.get(studentIdStr);

                let attendanceStatus = "MISSED";
                let attendanceDetails: any = null;

                if (attRecord) {
                  attendanceStatus = "PRESENT";
                  presentCount++;
                  floorPresent++;
                  const markedTime = attRecord.markedAt || attRecord.createdAt;
                  attendanceDetails = {
                    attendanceId: attRecord._id,
                    markedAt: markedTime,
                    timeString: markedTime
                      ? new Date(markedTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Verified",
                    selfieImageUrl: attRecord.selfieUrl || studentProfile.avatarUrl,
                    roomNumberWatermarked: attRecord.roomNumber || room.roomNumber,
                    isManualOverride: !!attRecord.disciplinaryAction?.adminRemark?.includes("OVERRIDE"),
                    remarks: attRecord.disciplinaryAction?.adminRemark || "",
                  };
                } else if (leaveRecord) {
                  attendanceStatus = "LEAVE";
                  leaveCount++;
                  floorLeave++;
                  attendanceDetails = {
                    leaveId: leaveRecord._id,
                    reason: leaveRecord.reason,
                    parentVerificationNotes: leaveRecord.parentVerification?.adminNotes || "",
                    spokenWith: leaveRecord.parentVerification?.spokenWith || "",
                    startDate: leaveRecord.startDate,
                    endDate: leaveRecord.endDate,
                  };
                } else {
                  attendanceStatus = "MISSED";
                  missedCount++;
                  floorMissed++;
                  attendanceDetails = {
                    unaccounted: true,
                    message: "Selfie roll-call not marked during evening window (7-8 PM)",
                  };
                }

                return {
                  bedNumber: bed.bedNumber,
                  isOccupied: true,
                  student: studentProfile,
                  attendance: {
                    status: attendanceStatus,
                    ...attendanceDetails,
                  },
                };
              });

              return {
                roomNumber: room.roomNumber,
                capacityType: room.capacityType,
                totalBeds: room.totalBeds,
                beds,
              };
            });

            return {
              floorNumber: floor.floorNumber,
              floorName: floor.floorName,
              roomRange: floor.roomRange,
              stats: {
                residents: floorTotalResidents,
                present: floorPresent,
                leave: floorLeave,
                missed: floorMissed,
              },
              rooms,
            };
          });

        return {
          name: block.name,
          floors,
        };
      });

      return {
        _id: hostel._id,
        name: hostel.name,
        code: hostel.code,
        gender: hostel.gender,
        blocks,
      };
    });

    const attendanceRate =
      totalAllotted > 0 ? Math.round((presentCount / totalAllotted) * 100) : 0;

    return NextResponse.json({
      success: true,
      date: targetDateStr,
      summary: {
        totalAllotted,
        presentCount,
        leaveCount,
        missedCount,
        attendanceRate,
      },
      hostels: structuredHostels,
    });
  } catch (error: any) {
    console.error("Daily attendance fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch daily attendance" }, { status: 500 });
  }
}
