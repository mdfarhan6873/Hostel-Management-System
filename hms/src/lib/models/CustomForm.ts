/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import mongoose, { Schema, Document, Model } from "mongoose";
import { ICustomForm, ICustomFormField } from "../types";

export interface ICustomFormDocument extends Omit<ICustomForm, "_id">, Document {}

const CustomFormFieldSchema = new Schema<ICustomFormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    fieldType: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "checkbox",
        "select",
        "radio",
        "date",
        "datetime",
        "file",
        "email",
        "phone",
      ],
      required: true,
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    helpText: { type: String, default: "" },
    options: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomFormSchema = new Schema<ICustomFormDocument>(
  {
    title: {
      type: String,
      required: [true, "Form title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    formType: {
      type: String,
      enum: ["ADMISSION", "REALLOCATION", "MAINTENANCE", "NOTICE", "GENERAL"],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date and time is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date and time is required"],
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "ENROLLED_STUDENTS", "ALLOTTED_STUDENTS"],
      default: "PUBLIC",
      index: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
    hostelCategory: {
      type: String,
      default: "",
      trim: true,
    },
    fields: {
      type: [CustomFormFieldSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomForm: Model<ICustomFormDocument> =
  mongoose.models.CustomForm ||
  mongoose.model<ICustomFormDocument>("CustomForm", CustomFormSchema);
