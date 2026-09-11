import mongoose, { Schema, Document, Model } from "mongoose";
import { IBill } from "../types";

export interface IBillDocument extends Omit<IBill, "_id">, Document {}

const BillSchema = new Schema<IBillDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    wardenId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Warden ID is required"],
    },
    title: {
      type: String,
      required: [true, "Bill title is required"],
      trim: true,
    },
    billType: {
      type: String,
      enum: ["mess", "rent", "maintenance", "fine"],
      default: "mess",
      required: true,
    },
    billingPeriod: {
      type: String,
      required: [true, "Billing period is required"],
      trim: true,
      // e.g. "August 2026" or "Jan-July 2026"
    },
    baseAmount: {
      type: Number,
      required: [true, "Base amount is required"],
    },
    leaveDaysRebate: {
      type: Number,
      default: 0,
    },
    rebateAmount: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: [true, "Net amount is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
    paidAt: {
      type: Date,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "Online UPI / Net Banking",
    },
  },
  {
    timestamps: true,
  }
);

export const Bill: Model<IBillDocument> =
  mongoose.models.Bill || mongoose.model<IBillDocument>("Bill", BillSchema);
