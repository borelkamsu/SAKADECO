import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: 'shop' | 'events' | 'rent' | 'crea' | 'home' | 'co';
  subcategory: string;
  imageUrl: string;
  isCustomizable: boolean;
  isRentable: boolean;
  stockQuantity: number;
  dailyRentalPrice?: number;
  customizationOptions: {
    sizes?: string[];
    colors?: string[];
    shapes?: string[];
    materials?: string[];
    themes?: string[];
    text?: boolean;
    message?: boolean;
    arrangements?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['shop', 'events', 'rent', 'crea', 'home', 'co']
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  isCustomizable: {
    type: Boolean,
    default: false
  },
  isRentable: {
    type: Boolean,
    default: false
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  dailyRentalPrice: {
    type: Number,
    min: 0
  },
  customizationOptions: {
    sizes: [String],
    colors: [String],
    shapes: [String],
    materials: [String],
    themes: [String],
    text: Boolean,
    message: Boolean,
    arrangements: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
