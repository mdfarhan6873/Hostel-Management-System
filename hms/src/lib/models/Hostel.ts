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
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["boys", "girls", "coed"],
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

if (mongoose.models.Hostel && !mongoose.models.Hostel.schema.paths.code) {
  delete (mongoose.models as any).Hostel;
}

export const Hostel: Model<IHostelDocument> =
  mongoose.models.Hostel || mongoose.model<IHostelDocument>("Hostel", HostelSchema);
