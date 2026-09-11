import mongoose, { Schema, Document, Model } from "mongoose";
import { ILeaveRequest } from "../types";

export interface ILeaveRequestDocument extends Omit<ILeaveRequest, "_id">, Document {}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    daysCount: {
      type: Number,
      required: [true, "Days count is required"],
      min: 1,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    handwrittenApplicationUrl: {
      type: String,
      trim: true,
      // URL or upload link for the student's handwritten application
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest: Model<ILeaveRequestDocument> =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequestDocument>("LeaveRequest", LeaveRequestSchema);
