import mongoose from "mongoose";

const referralCodeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true
        }
    },
    { timestamps: true }
);

export default mongoose.models.ReferralCode || mongoose.model("ReferralCode", referralCodeSchema);
