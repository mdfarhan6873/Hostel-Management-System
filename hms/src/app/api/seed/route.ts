import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import {
  User,
  Student,
  Hostel,
  Block,
  Floor,
  Room,
  Bill,
  LeaveRequest,
  AdmissionNotice,
} from "@/lib/models";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  return runSeeder();
}

export async function POST() {
  return runSeeder();
}

async function runSeeder() {
  try {
    await connectToDatabase();

    // 1. CLEAR EXISTING DATABASE COMPLETELY & REMOVE STALE INDEXES
    const mongooseInstance = await connectToDatabase();
    if (mongooseInstance.connection.db) {
      const collections = await mongooseInstance.connection.db.listCollections().toArray();
      for (const col of collections) {
        try {
          await mongooseInstance.connection.db.dropCollection(col.name);
        } catch (err) {
          // ignore if already dropped
        }
      }
    }

    const adminHash = await hashPassword("SuperAdmin@123");
    const wardenHash = await hashPassword("Warden@123");
    const studentHash = await hashPassword("Student@123");

    // 2. CREATE SUPER ADMIN & WARDENS
    const superAdmin = await User.create({
      name: "Dr. Alok Ranjan (Dean Student Welfare)",
      email: "superadmin@gecmunger.ac.in",
      mobile: "+91 9431200001",
      password: adminHash,
      role: "superadmin",
    });

    const boysWarden = await User.create({
      name: "Prof. Rajesh Kumar Sharma",
      email: "warden.boys@gecmunger.ac.in",
      mobile: "+91 9835100002",
      password: wardenHash,
      role: "warden",
      assignedCategory: "Boys Hostel",
    });

    const girlsWarden = await User.create({
      name: "Dr. Sunita Kumari",
      email: "warden.girls@gecmunger.ac.in",
      mobile: "+91 9835100003",
      password: wardenHash,
      role: "warden",
      assignedCategory: "Girls Hostel",
    });

    // 3. CREATE HOSTEL CATEGORIES
    const boysHostel = await Hostel.create({
      name: "Boys Hostel",
      type: "boys",
      description: "Residential complex for male engineering undergraduates at GEC Munger.",
    });

    const girlsHostel = await Hostel.create({
      name: "Girls Hostel",
      type: "girls",
      description: "Residential complex for female engineering undergraduates with 24x7 security.",
    });

    // 4. CREATE BLOCKS & FLOORS
    const blockA = await Block.create({
      name: "Block A (Aryabhata Wing)",
      hostelId: boysHostel._id,
      wardenId: boysWarden._id,
    });

    const blockB = await Block.create({
      name: "Block B (Chanakya Wing)",
      hostelId: boysHostel._id,
      wardenId: boysWarden._id,
    });

    const blockG = await Block.create({
      name: "Block A (Gargi Wing)",
      hostelId: girlsHostel._id,
      wardenId: girlsWarden._id,
    });

    const groundFloorA = await Floor.create({
      name: "Ground Floor",
      floorNumber: 0,
      blockId: blockA._id,
    });

    const firstFloorA = await Floor.create({
      name: "First Floor",
      floorNumber: 1,
      blockId: blockA._id,
    });

    // 5. CREATE ROOMS WITH FURNITURE GROUPS (CUSTOM UNIQUE IDs)
    const room101 = await Room.create({
      roomNumber: "101",
      floorId: groundFloorA._id,
      blockId: blockA._id,
      hostelId: boysHostel._id,
      capacity: 2,
      roomType: "Double",
      furnitureGroups: [
        {
          groupName: "Furniture Group A",
          bedId: "BED-BA-101-A",
          tableId: "TAB-BA-101-A",
          chairId: "CHR-BA-101-A",
          isOccupied: false,
        },
        {
          groupName: "Furniture Group B",
          bedId: "BED-BA-101-B",
          tableId: "TAB-BA-101-B",
          chairId: "CHR-BA-101-B",
          isOccupied: false,
        },
      ],
    });

    const room102 = await Room.create({
      roomNumber: "102",
      floorId: groundFloorA._id,
      blockId: blockA._id,
      hostelId: boysHostel._id,
      capacity: 2,
      roomType: "Double",
      furnitureGroups: [
        {
          groupName: "Furniture Group A",
          bedId: "BED-BA-102-A",
          tableId: "TAB-BA-102-A",
          chairId: "CHR-BA-102-A",
          isOccupied: false,
        },
        {
          groupName: "Furniture Group B",
          bedId: "BED-BA-102-B",
          tableId: "TAB-BA-102-B",
          chairId: "CHR-BA-102-B",
          isOccupied: false,
        },
      ],
    });

    const room103 = await Room.create({
      roomNumber: "103",
      floorId: groundFloorA._id,
      blockId: blockA._id,
      hostelId: boysHostel._id,
      capacity: 3,
      roomType: "Triple",
      furnitureGroups: [
        {
          groupName: "Furniture Group A",
          bedId: "BED-BA-103-A",
          tableId: "TAB-BA-103-A",
          chairId: "CHR-BA-103-A",
          isOccupied: false,
        },
        {
          groupName: "Furniture Group B",
          bedId: "BED-BA-103-B",
          tableId: "TAB-BA-103-B",
          chairId: "CHR-BA-103-B",
          isOccupied: false,
        },
        {
          groupName: "Furniture Group C",
          bedId: "BED-BA-103-C",
          tableId: "TAB-BA-103-C",
          chairId: "CHR-BA-103-C",
          isOccupied: false,
        },
      ],
    });

    // 6. CREATE ALLOTTED AND WAITING STUDENTS
    const student1 = await Student.create({
      fullName: "Md Farhan Naiyyar",
      email: "student@gecmunger.ac.in",
      mobile: "+91 7004123456",
      password: studentHash,
      age: 20,
      completeAddress: "Mohalla Purab Sarai, Near Railway Station, Munger, Bihar - 811201",
      bloodGroup: "O+",
      rollNo: "22105128001",
      branch: "Computer Science & Engineering",
      session: "2025-2029",
      registrationNo: "22105128001/GEC",
      messCardNo: "MESS-2026-081",
      parents: {
        fatherName: "Mr. Naiyyar Alam",
        motherName: "Mrs. Shahnaz Begum",
        parentMobile: "+91 9835001122",
      },
      status: "ALLOTTED",
      hostelId: boysHostel._id,
      blockId: blockA._id,
      floorId: groundFloorA._id,
      roomId: room101._id,
      furnitureGroupName: "Furniture Group A",
      assignedBedId: "BED-BA-101-A",
      assignedTableId: "TAB-BA-101-A",
      assignedChairId: "CHR-BA-101-A",
    });

    const student2 = await Student.create({
      fullName: "Rahul Kumar Singh",
      email: "rahul.cse@gecmunger.ac.in",
      mobile: "+91 8210987654",
      password: studentHash,
      age: 21,
      completeAddress: "Boring Road, Patna, Bihar - 800001",
      bloodGroup: "B+",
      rollNo: "22105128002",
      branch: "Electronics & Communication",
      session: "2025-2029",
      registrationNo: "22105128002/GEC",
      messCardNo: "MESS-2026-082",
      parents: {
        fatherName: "Mr. Brijesh Singh",
        motherName: "Mrs. Sunita Singh",
        parentMobile: "+91 9431882211",
      },
      status: "ALLOTTED",
      hostelId: boysHostel._id,
      blockId: blockA._id,
      floorId: groundFloorA._id,
      roomId: room101._id,
      furnitureGroupName: "Furniture Group B",
      assignedBedId: "BED-BA-101-B",
      assignedTableId: "TAB-BA-101-B",
      assignedChairId: "CHR-BA-101-B",
    });

    // Update Room 101 occupancy
    room101.furnitureGroups[0].isOccupied = true;
    room101.furnitureGroups[0].occupiedBy = student1._id as any;
    room101.furnitureGroups[0].occupiedStudentName = student1.fullName;
    room101.furnitureGroups[0].occupiedStudentRoll = student1.rollNo;
    room101.furnitureGroups[0].occupiedStudentBranch = student1.branch;
    room101.furnitureGroups[0].occupiedStudentSession = student1.session;

    room101.furnitureGroups[1].isOccupied = true;
    room101.furnitureGroups[1].occupiedBy = student2._id as any;
    room101.furnitureGroups[1].occupiedStudentName = student2.fullName;
    room101.furnitureGroups[1].occupiedStudentRoll = student2.rollNo;
    room101.furnitureGroups[1].occupiedStudentBranch = student2.branch;
    room101.furnitureGroups[1].occupiedStudentSession = student2.session;
    await room101.save();

    // Student 3: WAITING
    const studentWaiting = await Student.create({
      fullName: "Amit Kumar Verma",
      email: "waiting.student@gecmunger.ac.in",
      mobile: "+91 9123456780",
      password: studentHash,
      age: 19,
      completeAddress: "Chowk Bazar, Bhagalpur, Bihar - 812002",
      bloodGroup: "A+",
      rollNo: "22105128045",
      branch: "Mechanical Engineering",
      session: "2025-2029",
      parents: {
        fatherName: "Mr. Dinesh Verma",
        motherName: "Mrs. Rita Verma",
        parentMobile: "+91 9934112233",
      },
      status: "WAITING",
    });

    // Student 4: CANCELLED / EVICTED
    const studentEvicted = await Student.create({
      fullName: "Vikramaditya Roy",
      email: "evicted.student@gecmunger.ac.in",
      mobile: "+91 9771234560",
      password: studentHash,
      age: 22,
      completeAddress: "Zero Mile, Muzaffarpur, Bihar - 842001",
      bloodGroup: "AB+",
      rollNo: "22105128099",
      branch: "Civil Engineering",
      session: "2024-2028",
      parents: {
        fatherName: "Mr. Ramesh Roy",
        motherName: "Mrs. Pushpa Roy",
        parentMobile: "+91 9334556677",
      },
      status: "CANCELLED",
      evictionRemark: "Disciplinary action taken due to repeated violation of hostel curfew hours.",
      evictionNoticeLink: "https://gecmunger.ac.in/circulars/evict-2026-099.pdf",
      evictedAt: new Date(),
    });

    // 7. CREATE SAMPLE LEAVE REQUEST (With handwritten application URL)
    const sampleLeave = await LeaveRequest.create({
      studentId: student1._id,
      startDate: new Date("2026-08-05"),
      endDate: new Date("2026-08-10"),
      daysCount: 5,
      reason: "Attending sister's wedding at native village with parental approval.",
      handwrittenApplicationUrl:
        "https://raw.githubusercontent.com/mdfarhan6873/Hostel-Management-System/main/docs/handwritten_leave_sample.pdf",
      status: "APPROVED",
      reviewedBy: boysWarden._id,
      reviewedAt: new Date("2026-08-04"),
    });

    // 8. CREATE BILLS (With flexible time period and leave-based rebate)
    await Bill.create({
      studentId: student1._id,
      wardenId: boysWarden._id,
      title: "Mess Charges (with Leave Rebate Deduction)",
      billType: "mess",
      billingPeriod: "August 2026",
      baseAmount: 3500,
      leaveDaysRebate: 5,
      rebateAmount: 500, // 5 days * 100/day
      netAmount: 3000,
      dueDate: new Date("2026-08-25"),
      status: "PENDING",
    });

    await Bill.create({
      studentId: student1._id,
      wardenId: boysWarden._id,
      title: "Hostel Maintenance & Residency Fee",
      billType: "rent",
      billingPeriod: "Jan-July 2026", // Range billing period as requested
      baseAmount: 6000,
      leaveDaysRebate: 0,
      rebateAmount: 0,
      netAmount: 6000,
      dueDate: new Date("2026-07-31"),
      status: "PAID",
      paidAt: new Date("2026-07-28"),
      receiptNumber: "REC-GEC-2026-0801",
      transactionId: "UPI/260728994821",
    });

    // 9. CREATE PUBLISHED ADMISSION NOTICES & CIRCULARS
    await AdmissionNotice.create([
      {
        title: "सत्र 2025-26 छात्रावास प्रवेश प्रपत्र एवं सीट आवंटन (Session 2025-26 Hostel Admission Form)",
        description:
          "सत्र 2025-26 के चयनित छात्र-छात्राएं प्रवेश प्रपत्र, शपथ पत्र एवं आवश्यक दस्तावेज वार्डन कार्यालय में 25 अगस्त 2026 तक अनिवार्य रूप से जमा करें।",
        category: "ADMISSION",
        refNumber: "Ref: GEC/HMS/2026/092",
        publishDate: new Date("2026-08-18"),
        pdfLinks: [
          { label: "प्रवेश प्रपत्र (Admission Form PDF)", url: "#download-admission-form" },
          { label: "शुल्क संरचना (Fee Structure PDF)", url: "#fee-structure" },
          { label: "नियम व विनियम (Rules & Regulations)", url: "#rules-modal" },
        ],
        isActive: true,
      },
      {
        title: "कमरा एवं फर्नीचर ब्लूप्रिंट मैपिंग (Room & Furniture Blueprint Mapping)",
        description:
          "वार्डन डैशबोर्ड पर प्रत्येक कक्ष के लिए विशिष्ट परिसंपत्ति पहचान संख्या अंकित कर दी गई है। आवंटन सूची में अपना नाम व फर्नीचर आईडी सत्यापित करें।",
        category: "BLUEPRINT",
        refNumber: "Ref: GEC/HMS/2026/088",
        publishDate: new Date("2026-08-15"),
        pdfLinks: [
          { label: "आदेश पत्र डाउनलोड (Download Circular)", url: "#download-circular" },
          { label: "संपत्ति संरक्षण नियम (Asset Guidelines)", url: "#asset-rules" },
        ],
        isActive: true,
      },
      {
        title: "मेस रिबेट एवं दैनिक उपस्थिति संबंधी दिशा-निर्देश (Mess Rebate & Attendance Policy)",
        description:
          "स्वीकृत अवकाश एवं दैनिक 7-8 PM बायो-अटेंडेंस सत्यापन के आधार पर मासिक मेस शुल्क में पारदर्शी छूट लागू करने हेतु नियम जारी किए गए हैं।",
        category: "REBATE",
        refNumber: "Ref: GEC/HMS/2026/085",
        publishDate: new Date("2026-08-10"),
        pdfLinks: [
          { label: "मेस रिबेट नियम (Mess Rebate Policy)", url: "#mess-rebate" },
          { label: "रिबेट आवेदन फॉर्म (Rebate Application Form)", url: "#rebate-form" },
        ],
        isActive: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Database cleared and re-seeded successfully with institutional test data.",
      credentials: {
        superadmin: { email: "superadmin@gecmunger.ac.in", password: "SuperAdmin@123" },
        boysWarden: { email: "warden.boys@gecmunger.ac.in", password: "Warden@123" },
        girlsWarden: { email: "warden.girls@gecmunger.ac.in", password: "Warden@123" },
        studentAllotted: { email: "student@gecmunger.ac.in", password: "Student@123" },
        studentWaiting: { email: "waiting.student@gecmunger.ac.in", password: "Student@123" },
        studentEvicted: { email: "evicted.student@gecmunger.ac.in", password: "Student@123" },
      },
      counts: {
        users: await User.countDocuments(),
        students: await Student.countDocuments(),
        hostels: await Hostel.countDocuments(),
        rooms: await Room.countDocuments(),
        bills: await Bill.countDocuments(),
        leaves: await LeaveRequest.countDocuments(),
        notices: await AdmissionNotice.countDocuments(),
      },
    });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ error: error.message || "Seeding failed" }, { status: 500 });
  }
}
