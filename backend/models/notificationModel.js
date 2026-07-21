import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: false,
            index: true
        },
        type: {
            type: String,
            enum: ["REFERRAL_USED", "REFERRAL_APPROVED", "REFERRAL_REJECTED", "WALLET_CREDITED", "SYSTEM"],
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
