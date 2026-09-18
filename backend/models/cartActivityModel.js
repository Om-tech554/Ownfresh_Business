import mongoose from "mongoose";

const cartActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ["add", "remove", "view", "begin_checkout", "purchase", "shipping_info"],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  userName: {
    type: String,
    trim: true,
    default: ""
  },
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ""
  },
  userPhone: {
    type: String,
    trim: true,
    default: ""
  },
  sessionId: {
    type: String,
    default: null
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },
  variantName: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  cartValue: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null
      },
      name: {
        type: String,
        default: ""
      },
      variantName: {
        type: String,
        default: ""
      },
      price: {
        type: Number,
        default: 0
      },
      quantity: {
        type: Number,
        default: 1
      },
      image: {
        type: String,
        default: ""
      }
    }
  ],
  customerDetails: {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" }
  },
  ipAddress: {
    type: String,
    default: ""
  },
  orderId: {
    type: String,
    default: null
  },
  isPurchased: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

cartActivitySchema.index({ createdAt: -1 });
cartActivitySchema.index({ action: 1, createdAt: -1 });
cartActivitySchema.index({ user: 1, isPurchased: 1 });
cartActivitySchema.index({ sessionId: 1 });
cartActivitySchema.index({ userEmail: 1 });

export default mongoose.models.CartActivity || mongoose.model("CartActivity", cartActivitySchema);
