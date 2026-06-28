import mongoose from "mongoose";

const referralSettingsSchema = new mongoose.Schema(
  {
    referralRewardReferrer: {
      type: Number,
      default: 100
    },
    referralRewardReferred: {
      type: Number,
      default: 50
    },
    tier1Threshold: {
      type: Number,
      default: 3
    },
    tier1Reward: {
      type: Number,
      default: 50
    },
    tier2Threshold: {
      type: Number,
      default: 6
    },
    tier3Threshold: {
      type: Number,
      default: 15
    },
    baseCommission: {
      type: Number,
      default: 10
    },
    tier3Commission: {
      type: Number,
      default: 15
    },
    subscriptionPrice: {
      type: Number,
      default: 999
    }
  },
  { timestamps: true }
);

const ReferralSettings = mongoose.model("ReferralSettings", referralSettingsSchema);
export default ReferralSettings;
