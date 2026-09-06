import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBillItem {
  title: string;
  amount: number;
  category: "HOSTEL_RENT" | "MESS_FEE" | "SECURITY_DEPOSIT" | "FINE" | "MESS_REBATE" | "OTHER";
  isRefundable: boolean;
  remark?: string;
}

export interface IBill extends Document {
  billNumber: string;
  studentId: mongoose.Types.ObjectId | string;
  studentName: string;
  studentRollNumber: string;
  recipientType: "ELIGIBLE_APPLICANT" | "ALLOTTED_STUDENT";
  applicationId?: mongoose.Types.ObjectId | string;
  billType: "ADMISSION_CONFIRMATION" | "PERIODIC_HOSTEL_MESS" | "SECURITY_DEPOSIT" | "FINE" | "CUSTOM";
  frequency: "ONE_TIME" | "SIX_MONTHS" | "YEARLY" | "FINE" | "OTHER";
  items: IBillItem[];
  totalAmount: number;
  dueDate: Date;
  overallRemark?: string;

  // Mess Rebate for Leaves
  messRebateDetails?: {
    applied: boolean;
    leaveDaysCount: number;
    rebatePercentage: number;
    rebateAmount: number;
  };

  // Admin Assigned UPI QR
  paymentAccountId: mongoose.Types.ObjectId | string;
  paymentAccountSnapshot: {
    title: string;
    payeeName: string;
    upiId: string;
    qrCodeUrl: string;
  };

  // Payment Tracking
  status: "UNPAID" | "PENDING_VERIFICATION" | "PAID";
  paymentDetails?: {
    paidAt: Date;
    utrNumber: string;
    paymentMode: string;
    proofUrl?: string;
    verifiedAt?: Date;
    receiptNumber?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["HOSTEL_RENT", "MESS_FEE", "SECURITY_DEPOSIT", "FINE", "MESS_REBATE", "OTHER"],
    default: "OTHER",
  },
  isRefundable: { type: Boolean, default: false },
  remark: { type: String, default: "" },
});

const BillSchema = new Schema<IBill>(
  {
    billNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentRollNumber: { type: String, required: true },
    recipientType: {
      type: String,
      enum: ["ELIGIBLE_APPLICANT", "ALLOTTED_STUDENT"],
      required: true,
    },
    applicationId: { type: Schema.Types.ObjectId, ref: "HostelApplication" },
    billType: {
      type: String,
      enum: ["ADMISSION_CONFIRMATION", "PERIODIC_HOSTEL_MESS", "SECURITY_DEPOSIT", "FINE", "CUSTOM"],
      required: true,
    },
    frequency: {
      type: String,
      enum: ["ONE_TIME", "SIX_MONTHS", "YEARLY", "FINE", "OTHER"],
      default: "SIX_MONTHS",
    },
    items: [BillItemSchema],
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    overallRemark: { type: String, default: "" },

    messRebateDetails: {
      applied: { type: Boolean, default: false },
      leaveDaysCount: { type: Number, default: 0 },
      rebatePercentage: { type: Number, default: 70 },
      rebateAmount: { type: Number, default: 0 },
    },

    paymentAccountId: { type: Schema.Types.ObjectId, ref: "PaymentAccount", required: true },
    paymentAccountSnapshot: {
      title: { type: String, required: true },
      payeeName: { type: String, required: true },
      upiId: { type: String, required: true },
      qrCodeUrl: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["UNPAID", "PENDING_VERIFICATION", "PAID"],
      default: "UNPAID",
    },
    paymentDetails: {
      paidAt: { type: Date },
      utrNumber: { type: String },
      paymentMode: { type: String, default: "UPI" },
      proofUrl: { type: String, default: "" },
      verifiedAt: { type: Date },
      receiptNumber: { type: String },
    },
  },
  { timestamps: true }
);

export const Bill: Model<IBill> = mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);
export default Bill;
