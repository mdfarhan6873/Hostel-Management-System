import mongoose, { Schema, Document, Model } from "mongoose";
import { IRoom } from "../types";

export interface IRoomDocument extends Omit<IRoom, "_id">, Document {}

const FurnitureGroupSchema = new Schema(
  {
    groupName: { type: String, required: true }, // e.g. "Group A", "Group B"
    bedId: { type: String, trim: true },
    tableId: { type: String, trim: true },
    chairId: { type: String, trim: true },
    isOccupied: { type: Boolean, default: false },
    occupiedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    occupiedStudentName: { type: String, trim: true },
    occupiedStudentRoll: { type: String, trim: true },
    occupiedStudentBranch: { type: String, trim: true },
    occupiedStudentSession: { type: String, trim: true },
  },
  { _id: true }
);

const RoomSchema = new Schema<IRoomDocument>(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    floorId: {
      type: Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: "Block",
      required: true,
    },
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, "Room capacity is required"],
      min: 1,
      max: 6,
      default: 2,
    },
    roomType: {
      type: String,
      enum: ["Single", "Double", "Triple"],
      default: "Double",
    },
    furnitureGroups: [FurnitureGroupSchema],
  },
  {
    timestamps: true,
  }
);

export const Room: Model<IRoomDocument> =
  mongoose.models.Room || mongoose.model<IRoomDocument>("Room", RoomSchema);
