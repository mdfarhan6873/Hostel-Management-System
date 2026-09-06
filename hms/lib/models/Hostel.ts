import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBed {
  bedNumber: string; // "A", "B", "C"
  isOccupied: boolean;
  studentId?: mongoose.Types.ObjectId | string;
  studentName?: string;
  studentRollNumber?: string;
  allottedAt?: Date;
}

export interface IRoom {
  roomNumber: string; // e.g. "G01", "101", "102"
  capacityType: "SINGLE" | "DOUBLE" | "TRIPLE";
  totalBeds: number;
  beds: IBed[];
}

export interface IFloor {
  floorNumber: number; // 0 for Ground, 1 for 1st, 2 for 2nd
  floorName: string; // "Ground Floor (0-100)", "First Floor (101-200)"
  roomRange: string; // "0-100", "101-200"
  rooms: IRoom[];
}

export interface IBlock {
  name: string; // "Girls_Hostel_01", "Block A"
  floors: IFloor[];
}

export interface IHostel extends Document {
  name: string; // "Girls Hostel", "Boys Hostel"
  code: string; // "GH", "BH"
  gender: "FEMALE" | "MALE" | "COED";
  wardenName: string;
  wardenContact: string;
  blocks: IBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema = new Schema<IBed>({
  bedNumber: { type: String, required: true },
  isOccupied: { type: Boolean, default: false },
  studentId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  studentName: { type: String, default: "" },
  studentRollNumber: { type: String, default: "" },
  allottedAt: { type: Date, default: null },
});

const RoomSchema = new Schema<IRoom>({
  roomNumber: { type: String, required: true },
  capacityType: { type: String, enum: ["SINGLE", "DOUBLE", "TRIPLE"], required: true },
  totalBeds: { type: Number, required: true },
  beds: [BedSchema],
});

const FloorSchema = new Schema<IFloor>({
  floorNumber: { type: Number, required: true },
  floorName: { type: String, required: true },
  roomRange: { type: String, default: "" },
  rooms: [RoomSchema],
});

const BlockSchema = new Schema<IBlock>({
  name: { type: String, required: true },
  floors: [FloorSchema],
});

const HostelSchema = new Schema<IHostel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    gender: { type: String, enum: ["FEMALE", "MALE", "COED"], required: true },
    wardenName: { type: String, default: "" },
    wardenContact: { type: String, default: "" },
    blocks: [BlockSchema],
  },
  { timestamps: true }
);

export const Hostel: Model<IHostel> = mongoose.models.Hostel || mongoose.model<IHostel>("Hostel", HostelSchema);
export default Hostel;
