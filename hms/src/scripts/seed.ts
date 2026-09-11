import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db";
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
} from "../lib/models";
import { hashPassword } from "../lib/auth";

async function runSeeder() {
  console.log("🚀 Connecting to MongoDB...");
  await connectToDatabase();
  console.log("Connected to MongoDB Atlas!");

  console.log("🧹 Dropping all existing collections to remove stale indexes & data...");
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      try {
        await mongoose.connection.db.dropCollection(col.name);
        console.log(`Dropped collection: ${col.name}`);
      } catch (err: any) {
        console.log(`Note on dropping ${col.name}:`, err.message);
      }
    }
  }
  console.log("Database cleared successfully!");

  console.log("🌱 Generating password hashes...");
  const adminHash = await hashPassword("SuperAdmin@123");
  const wardenHash = await hashPassword("Warden@123");
  const studentHash = await hashPassword("Student@123");

  console.log("👤 Creating Super Admin, Wardens, and Viewers...");
  const superAdmin = await User.create({
    name: "Dr. A. K. Sharma (Principal / Institutional Head)",
    email: "superadmin@gecmunger.ac.in",
    mobile: "+91 9431000001",
    password: adminHash,
    role: "superadmin",
    designation: "Principal / Institutional Head",
    status: "ACTIVE",
  });

  const boysWarden = await User.create({
    name: "Prof. R. K. Singh",
    email: "warden.boys@gecmunger.ac.in",
    mobile: "+91 9431234567",
    password: wardenHash,
    role: "warden",
    assignedCategory: "Boys Hostel Category",
    designation: "Associate Professor, Mechanical",
    status: "ACTIVE",
  });

  const girlsWarden = await User.create({
    name: "Dr. Neha Kumari",
    email: "warden.girls@gecmunger.ac.in",
    mobile: "+91 9123456780",
    password: wardenHash,
    role: "warden",
    assignedCategory: "Girls Hostel Category",
    designation: "Assistant Professor, CSE",
    status: "ACTIVE",
  });

  await User.create({
    name: "Prof. Manoj Jha",
    email: "academic.dean@gecmunger.ac.in",
    mobile: "+91 9431099881",
    password: wardenHash,
    role: "viewer",
    designation: "Dean Academic Affairs",
    status: "ACTIVE",
  });

  await User.create({
    name: "Ananya Roy",
    email: "internal.audit@gecmunger.ac.in",
    mobile: "+91 9771122334",
    password: wardenHash,
    role: "viewer",
    designation: "Internal Audit & Mess Billing Cell",
    status: "ACTIVE",
  });

  console.log("🏢 Creating Hostel Categories...");
  const boysHostel = await Hostel.create({
    name: "Boys Hostel Category",
    type: "boys",
    description: "Code: BH-GEC-MGR • Haveli Kharagpur Permanent Campus residential complex for male engineering undergraduates.",
  });

  const girlsHostel = await Hostel.create({
    name: "Girls Hostel Category",
    type: "girls",
    description: "Code: GH-GEC-MGR • Secure Campus Residential Enclave for female engineering undergraduates with 24x7 security.",
  });

  console.log("🏗️ Creating Blocks & Floors...");
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

  console.log("🛏️ Creating Rooms with sequential Furniture Groups (Bed/Table/Chair IDs)...");
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

  console.log("🎓 Creating Students across all Lifecycle states...");
  // Student 1: ALLOTTED
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

  // Student 2: ALLOTTED
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

  // Update room 101 occupancy
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
  await Student.create({
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
  await Student.create({
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

  console.log("📝 Creating Leave Request (with handwritten application URL)...");
  await LeaveRequest.create({
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

  console.log("💳 Creating Bills (supporting flexible month / range like Jan-July)...");
  await Bill.create({
    studentId: student1._id,
    wardenId: boysWarden._id,
    title: "Mess Charges (with Leave Rebate Deduction)",
    billType: "mess",
    billingPeriod: "August 2026",
    baseAmount: 3500,
    leaveDaysRebate: 5,
    rebateAmount: 500,
    netAmount: 3000,
    dueDate: new Date("2026-08-25"),
    status: "PENDING",
  });

  await Bill.create({
    studentId: student1._id,
    wardenId: boysWarden._id,
    title: "Hostel Maintenance & Residency Fee",
    billType: "rent",
    billingPeriod: "Jan-July 2026", // Flexible range time period
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

  console.log("📢 Creating Published Admission Notices & Circulars...");
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

  console.log("==========================================");
  console.log("✅ SEEDING COMPLETE WITH DATABASE WIPE!");
  console.log("Users:", await User.countDocuments());
  console.log("Students:", await Student.countDocuments());
  console.log("Hostels:", await Hostel.countDocuments());
  console.log("Blocks:", await Block.countDocuments());
  console.log("Rooms:", await Room.countDocuments());
  console.log("Bills:", await Bill.countDocuments());
  console.log("Leaves:", await LeaveRequest.countDocuments());
  console.log("Notices:", await AdmissionNotice.countDocuments());
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
}

runSeeder().catch((err) => {
  console.error("Seeder failed with error:", err);
  process.exit(1);
});
