import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  mainImageUrl: string; // Image principale
  additionalImages: string[]; // Images supplémentaires pour la galerie
  isCustomizable: boolean;
  isForSale: boolean; // Disponible à la vente
  isForRent: boolean; // Disponible à la location
  stockQuantity: number;
  dailyRentalPrice?: number;
  customizationOptions: {
    [key: string]: {
      type: 'dropdown' | 'checkbox' | 'text' | 'textarea';
      label: string;
      required: boolean;
      options?: string[]; // Pour les dropdowns et checkboxes
      placeholder?: string; // Pour les champs texte
      maxLength?: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['shop', 'rent', 'events', 'home', 'co']
  },
  subcategory: {
    type: String,
    trim: true
  },
  mainImageUrl: {
    type: String,
    required: true
  },
  additionalImages: [{
    type: String
  }],
  isCustomizable: {
    type: Boolean,
    default: false
  },
  isForSale: {
    type: Boolean,
    default: true
  },
  isForRent: {
    type: Boolean,
    default: false
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyRentalPrice: {
    type: Number,
    min: 0
  },
  customizationOptions: {
    type: Map,
    of: {
      type: {
        type: String,
        enum: ['dropdown', 'checkbox', 'text', 'textarea', 'name_engraving', 'image_upload'],
        required: true
      },
      label: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String], // Pour les dropdowns et checkboxes
      placeholder: String, // Pour les champs texte
      maxLength: Number,
      engravingType: {
        type: String,
        enum: ['text', 'image', 'both'],
        default: 'text'
      },
      engravingPosition: {
        type: String,
        enum: ['front', 'back', 'side', 'top', 'bottom'],
        default: 'front'
      },
      engravingStyle: {
        type: String,
        enum: ['simple', 'elegant', 'bold', 'script', 'decorative'],
        default: 'simple'
      }
    },
    default: {}
  }
}, {
  timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
