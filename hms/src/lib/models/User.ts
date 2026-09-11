import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "../types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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
      required: [true, "Mobile number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["superadmin", "warden", "viewer"],
      required: [true, "Role is required"],
      default: "warden",
    },
    assignedCategory: {
      type: String,
      trim: true,
      // e.g. "Boys Hostel Category" or "Girls Hostel Category"
    },
    designation: {
      type: String,
      trim: true,
      default: "Faculty / Administrative Officer",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
