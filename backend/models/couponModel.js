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
      enum: ["ALL_USERS", "NEW_USERS", "SELECTED_USERS", "SPECIAL_MEMBER"],
      default: "ALL_USERS"
    },
    isSpecialCoupon: {
      type: Boolean,
      default: false
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
    },
    requiresDeliveryCharge: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Pre-validate safeguard to sanitize any dirty/bracketed/stringified inputs in selectedUsersList
couponSchema.pre("validate", function () {
  // If special coupon or selected users, delivery charges are mandatory (transparent rate-card)
  if (
    this.applicableUsers === "SELECTED_USERS" || 
    this.applicableUsers === "SPECIAL_MEMBER" || 
    this.isSpecialCoupon === true ||
    (Array.isArray(this.selectedUsersList) && this.selectedUsersList.length > 0)
  ) {
    this.requiresDeliveryCharge = true;
  }

  // If special member coupon, automatically enforce single-use limit and mark isSpecialCoupon
  if (this.applicableUsers === "SPECIAL_MEMBER" || this.isSpecialCoupon === true) {
    this.isSpecialCoupon = true;
    if (!this.usageLimit || this.usageLimit < 1) {
      this.usageLimit = 1;
    }
    this.perUserLimit = 1;
  }

  if (this.selectedUsersList && Array.isArray(this.selectedUsersList)) {
    this.selectedUsersList = this.selectedUsersList
      .map(item => {
        if (!item) return null;
        if (typeof item === "string") {
          const cleaned = item.replace(/[\[\]'"`]/g, "").trim();
          if (mongoose.Types.ObjectId.isValid(cleaned) && cleaned.length === 24) {
            return new mongoose.Types.ObjectId(cleaned);
          }
          return null; // drop any uncastable raw strings so CastError is never thrown
        }
        return item;
      })
      .filter(Boolean);
  }
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
