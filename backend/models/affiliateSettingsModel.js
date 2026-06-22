import mongoose from "mongoose";

const affiliateSettingsSchema = new mongoose.Schema({
    tier1Threshold: { type: Number, default: 3 },
    tier1Reward: { type: Number, default: 50 }, // Wallet credit
    tier2Threshold: { type: Number, default: 6 },
    tier2Reward: { type: String, default: "affiliate_unlock" },
    tier3Threshold: { type: Number, default: 15 },
    tier3Commission: { type: Number, default: 15 }, // Percentage
    baseCommission: { type: Number, default: 10 }, // Percentage for Tier 2 affiliates
    referralDiscountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    referralDiscountValue: { type: Number, default: 10 }, // Discount for the referred user
    subscriptionPrice: { type: Number, default: 999 }, // Price to unlock affiliate status directly
}, { timestamps: true });

const AffiliateSettings = mongoose.model("AffiliateSettings", affiliateSettingsSchema);
export default AffiliateSettings;
