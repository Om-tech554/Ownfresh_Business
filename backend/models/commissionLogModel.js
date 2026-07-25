import mongoose from "mongoose";

const commissionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    orderTotal: {
      type: Number,
      default: 0
    },
    coinsEarned: {
      type: Number,
      required: true
    },
    coinsRemaining: {
      type: Number,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "REDEEMED", "MEMBERSHIP_PURCHASE"],
      default: "ACTIVE"
    },
    type: {
      type: String,
      enum: ["EARNED_ORDER_COMMISSION", "REDEEMED_CHECKOUT", "RESET_EXPIRED", "PLAN_PURCHASE"],
      default: "EARNED_ORDER_COMMISSION"
    },
    note: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.models.CommissionLog || mongoose.model("CommissionLog", commissionLogSchema);
