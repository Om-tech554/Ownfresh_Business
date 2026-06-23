// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     fullName: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         // Password is not required for Google Auth users
//     },
//     mobile: {
//         type: String,
//         // Unique index remains, but we remove the complex required function 
//         // to prevent 400 errors during initial Google sign-in.
//         unique: true,
//         sparse: true, 
//     },
//     role: {
//         type: String,
//         enum: ["user", "admin"],
//         default: "user",
//     },
//     resetOtp: {
//         type: String,
//     },
//     isOtpVerified: {
//         type: Boolean,
//         default: false,
//     },
//     otpExpires: {
//         type: Date
//     }
// }, { timestamps: true });

// const User = mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
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
    role: {
        type: String,
        enum: ["user", "admin", "blogger"],
        default: "user",
    },
    // Referral and Affiliate fields
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    referralCount: {
        type: Number,
        default: 0
    },
    isAffiliate: {
        type: Boolean,
        default: false
    },
    commissionBalance: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    wallet: {
        type: Number,
        default: 0
    },
    subscriptionActive: {
        type: Boolean,
        default: false
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
    }
}, { timestamps: true });

// Pre-save hook to generate referral code
userSchema.pre('save', async function () {
    if (!this.referralCode) {
        // Generate a random 8-character code
        this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }
});

const User = mongoose.model("User", userSchema);
export default User;