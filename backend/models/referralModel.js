import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    referrerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    referredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    referralCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "EXPIRED"],
        default: "PENDING"
    },
    rewardAmount: {
        type: Number,
        default: 0
    },
    deviceFingerprint: {
        type: String
    },
    ipAddress: {
        type: String
    },
    completedAt: {
        type: Date
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }
}, { timestamps: true });

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
