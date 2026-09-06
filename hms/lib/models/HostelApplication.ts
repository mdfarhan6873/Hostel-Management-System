import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHostelApplication extends Document {
  studentId: mongoose.Types.ObjectId | string;
  windowId: mongoose.Types.ObjectId | string;
  hostelId: mongoose.Types.ObjectId | string;
  hostelName: string;

  // Personal Information
  name: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  passwordHint?: string;
  parentPhone: string;
  address: string;
  aadhaarNumber: string;
  aadhaarFileUrl: string;
  photoUrl: string;

  // Academic Information
  rollNumber: string;
  registrationNumber?: string;
  branch: string;
  session: string;
  semester: number;
  lastExamType: "12TH" | "SEMESTER";
  twelfthBoardName?: string;
  twelfthPercentage?: number;
  semesterSgpaList?: string;
  currentCgpa?: number;

  // Health
  bloodGroup?: string;
  medicalRemark?: string;

  // Status Lifecycle
  status: "PENDING" | "ELIGIBLE" | "ALLOTTED" | "CANCELLED" | "REJECTED";
  statusRemark?: string;

  // Allotment Details
  allotmentDetails?: {
    hostelName: string;
    blockName: string;
    floorNumber: number;
    roomNumber: string;
    bedNumber: string;
    allottedAt: Date;
  };

  // Eviction / Cancellation Details
  cancellationDetails?: {
    remark: string;
    noticeUrl: string;
    cancelledAt: Date;
    issuedBy?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const HostelApplicationSchema = new Schema<IHostelApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    windowId: { type: Schema.Types.ObjectId, ref: "ApplicationWindow", required: true },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    hostelName: { type: String, required: true },

    name: { type: String, required: true },
    dob: { type: String, default: "" },
    age: { type: Number, default: 18 },
    gender: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    passwordHint: { type: String, default: "" },
    parentPhone: { type: String, required: true },
    address: { type: String, required: true },
    aadhaarNumber: { type: String, required: true },
    aadhaarFileUrl: { type: String, default: "" },
    photoUrl: { type: String, default: "" },

    rollNumber: { type: String, required: true },
    registrationNumber: { type: String, default: "" },
    branch: { type: String, required: true },
    session: { type: String, required: true },
    semester: { type: Number, required: true },
    lastExamType: { type: String, enum: ["12TH", "SEMESTER"], required: true },
    twelfthBoardName: { type: String, default: "" },
    twelfthPercentage: { type: Number, default: 0 },
    semesterSgpaList: { type: String, default: "" },
    currentCgpa: { type: Number, default: 0 },

    bloodGroup: { type: String, default: "" },
    medicalRemark: { type: String, default: "" },

    status: {
      type: String,
      enum: ["PENDING", "ELIGIBLE", "ALLOTTED", "CANCELLED", "REJECTED"],
      default: "PENDING",
    },
    statusRemark: { type: String, default: "" },

    allotmentDetails: {
      hostelName: { type: String },
      blockName: { type: String },
      floorNumber: { type: Number },
      roomNumber: { type: String },
      bedNumber: { type: String },
      allottedAt: { type: Date },
    },

    cancellationDetails: {
      remark: { type: String },
      noticeUrl: { type: String },
      cancelledAt: { type: Date },
      issuedBy: { type: String },
    },
  },
  { timestamps: true }
);

export const HostelApplication: Model<IHostelApplication> =
  mongoose.models.HostelApplication ||
  mongoose.model<IHostelApplication>("HostelApplication", HostelApplicationSchema);
export default HostelApplication;
