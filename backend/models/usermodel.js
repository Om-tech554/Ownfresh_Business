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
    // Referral and Affiliate fields
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    hasChangedReferralCode: {
        type: Boolean,
        default: false
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
        let prefix = "OWN";
        if (this.fullName) {
            // Keep only alphanumeric characters
            const cleanName = this.fullName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            if (cleanName.length > 0) {
                prefix = cleanName.substring(0, 5); // Take first 5 characters
            }
        }
        
        let code = "";
        let isUnique = false;
        let attempts = 0;
        
        // Loop until unique code generated
        while (!isUnique && attempts < 10) {
            attempts++;
            const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            code = `${prefix}${suffix}`;
            
            // Check if user model exists in mongoose.models
            const User = mongoose.models.User || mongoose.model("User", userSchema);
            const existing = await User.findOne({ referralCode: code });
            if (!existing) {
                isUnique = true;
            }
        }
        this.referralCode = code;
    }
});

const User = mongoose.model("User", userSchema);
export default User;