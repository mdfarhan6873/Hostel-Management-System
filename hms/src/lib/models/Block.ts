import mongoose, { Schema, Document, Model } from "mongoose";
import { IBlock } from "../types";

export interface IBlockDocument extends Omit<IBlock, "_id">, Document {}

const BlockSchema = new Schema<IBlockDocument>(
  {
    name: {
      type: String,
      required: [true, "Block name is required"],
      trim: true,
    },
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: [true, "Hostel ID is required"],
    },
    wardenId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Block: Model<IBlockDocument> =
  mongoose.models.Block || mongoose.model<IBlockDocument>("Block", BlockSchema);
