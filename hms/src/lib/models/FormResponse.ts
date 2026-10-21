/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import mongoose, { Schema, Document, Model } from "mongoose";
import { IFormResponse, IFormResponseItem } from "../types";

export interface IFormResponseDocument extends Omit<IFormResponse, "_id">, Document {}

const FormResponseItemSchema = new Schema<IFormResponseItem>(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    fieldType: { type: String, default: "text" },
  },
  { _id: false }
);

const FormResponseSchema = new Schema<IFormResponseDocument>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "CustomForm",
      required: true,
      index: true,
    },
    formTitle: {
      type: String,
      required: true,
      trim: true,
    },
    formType: {
      type: String,
      enum: ["ADMISSION", "REALLOCATION", "MAINTENANCE", "NOTICE", "GENERAL"],
      required: true,
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
    applicantInfo: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      rollNo: { type: String, default: "", trim: true },
      branch: { type: String, default: "", trim: true },
      session: { type: String, default: "", trim: true },
    },
    responses: {
      type: [FormResponseItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    wardenNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const FormResponse: Model<IFormResponseDocument> =
  mongoose.models.FormResponse ||
  mongoose.model<IFormResponseDocument>("FormResponse", FormResponseSchema);
