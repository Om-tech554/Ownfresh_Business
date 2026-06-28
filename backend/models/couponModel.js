import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    discountType: {
      type: String,
      enum: ["FIXED_AMOUNT", "PERCENTAGE"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    minimumOrderAmount: {
      type: Number,
      default: 0
    },
    maximumDiscountAmount: {
      type: Number,
      default: null // null means no cap on percentage discount
    },
    usageLimit: {
      type: Number,
      default: null // null means unlimited total usage
    },
    usedCount: {
      type: Number,
      default: 0
    },
    perUserLimit: {
      type: Number,
      default: 1
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applicableUsers: {
      type: String,
      enum: ["ALL_USERS", "NEW_USERS", "SELECTED_USERS"],
      default: "ALL_USERS"
    },
    selectedUsersList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
