import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentAccount extends Document {
  title: string; // e.g. "Hostel Main Account", "Mess Facility Account", "Caution Deposit Account"
  payeeName: string; // e.g. "ABC College Hostel Welfare Trust"
  upiId: string; // e.g. "hosteladmin@sbi"
  qrCodeUrl: string; // uploaded image or dynamic QR
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAccountSchema = new Schema<IPaymentAccount>(
  {
    title: { type: String, required: true, trim: true },
    payeeName: { type: String, required: true, trim: true },
    upiId: { type: String, required: true, trim: true },
    qrCodeUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PaymentAccount: Model<IPaymentAccount> =
  mongoose.models.PaymentAccount ||
  mongoose.model<IPaymentAccount>("PaymentAccount", PaymentAccountSchema);
export default PaymentAccount;
