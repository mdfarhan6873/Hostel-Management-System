import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaveRequest extends Document {
  studentId: mongoose.Types.ObjectId | string;
  studentName: string;
  studentRollNumber: string;
  roomNumber: string;
  hostelName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  handwrittenDocUrl: string; // uploaded scan of handwritten letter
  emergencyContact: string;

  status: "PENDING_PARENT_VERIFICATION" | "APPROVED" | "REJECTED";

  parentVerification?: {
    calledAt?: Date;
    parentPhoneCalled?: string;
    spokenWith?: string; // "Father", "Mother", "Guardian"
    consentConfirmed: boolean;
    adminNotes?: string;
    verifiedBy?: string;
  };

  adminDecisionRemark?: string;
  approvedAt?: Date;
  rejectedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentRollNumber: { type: String, required: true },
    roomNumber: { type: String, required: true },
    hostelName: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    handwrittenDocUrl: { type: String, required: true },
    emergencyContact: { type: String, required: true },

    status: {
      type: String,
      enum: ["PENDING_PARENT_VERIFICATION", "APPROVED", "REJECTED"],
      default: "PENDING_PARENT_VERIFICATION",
    },

    parentVerification: {
      calledAt: { type: Date },
      parentPhoneCalled: { type: String },
      spokenWith: { type: String },
      consentConfirmed: { type: Boolean, default: false },
      adminNotes: { type: String, default: "" },
      verifiedBy: { type: String },
    },

    adminDecisionRemark: { type: String, default: "" },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

export const LeaveRequest: Model<ILeaveRequest> =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
export default LeaveRequest;
