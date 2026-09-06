import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId | string;
  studentName: string;
  studentRollNumber: string;
  hostelName: string;
  roomNumber: string;
  date: string; // YYYY-MM-DD
  markedAt?: Date;
  selfieUrl?: string;
  status: "PRESENT" | "LEAVE" | "MISSED" | "EXCUSED";
  timeWindow: string; // "19:00 - 20:00"

  disciplinaryAction?: {
    actionType: "NONE" | "WARNING" | "FINE" | "EVICTION";
    billId?: mongoose.Types.ObjectId | string;
    warningNotice?: string;
    evictionOrderUrl?: string;
    adminRemark?: string;
    resolvedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentRollNumber: { type: String, required: true },
    hostelName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    markedAt: { type: Date },
    selfieUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PRESENT", "LEAVE", "MISSED", "EXCUSED"],
      default: "MISSED",
    },
    timeWindow: { type: String, default: "19:00 - 20:00" },

    disciplinaryAction: {
      actionType: {
        type: String,
        enum: ["NONE", "WARNING", "FINE", "EVICTION"],
        default: "NONE",
      },
      billId: { type: Schema.Types.ObjectId, ref: "Bill" },
      warningNotice: { type: String, default: "" },
      evictionOrderUrl: { type: String, default: "" },
      adminRemark: { type: String, default: "" },
      resolvedAt: { type: Date },
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;
