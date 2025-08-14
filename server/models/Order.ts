import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: string;
  orderType: string;
  eventDate?: Date;
  notes?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: String,
  customerEmail: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: String,
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  orderType: { type: String, required: true },
  eventDate: Date,
  notes: String,
  stripePaymentIntentId: String,
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
