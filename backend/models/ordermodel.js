import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  PaymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true
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
    latitude: Number,
    longitude: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: ""
  },
  deletedByUser: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// FIX OverwriteModelError
export default mongoose.models.Order || mongoose.model("Order", orderSchema);
