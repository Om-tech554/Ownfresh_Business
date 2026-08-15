import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // Not required for Google users
    },
    mobile: {
        type: String,
        unique: true, 
        sparse: true, // This allows multiple users to have NO mobile number
        default: undefined // Ensures it doesn't default to a shared null value
    },
    lastIpAddress: {
        type: String
    },
    lastDeviceFingerprint: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin", "blogger"],
        default: "user",
    },
    referralCode: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        sparse: true,
        index: true
    },
    wallet: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    referralPoints: {
        type: Number,
        default: 0
    },
    hasRedeemedReferral: {
        type: Boolean,
        default: false
    },
    subscriptionActive: {
        type: Boolean,
        default: false
    },
    // Membership & 1% Commission System fields
    isMember: {
        type: Boolean,
        default: false
    },
    membershipExpiresAt: {
        type: Date,
        default: null
    },
    membershipPlanName: {
        type: String,
        default: ""
    },
    commissionCoins: {
        type: Number,
        default: 0
    },
    resetOtp: {
        type: String,
    },
    isOtpVerified: {
        type: Boolean,
        default: false,
    },
    otpExpires: {
        type: Date
    },
    clientType: {
        type: String,
        enum: ["GST", "Non-GST"],
        default: "Non-GST"
    }
}, { timestamps: true });

userSchema.pre("save", function() {
    if (this.isModified("wallet")) {
        this.walletBalance = this.wallet;
    } else if (this.isModified("walletBalance")) {
        this.wallet = this.walletBalance;
    }
});

const User = mongoose.model("User", userSchema);
export default User;