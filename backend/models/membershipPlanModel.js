import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    price: {
      type: Number,
      required: true
    },
    durationDays: {
      type: Number,
      default: 365
    },
    commissionRatePercentage: {
      type: Number,
      default: 1 // 1% commission coins on every transaction
    },
    description: {
      type: String,
      default: "Earn 1% Commission Credit Coins on every transaction. Coins reset in 45 days. Minimum 150 coins to redeem."
    },
    features: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

export default mongoose.models.MembershipPlan || mongoose.model("MembershipPlan", membershipPlanSchema);
