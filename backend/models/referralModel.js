import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    referredUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }
}, { timestamps: true });

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
