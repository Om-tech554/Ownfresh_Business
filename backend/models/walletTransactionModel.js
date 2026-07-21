import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
    {
        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["REFERRAL_BONUS", "PROMO_REWARD", "CASHBACK", "REDEEM", "REFUND", "ADJUSTMENT"],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        referenceOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        referralCode: {
            type: String
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { timestamps: true }
);

// Immunitability helper (pre-save to prevent updates on existing transactions)
walletTransactionSchema.pre("save", function (next) {
    if (!this.isNew) {
        return next(new Error("Wallet transactions are immutable and cannot be updated."));
    }
    next();
});

export default mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", walletTransactionSchema);
