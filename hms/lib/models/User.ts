import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  rollNumber?: string;
  registrationNumber?: string;
  password: string;
  role: "ADMIN" | "STUDENT" | "VIEWER";
  avatarUrl?: string;
  department?: string;
  semester?: number;
  batch?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  allotmentStatus?: "NOT_APPLIED" | "PENDING" | "ELIGIBLE" | "ALLOTTED" | "CANCELLED" | "REJECTED";
  roomNumber?: string;
  hostelName?: string;
  bedNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    registrationNumber: { type: String, trim: true, default: "" },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "STUDENT", "VIEWER"], default: "STUDENT" },
    avatarUrl: { type: String, default: "" },
    department: { type: String, default: "" },
    semester: { type: Number, default: 1 },
    batch: { type: String, default: "" },
    guardianPhone: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    allotmentStatus: {
      type: String,
      enum: ["NOT_APPLIED", "PENDING", "ELIGIBLE", "ALLOTTED", "CANCELLED", "REJECTED"],
      default: "NOT_APPLIED",
    },
    roomNumber: { type: String, default: "" },
    hostelName: { type: String, default: "" },
    bedNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
