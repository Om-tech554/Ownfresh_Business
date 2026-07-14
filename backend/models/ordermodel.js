import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" }, // Added to track variants
    name: String,
    variantName: String, // Added to store variant text (e.g. "1 Liter")
    price: Number,
    quantity: Number,
    image: String
  }],
  PaymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cancellation_requested'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    default: ""
  },
  trackingId: {
    type: String
  },
  courierPartner: {
    type: String
  },
  adminNotes: {
    type: String
  },
  deliveryAddress: {
    roomNumber: String,
    areaName: String,
    text: String,
    phone: String,
    latitude: Number,
    longitude: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  cgst: {
    type: Number,
    default: 0
  },
  sgst: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: ""
  },
  walletDeductedAmount: {
    type: Number,
    default: 0
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  referralCommission: {
    type: Number,
    default: 0
  },
  isReferralCounted: {
    type: Boolean,
    default: false
  },
  deletedByUser: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// FIX OverwriteModelError
export default mongoose.models.Order || mongoose.model("Order", orderSchema);
