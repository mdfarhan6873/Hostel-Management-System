import mongoose, { Schema, Document, Model } from "mongoose";
import { IFloor } from "../types";

export interface IFloorDocument extends Omit<IFloor, "_id">, Document {}

const FloorSchema = new Schema<IFloorDocument>(
  {
    name: {
      type: String,
      required: [true, "Floor name is required"],
      trim: true,
    },
    floorNumber: {
      type: Number,
      required: [true, "Floor number is required"],
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: "Block",
      required: [true, "Block ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Floor: Model<IFloorDocument> =
  mongoose.models.Floor || mongoose.model<IFloorDocument>("Floor", FloorSchema);
