import mongoose, { Schema, Document, Model } from "mongoose";
import { IStudent } from "../types";

export interface IStudentDocument extends Omit<IStudent, "_id">, Document {}

const StudentSchema = new Schema<IStudentDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    completeAddress: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },

    // Academic Details
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    session: {
      type: String,
      required: [true, "Session is required"],
      trim: true,
    },
    registrationNo: {
      type: String,
      trim: true,
    },

    // Hostel & Document Details
    messCardNo: {
      type: String,
      trim: true,
    },
    documentLinks: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    // Parents Details
    parents: {
      fatherName: { type: String, required: [true, "Father name is required"], trim: true },
      motherName: { type: String, required: [true, "Mother name is required"], trim: true },
      parentMobile: { type: String, required: [true, "Parent mobile is required"], trim: true },
    },

    // Status: WAITING, ALLOTTED, CANCELLED
    status: {
      type: String,
      enum: ["WAITING", "ALLOTTED", "CANCELLED"],
      default: "WAITING",
      required: true,
    },

    // Allocated Infrastructure Details
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel" },
    blockId: { type: Schema.Types.ObjectId, ref: "Block" },
    floorId: { type: Schema.Types.ObjectId, ref: "Floor" },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" },
    furnitureGroupName: { type: String, trim: true },
    assignedBedId: { type: String, trim: true },
    assignedTableId: { type: String, trim: true },
    assignedChairId: { type: String, trim: true },

    // Eviction / Removal Details
    evictionRemark: { type: String, trim: true },
    evictionNoticeLink: { type: String, trim: true },
    evictedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Student: Model<IStudentDocument> =
  mongoose.models.Student || mongoose.model<IStudentDocument>("Student", StudentSchema);
