import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://farhannaiyyar04_db_user:farhan999@hms.pnipuys.mongodb.net/hostel_db?retryWrites=true&w=majority&appName=hms";

async function runSeed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;

  // Clear existing collections
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    if (col.name.startsWith("system.")) continue;
    await db.collection(col.name).deleteMany({});
  }
  console.log("Cleared collections for fresh seed.");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Users
  const usersCollection = db.collection("users");
  const adminId = new mongoose.Types.ObjectId();
  const viewerId = new mongoose.Types.ObjectId();
  const student1Id = new mongoose.Types.ObjectId();
  const student2Id = new mongoose.Types.ObjectId();
  const student3Id = new mongoose.Types.ObjectId();

  await usersCollection.insertMany([
    {
      _id: adminId,
      name: "Chief Warden Admin",
      email: "admin@hostel.edu",
      phone: "9876543210",
      rollNumber: "ADMIN01",
      registrationNumber: "REG-ADM-001",
      password: hashedPassword,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      department: "Hostel Administration",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: viewerId,
      name: "Prof. Rajesh Kumar (Supervisor)",
      email: "warden@hostel.edu",
      phone: "9876543211",
      rollNumber: "VIEWER01",
      registrationNumber: "REG-WRD-001",
      password: hashedPassword,
      role: "VIEWER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      department: "Warden Office",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: student1Id,
      name: "Aarav Sharma",
      email: "aarav@hostel.edu",
      phone: "9876543212",
      rollNumber: "2024CS001",
      registrationNumber: "REG-2024-CS01",
      password: hashedPassword,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      department: "Computer Science & Engineering",
      semester: 3,
      batch: "2023-2027",
      guardianPhone: "9811223344",
      bloodGroup: "B+",
      allotmentStatus: "ALLOTTED",
      hostelName: "Girls_Hostel_01",
      roomNumber: "101",
      bedNumber: "A",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: student2Id,
      name: "Ananya Patel",
      email: "ananya@hostel.edu",
      phone: "9876543213",
      rollNumber: "2024CS045",
      registrationNumber: "", // optional, to test dashboard update
      password: hashedPassword,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      department: "Information Technology",
      semester: 1,
      batch: "2024-2028",
      guardianPhone: "9822334455",
      bloodGroup: "O+",
      allotmentStatus: "ELIGIBLE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: student3Id,
      name: "Priya Singh",
      email: "priya@hostel.edu",
      phone: "9876543214",
      rollNumber: "2024EC012",
      registrationNumber: "",
      password: hashedPassword,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
      department: "Electronics & Communication",
      semester: 1,
      batch: "2024-2028",
      guardianPhone: "9833445566",
      bloodGroup: "A+",
      allotmentStatus: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Seeded Users: Admin, Viewer, and Students.");

  // 2. Hostels
  const hostelsCollection = db.collection("hostels");
  const girlsHostelId = new mongoose.Types.ObjectId();
  const boysHostelId = new mongoose.Types.ObjectId();

  await hostelsCollection.insertMany([
    {
      _id: girlsHostelId,
      name: "Girls Hostel",
      code: "GH01",
      gender: "FEMALE",
      wardenName: "Dr. Sunita Deshmukh",
      wardenContact: "9876543299",
      blocks: [
        {
          name: "Girls_Hostel_01",
          floors: [
            {
              floorNumber: 0,
              floorName: "Ground Floor (0-100)",
              roomRange: "0-100",
              rooms: [
                {
                  roomNumber: "G01",
                  capacityType: "SINGLE",
                  totalBeds: 1,
                  beds: [{ bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" }],
                },
                {
                  roomNumber: "G02",
                  capacityType: "DOUBLE",
                  totalBeds: 2,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
                {
                  roomNumber: "G03",
                  capacityType: "TRIPLE",
                  totalBeds: 3,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "C", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
              ],
            },
            {
              floorNumber: 1,
              floorName: "First Floor (101-200)",
              roomRange: "101-200",
              rooms: [
                {
                  roomNumber: "101",
                  capacityType: "DOUBLE",
                  totalBeds: 2,
                  beds: [
                    {
                      bedNumber: "A",
                      isOccupied: true,
                      studentId: student1Id,
                      studentName: "Aarav Sharma",
                      studentRollNumber: "2024CS001",
                      allottedAt: new Date("2026-08-01"),
                    },
                    {
                      bedNumber: "B",
                      isOccupied: false,
                      studentId: null,
                      studentName: "",
                      studentRollNumber: "",
                    },
                  ],
                },
                {
                  roomNumber: "102",
                  capacityType: "TRIPLE",
                  totalBeds: 3,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "C", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
                {
                  roomNumber: "103",
                  capacityType: "SINGLE",
                  totalBeds: 1,
                  beds: [{ bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" }],
                },
              ],
            },
            {
              floorNumber: 2,
              floorName: "Second Floor (201-300)",
              roomRange: "201-300",
              rooms: [
                {
                  roomNumber: "201",
                  capacityType: "DOUBLE",
                  totalBeds: 2,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
                {
                  roomNumber: "202",
                  capacityType: "TRIPLE",
                  totalBeds: 3,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "C", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
              ],
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: boysHostelId,
      name: "Boys Hostel",
      code: "BH01",
      gender: "MALE",
      wardenName: "Dr. Arvind Rao",
      wardenContact: "9876543298",
      blocks: [
        {
          name: "Boys_Hostel_01",
          floors: [
            {
              floorNumber: 0,
              floorName: "Ground Floor (0-100)",
              roomRange: "0-100",
              rooms: [
                {
                  roomNumber: "G01",
                  capacityType: "DOUBLE",
                  totalBeds: 2,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
                {
                  roomNumber: "G02",
                  capacityType: "TRIPLE",
                  totalBeds: 3,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "C", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
              ],
            },
            {
              floorNumber: 1,
              floorName: "First Floor (101-200)",
              roomRange: "101-200",
              rooms: [
                {
                  roomNumber: "101",
                  capacityType: "SINGLE",
                  totalBeds: 1,
                  beds: [{ bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" }],
                },
                {
                  roomNumber: "102",
                  capacityType: "DOUBLE",
                  totalBeds: 2,
                  beds: [
                    { bedNumber: "A", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                    { bedNumber: "B", isOccupied: false, studentId: null, studentName: "", studentRollNumber: "" },
                  ],
                },
              ],
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Seeded Hostels: Girls Hostel & Boys Hostel with floors and rooms.");

  // 3. Application Windows
  const windowsCollection = db.collection("applicationwindows");
  const window1Id = new mongoose.Types.ObjectId();
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 10); // 10 days from now

  await windowsCollection.insertOne({
    _id: window1Id,
    title: "Girls Hostel Phase-I Admission 2026",
    hostelId: girlsHostelId,
    hostelName: "Girls Hostel (Girls_Hostel_01)",
    blockName: "Girls_Hostel_01",
    startDate: new Date(),
    endDate: deadlineDate,
    targetRemark: "Open exclusively for 1st Year B.Tech 2026 Batch & Lateral Entry Students",
    feeStructureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    rulesRegulationsUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Seeded Admission Application Window.");

  // 4. Applications
  const applicationsCollection = db.collection("hostelapplications");
  const app2Id = new mongoose.Types.ObjectId();

  await applicationsCollection.insertMany([
    {
      studentId: student1Id,
      windowId: window1Id,
      hostelId: girlsHostelId,
      hostelName: "Girls Hostel",
      name: "Aarav Sharma",
      dob: "2005-04-12",
      age: 19,
      gender: "Male",
      phone: "9876543212",
      email: "aarav@hostel.edu",
      passwordHint: "password123",
      parentPhone: "9811223344",
      address: "House 45, Sector 14, Chandigarh, India",
      aadhaarNumber: "7890 1234 5678",
      aadhaarFileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
      photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300",
      rollNumber: "2024CS001",
      registrationNumber: "REG-2024-CS01",
      branch: "Computer Science & Engineering",
      session: "2024-2028",
      semester: 3,
      lastExamType: "SEMESTER",
      semesterSgpaList: "Sem 1: 8.8, Sem 2: 9.1",
      currentCgpa: 8.95,
      bloodGroup: "B+",
      medicalRemark: "None",
      status: "ALLOTTED",
      allotmentDetails: {
        hostelName: "Girls Hostel",
        blockName: "Girls_Hostel_01",
        floorNumber: 1,
        roomNumber: "101",
        bedNumber: "A",
        allottedAt: new Date("2026-08-01"),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: app2Id,
      studentId: student2Id,
      windowId: window1Id,
      hostelId: girlsHostelId,
      hostelName: "Girls Hostel",
      name: "Ananya Patel",
      dob: "2006-08-20",
      age: 18,
      gender: "Female",
      phone: "9876543213",
      email: "ananya@hostel.edu",
      passwordHint: "password123",
      parentPhone: "9822334455",
      address: "Flat 202, Green Avenue, Pune, Maharashtra",
      aadhaarNumber: "6543 9876 1234",
      aadhaarFileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
      rollNumber: "2024CS045",
      registrationNumber: "",
      branch: "Information Technology",
      session: "2024-2028",
      semester: 1,
      lastExamType: "12TH",
      twelfthBoardName: "CBSE",
      twelfthPercentage: 94.6,
      bloodGroup: "O+",
      medicalRemark: "Mild dust allergy",
      status: "ELIGIBLE",
      statusRemark: "Eligible, kindly pay fee and confirm your seat in hostel.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      studentId: student3Id,
      windowId: window1Id,
      hostelId: girlsHostelId,
      hostelName: "Girls Hostel",
      name: "Priya Singh",
      dob: "2006-02-14",
      age: 18,
      gender: "Female",
      phone: "9876543214",
      email: "priya@hostel.edu",
      passwordHint: "password123",
      parentPhone: "9833445566",
      address: "12/A, Civil Lines, Jaipur, Rajasthan",
      aadhaarNumber: "4321 8765 2109",
      aadhaarFileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
      photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
      rollNumber: "2024EC012",
      registrationNumber: "",
      branch: "Electronics & Communication",
      session: "2024-2028",
      semester: 1,
      lastExamType: "12TH",
      twelfthBoardName: "State Board",
      twelfthPercentage: 88.2,
      bloodGroup: "A+",
      medicalRemark: "None",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Seeded Applications.");

  // 5. Payment Accounts (Admin UPI & QR)
  const upiAccountsCollection = db.collection("paymentaccounts");
  const upiMainId = new mongoose.Types.ObjectId();
  const upiMessId = new mongoose.Types.ObjectId();
  const upiDepositId = new mongoose.Types.ObjectId();

  await upiAccountsCollection.insertMany([
    {
      _id: upiMainId,
      title: "Hostel Maintenance & Rent Account",
      payeeName: "ABC College Hostel Welfare Trust",
      upiId: "hosteloffice@sbi",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=hosteloffice@sbi%26pn=Hostel%20Welfare%20Trust",
      description: "Designated account for 6-month hostel rent and building maintenance fees.",
      isDefault: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: upiMessId,
      title: "Mess Facility & Catering Services Account",
      payeeName: "Student Central Dining Committee",
      upiId: "hostelmess@okhdfcbank",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=hostelmess@okhdfcbank%26pn=Student%20Dining%20Services",
      description: "Official account for mess charges, meal plans, and cafeteria maintenance.",
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: upiDepositId,
      title: "Security Caution Deposit Account (Refundable)",
      payeeName: "Hostel Caution & Escrow Fund",
      upiId: "hosteldeposit@icici",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=hosteldeposit@icici%26pn=Hostel%20Caution%20Fund",
      description: "Dedicated escrow account for 100% refundable security deposits.",
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Seeded Admin UPI Payment Accounts.");

  // 6. Bills with Mess Rebates
  const billsCollection = db.collection("bills");
  const due1 = new Date();
  due1.setDate(due1.getDate() + 15);

  await billsCollection.insertMany([
    {
      billNumber: "HMS-BILL-2026-001",
      studentId: student1Id,
      studentName: "Aarav Sharma",
      studentRollNumber: "2024CS001",
      recipientType: "ALLOTTED_STUDENT",
      billType: "PERIODIC_HOSTEL_MESS",
      frequency: "SIX_MONTHS",
      items: [
        {
          title: "Hostel Room Rent (6 Months)",
          amount: 24000,
          category: "HOSTEL_RENT",
          isRefundable: false,
          remark: "Room 101 Double Sharing",
        },
        {
          title: "Mess Charges (6 Months)",
          amount: 18000,
          category: "MESS_FEE",
          isRefundable: false,
          remark: "All 3 Meals + Evening Snacks",
        },
        {
          title: "Mess Rebate for Approved Leaves (5 Days @ 70%)",
          amount: -630,
          category: "MESS_REBATE",
          isRefundable: false,
          remark: "Deducted 5 days approved leave at 70% daily mess rate",
        },
      ],
      totalAmount: 41370,
      dueDate: due1,
      overallRemark: "Semester 3 Residential and Dining Invoice with 5-day Mess Leave Rebate applied.",
      messRebateDetails: {
        applied: true,
        leaveDaysCount: 5,
        rebatePercentage: 70,
        rebateAmount: 630,
      },
      paymentAccountId: upiMainId,
      paymentAccountSnapshot: {
        title: "Hostel Maintenance & Rent Account",
        payeeName: "ABC College Hostel Welfare Trust",
        upiId: "hosteloffice@sbi",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=hosteloffice@sbi%26pn=Hostel%20Welfare%20Trust",
      },
      status: "UNPAID",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      billNumber: "HMS-BILL-2026-002",
      studentId: student2Id,
      studentName: "Ananya Patel",
      studentRollNumber: "2024CS045",
      recipientType: "ELIGIBLE_APPLICANT",
      applicationId: app2Id,
      billType: "ADMISSION_CONFIRMATION",
      frequency: "ONE_TIME",
      items: [
        {
          title: "One-Time Hostel Admission Fee",
          amount: 5000,
          category: "OTHER",
          isRefundable: false,
          remark: "Non-refundable processing fee",
        },
        {
          title: "Hostel Caution Deposit (Refundable)",
          amount: 10000,
          category: "SECURITY_DEPOSIT",
          isRefundable: true,
          remark: "100% refundable upon vacating hostel",
        },
        {
          title: "First Term Hostel Rent (6 Months)",
          amount: 24000,
          category: "HOSTEL_RENT",
          isRefundable: false,
          remark: "Standard double sharing fee",
        },
      ],
      totalAmount: 39000,
      dueDate: due1,
      overallRemark: "Pay to confirm seat allotment in Girls Hostel.",
      messRebateDetails: {
        applied: false,
        leaveDaysCount: 0,
        rebatePercentage: 70,
        rebateAmount: 0,
      },
      paymentAccountId: upiDepositId,
      paymentAccountSnapshot: {
        title: "Security Caution Deposit Account (Refundable)",
        payeeName: "Hostel Caution & Escrow Fund",
        upiId: "hosteldeposit@icici",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=hosteldeposit@icici%26pn=Hostel%20Caution%20Fund",
      },
      status: "UNPAID",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Seeded Bills with Mess Rebates.");

  // 7. Attendance Records (Sample for Aarav Sharma)
  const attendanceCollection = db.collection("attendances");
  const attendanceDocs = [];
  const currentMonth = "2026-09";

  // Days 1 to 5: Present
  for (let day = 1; day <= 5; day++) {
    const pad = day < 10 ? `0${day}` : `${day}`;
    attendanceDocs.push({
      studentId: student1Id,
      studentName: "Aarav Sharma",
      studentRollNumber: "2024CS001",
      hostelName: "Girls Hostel",
      roomNumber: "101",
      date: `${currentMonth}-${pad}`,
      markedAt: new Date(`2026-09-${pad}T19:24:10Z`),
      selfieUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
      status: "PRESENT",
      timeWindow: "19:00 - 20:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Day 6: Missed
  attendanceDocs.push({
    studentId: student1Id,
    studentName: "Aarav Sharma",
    studentRollNumber: "2024CS001",
    hostelName: "Girls Hostel",
    roomNumber: "101",
    date: `${currentMonth}-06`,
    status: "MISSED",
    timeWindow: "19:00 - 20:00",
    disciplinaryAction: {
      actionType: "NONE",
      warningNotice: "",
      adminRemark: "Awaiting student explanation",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await attendanceCollection.insertMany(attendanceDocs);
  console.log("Seeded Attendance logs.");

  // 8. Leave Requests
  const leavesCollection = db.collection("leaverequests");
  await leavesCollection.insertOne({
    studentId: student1Id,
    studentName: "Aarav Sharma",
    studentRollNumber: "2024CS001",
    roomNumber: "101",
    hostelName: "Girls Hostel",
    startDate: "2026-09-10",
    endDate: "2026-09-14",
    totalDays: 5,
    reason: "Sister's wedding in home town",
    handwrittenDocUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600",
    emergencyContact: "9811223344",
    status: "APPROVED",
    parentVerification: {
      calledAt: new Date("2026-09-05T14:30:00Z"),
      parentPhoneCalled: "9811223344",
      spokenWith: "Father (Mr. Rakesh Sharma)",
      consentConfirmed: true,
      adminNotes: "Father confirmed family wedding function and dates.",
      verifiedBy: "Chief Warden Admin",
    },
    adminDecisionRemark: "Approved with full parent consent.",
    approvedAt: new Date("2026-09-05T14:35:00Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Seeded Leave Requests with parent verification.");

  console.log("--- SEEDING COMPLETED SUCCESSFULLY! ---");
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
