import mongoose from "mongoose";

const referralUsageSchema = new mongoose.Schema(
    {
        referralCode: {
            type: String,
            required: true,
            index: true
        },
        referrerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        referralCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReferralCode",
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true, // Ensuring an order can only receive referral benefits once
            index: true
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
            index: true
        },
        rewardAmount: {
            type: Number,
            required: true,
            default: 100 // Default points for the referrer
        },
        rewardPoints: {
            type: Number,
            default: 100
        },
        refereeRewardAmount: {
            type: Number,
            required: true,
            default: 50 // Default points for the referee (referred friend)
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        approvedAt: {
            type: Date
        },
        rejectedAt: {
            type: Date
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

referralUsageSchema.pre("save", function() {
    if (this.referrerUserId && !this.referrerId) {
        this.referrerId = this.referrerUserId;
    } else if (this.referrerId && !this.referrerUserId) {
        this.referrerUserId = this.referrerId;
    }

    if (this.rewardAmount !== undefined && this.rewardPoints === undefined) {
        this.rewardPoints = this.rewardAmount;
    } else if (this.rewardPoints !== undefined && this.rewardAmount === undefined) {
        this.rewardAmount = this.rewardPoints;
    }

    if (this.adminId && !this.approvedBy) {
        this.approvedBy = this.adminId;
    } else if (this.approvedBy && !this.adminId) {
        this.adminId = this.approvedBy;
    }
});

export default mongoose.models.ReferralUsage || mongoose.model("ReferralUsage", referralUsageSchema);
