import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    festivalName: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    bannerImage: {
      type: String,
      required: true // Desktop Banner Cloudinary URL
    },
    mobileBannerImage: {
      type: String,
      default: "" // Mobile Banner Cloudinary URL
    },
    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Active", "Expired", "Disabled"],
      default: "Draft"
    },
    ctaText: {
      type: String,
      default: "Shop Now"
    },
    ctaUrl: {
      type: String,
      default: "/shop"
    },
    priority: {
      type: Number,
      default: 0
    },
    displayLocation: {
      type: String,
      default: "home_banner"
    },
    showCountdown: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

// Optional MongoDB Indexing
campaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
campaignSchema.index({ priority: -1 });

export default mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);
