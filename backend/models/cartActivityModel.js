import mongoose from "mongoose";

const cartActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ["add", "remove", "view", "begin_checkout", "purchase"],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
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

export default mongoose.models.CartActivity || mongoose.model("CartActivity", cartActivitySchema);
