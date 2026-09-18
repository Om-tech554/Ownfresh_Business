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
      default: 90 // 3 months validity
    },
    commissionRatePercentage: {
      type: Number,
      default: 1 // 1% commission coins on every transaction
    },
    description: {
      type: String,
      default: "Get an exclusive 10% instant discount on MRP on all cold-pressed oils and earn 1% Commission Credit Coins on every transaction. Valid for 3 months (90 days)."
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
