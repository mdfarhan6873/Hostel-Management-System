import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplicationWindow extends Document {
  title: string;
  hostelId: mongoose.Types.ObjectId | string;
  hostelName: string;
  blockName?: string;
  startDate: Date;
  endDate: Date;
  targetRemark: string; // "Open for 1st Year B.Tech 2026 Batch"
  feeStructureUrl: string;
  rulesRegulationsUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationWindowSchema = new Schema<IApplicationWindow>(
  {
    title: { type: String, required: true, trim: true },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    hostelName: { type: String, required: true },
    blockName: { type: String, default: "All Blocks" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    targetRemark: { type: String, required: true, trim: true },
    feeStructureUrl: { type: String, default: "/docs/sample-fee-structure.pdf" },
    rulesRegulationsUrl: { type: String, default: "/docs/hostel-rules-regulations.pdf" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ApplicationWindow: Model<IApplicationWindow> =
  mongoose.models.ApplicationWindow ||
  mongoose.model<IApplicationWindow>("ApplicationWindow", ApplicationWindowSchema);
export default ApplicationWindow;
