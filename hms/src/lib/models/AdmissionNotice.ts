import mongoose, { Schema, Document, Model } from "mongoose";
import { IAdmissionNotice } from "../types";

export interface IAdmissionNoticeDocument extends Omit<IAdmissionNotice, "_id">, Document {}

const AdmissionNoticeSchema = new Schema<IAdmissionNoticeDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["ADMISSION", "CIRCULAR", "BLUEPRINT", "REBATE"],
      default: "CIRCULAR",
    },
    refNumber: {
      type: String,
      required: [true, "Ref number is required"],
      trim: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    pdfLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AdmissionNotice: Model<IAdmissionNoticeDocument> =
  mongoose.models.AdmissionNotice ||
  mongoose.model<IAdmissionNoticeDocument>("AdmissionNotice", AdmissionNoticeSchema);
