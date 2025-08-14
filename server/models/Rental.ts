import mongoose, { Schema, Document } from 'mongoose';

export interface IRental extends Document {
  productId: string;
  orderId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
}

const RentalSchema = new Schema<IRental>({
  productId: { type: String, required: true },
  orderId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'active' },
}, { timestamps: true });

export const Rental = mongoose.model<IRental>('Rental', RentalSchema);
