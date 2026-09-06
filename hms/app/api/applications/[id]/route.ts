import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HostelApplication } from "@/lib/models/HostelApplication";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const app = await HostelApplication.findById(params.id).lean();
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, application: app });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch application" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can update application status" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { status, statusRemark } = body;

    const application = await HostelApplication.findById(params.id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    application.status = status;
    if (status === "ELIGIBLE") {
      application.statusRemark =
        statusRemark || "Eligible, kindly pay fee and confirm your seat in hostel.";

      // Check if student already has a pending or paid admission bill
      const { Bill } = await import("@/lib/models/Bill");
      const { PaymentAccount } = await import("@/lib/models/PaymentAccount");

      const existingBill = await Bill.findOne({ studentId: application.studentId });
      if (!existingBill) {
        // Find default or active payment account
        let paymentAcc = await PaymentAccount.findOne({ isActive: true, isDefault: true });
        if (!paymentAcc) {
          paymentAcc = await PaymentAccount.findOne({ isActive: true });
        }

        if (paymentAcc) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7); // 7 days to pay

          await Bill.create({
            billNumber: `BILL-ADM-${Date.now().toString().slice(-6)}`,
            studentId: application.studentId,
            studentName: application.name,
            studentRollNumber: application.rollNumber,
            recipientType: "ELIGIBLE_APPLICANT",
            applicationId: application._id,
            billType: "ADMISSION_CONFIRMATION",
            frequency: "SIX_MONTHS",
            items: [
              {
                title: "Semester Hostel Room Rent (6 Months)",
                amount: 24000,
                category: "HOSTEL_RENT",
                isRefundable: false,
                remark: "Standard hostel accommodation fee",
              },
              {
                title: "Mess Advance & Meal Facility (6 Months)",
                amount: 18000,
                category: "MESS_FEE",
                isRefundable: false,
                remark: "Breakfast, Lunch, Evening Snacks & Dinner",
              },
              {
                title: "Refundable Hostel Caution Security Deposit",
                amount: 5000,
                category: "SECURITY_DEPOSIT",
                isRefundable: true,
                remark: "Refundable at the time of leaving hostel",
              },
            ],
            totalAmount: 47000,
            dueDate,
            overallRemark: "Admission confirmation fee. Pay via assigned UPI QR and submit UTR to confirm bed allotment.",
            paymentAccountId: paymentAcc._id,
            paymentAccountSnapshot: {
              title: paymentAcc.title,
              payeeName: paymentAcc.payeeName,
              upiId: paymentAcc.upiId,
              qrCodeUrl: paymentAcc.qrCodeUrl,
            },
            status: "UNPAID",
          });
        }
      }
    } else if (statusRemark) {
      application.statusRemark = statusRemark;
    }

    await application.save();

    // Update student's user profile allotmentStatus
    await User.findByIdAndUpdate(application.studentId, {
      allotmentStatus: status,
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 });
  }
}
