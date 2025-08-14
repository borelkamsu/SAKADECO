import mongoose, { Schema, Document } from 'mongoose';

// User Model
export interface IUser extends Document {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  role: { type: String, default: 'user' },
}, { timestamps: true });

// Product Model
export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  isCustomizable: boolean;
  isRentable: boolean;
  stockQuantity: number;
  dailyRentalPrice?: number;
  customizationOptions?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: String,
  imageUrl: String,
  isCustomizable: { type: Boolean, default: false },
  isRentable: { type: Boolean, default: false },
  stockQuantity: { type: Number, default: 0 },
  dailyRentalPrice: Number,
  customizationOptions: Schema.Types.Mixed,
}, { timestamps: true });

// Order Model
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

// Order Item Model
export interface IOrderItem extends Document {
  orderId: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  customization?: any;
  rentalStartDate?: Date;
  rentalEndDate?: Date;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  orderId: { type: String, required: true },
  productId: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  customization: Schema.Types.Mixed,
  rentalStartDate: Date,
  rentalEndDate: Date,
}, { timestamps: true });

// Rental Model
export interface IRental extends Document {
  productId?: string;
  orderId?: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
}

const RentalSchema = new Schema<IRental>({
  productId: String,
  orderId: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'active' },
}, { timestamps: true });

// Quote Model
export interface IQuote extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: string;
  description: string;
  eventDate?: Date;
  estimatedPrice?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  service: { type: String, required: true },
  description: { type: String, required: true },
  eventDate: Date,
  estimatedPrice: Number,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

// Newsletter Subscription Model
export interface INewsletterSubscription extends Document {
  email: string;
  isActive: boolean;
  createdAt: Date;
}

const NewsletterSubscriptionSchema = new Schema<INewsletterSubscription>({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Review Model
export interface IReview extends Document {
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  service: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  service: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Gallery Item Model
export interface IGalleryItem extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>({
  title: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Session Model for Express Session
export interface ISession extends Document {
  sid: string;
  sess: any;
  expire: Date;
}

const SessionSchema = new Schema<ISession>({
  sid: { type: String, required: true, unique: true },
  sess: { type: Schema.Types.Mixed, required: true },
  expire: { type: Date, required: true },
});

// Create and export models
export const User = mongoose.model<IUser>('User', UserSchema);
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);
export const Rental = mongoose.model<IRental>('Rental', RentalSchema);
export const Quote = mongoose.model<IQuote>('Quote', QuoteSchema);
export const NewsletterSubscription = mongoose.model<INewsletterSubscription>('NewsletterSubscription', NewsletterSubscriptionSchema);
export const Review = mongoose.model<IReview>('Review', ReviewSchema);
export const GalleryItem = mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);
export const Session = mongoose.model<ISession>('Session', SessionSchema);

