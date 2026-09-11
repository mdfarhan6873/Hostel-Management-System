import mongoose, { Schema, Document, Model } from "mongoose";
import { IHostel } from "../types";

export interface IHostelDocument extends Omit<IHostel, "_id">, Document {}

const HostelSchema = new Schema<IHostelDocument>(
  {
    name: {
      type: String,
      required: [true, "Hostel name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["boys", "girls"],
      required: [true, "Hostel type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Hostel: Model<IHostelDocument> =
  mongoose.models.Hostel || mongoose.model<IHostelDocument>("Hostel", HostelSchema);
