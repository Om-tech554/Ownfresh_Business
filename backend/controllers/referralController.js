import User from "../models/usermodel.js";
import Referral from "../models/referralModel.js";
import ReferralSettings from "../models/referralSettingsModel.js";
import Coupon from "../models/couponModel.js";
import Order from "../models/ordermodel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";

// Fetch settings helper
const getSettings = async () => {
    let settings = await ReferralSettings.findOne();
    if (!settings) {
        settings = await ReferralSettings.create({
            referralRewardReferrer: 100,
            referralRewardReferred: 50,
            tier1Threshold: 3,
            tier1Reward: 50,
            tier2Threshold: 6,
            tier3Threshold: 15,
            baseCommission: 10,
            tier3Commission: 15,
            subscriptionPrice: 999
        });
    }
    return settings;
};

// Get referral stats for the logged-in user
export const getReferralStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const settings = await getSettings();

        // Populate referrals list
        const referrals = await Referral.find({ referrerUserId: user._id })
            .populate("referredUserId", "fullName createdAt")
            .sort({ createdAt: -1 }) || [];

        const successfulCount = await Referral.countDocuments({ referrerUserId: user._id, status: "SUCCESS" }) || 0;
        const pendingCount = await Referral.countDocuments({ referrerUserId: user._id, status: "PENDING" }) || 0;

        // Fetch wallet details
        let wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            wallet = await Wallet.create({ userId: user._id, balance: 0, totalEarned: 0, totalRedeemed: 0 });
        }

        // Determine current milestone tier dynamically
        let currentTier = 0;
        if (successfulCount >= settings.tier3Threshold) currentTier = 3;
        else if (successfulCount >= settings.tier2Threshold || user.subscriptionActive) currentTier = 2;
        else if (successfulCount >= settings.tier1Threshold) currentTier = 1;

        // Ensure user affiliate status is kept in sync
        const isAffiliate = user.isAffiliate || currentTier >= 2 || user.subscriptionActive;
        if (isAffiliate !== user.isAffiliate) {
            user.isAffiliate = isAffiliate;
            await user.save();
        }

        // Calculate rewards earned (sum of successful referrals + milstone rewards)
        // Look up REFERRAL_BONUS transactions in transaction log
        const bonusTx = await Transaction.find({ userId: user._id, type: "REFERRAL_BONUS" });
        const rewardsEarned = bonusTx.reduce((sum, tx) => sum + tx.amount, 0);

        res.status(200).json({
            success: true,
            referralCode: user.referralCode,
            hasChangedReferralCode: user.hasChangedReferralCode,
            referredBy: user.referredBy,
            referralCount: successfulCount,
            totalReferrals: referrals.length,
            successful: successfulCount,
            pending: pendingCount,
            referrals,
            currentTier,
            isAffiliate,
            earnings: user.commissionBalance || wallet.balance, // compatible field mappings
            totalEarnings: user.totalEarnings || wallet.totalEarned,
            walletBalance: wallet.balance,
            rewardsEarned,
            settings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching referral stats" });
    }
};

// Apply a referral code to the user after signup (but before first purchase)
export const applyReferral = async (req, res) => {
    try {
        const { referralCode } = req.body;
        if (!referralCode) {
            return res.status(400).json({ message: "Referral code is required" });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if already referred
        if (user.referredBy) {
            return res.status(400).json({ message: "You have already been referred by someone" });
        }

        // Check if user has already placed orders
        const ordersCount = await Order.countDocuments({ user: user._id });
        if (ordersCount > 0) {
            return res.status(400).json({ message: "Referral code can only be applied before placing your first order" });
        }

        // Check if trying to apply own code
        if (user.referralCode && user.referralCode.toUpperCase() === referralCode.toUpperCase()) {
            return res.status(400).json({ message: "You cannot use your own referral code" });
        }

        // Find referrer
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrer) {
            return res.status(404).json({ message: "Invalid referral code" });
        }

        // Check same IP / same device fingerprint checks for abuse
        const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
        const deviceFingerprint = req.body.deviceFingerprint || req.headers['user-agent'];

        // Associate referrer
        user.referredBy = referrer._id;
        await user.save();

        const settings = await getSettings();

        // Create pending referral record
        const referral = await Referral.create({
            referrerUserId: referrer._id,
            referredUserId: user._id,
            referralCode: referralCode.toUpperCase(),
            status: "PENDING",
            rewardAmount: settings.referralRewardReferred,
            deviceFingerprint,
            ipAddress
        });

        res.status(200).json({
            success: true,
            message: "Referral code applied successfully",
            referral
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error applying referral code" });
    }
};

// Change own referral code once
export const updateCustomReferralCode = async (req, res) => {
    try {
        const { customCode } = req.body;
        if (!customCode || customCode.trim().length < 3) {
            return res.status(400).json({ message: "Please provide a valid custom code (min 3 characters)" });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.hasChangedReferralCode) {
            return res.status(400).json({ message: "You can only customize your referral code once" });
        }

        const formattedCode = customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (formattedCode.length < 3) {
            return res.status(400).json({ message: "Code must contain alphanumeric characters only" });
        }

        // Check uniqueness
        const existing = await User.findOne({ referralCode: formattedCode });
        if (existing) {
            return res.status(400).json({ message: "Referral code already taken" });
        }

        user.referralCode = formattedCode;
        user.hasChangedReferralCode = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Referral code updated successfully",
            referralCode: user.referralCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating referral code" });
    }
};

// Generate affiliate coupon code
export const generateAffiliateCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const settings = await getSettings();

        // Check eligibility: user must be affiliate (Tier 2, subscription, or explicit)
        const successfulCount = await Referral.countDocuments({ referrerUserId: user._id, status: "SUCCESS" });
        const isEligible = user.isAffiliate || successfulCount >= settings.tier2Threshold || user.subscriptionActive;
        
        if (!isEligible) {
            return res.status(403).json({ message: "You must reach Tier 2 (Affiliate) to create custom coupons." });
        }

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists." });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType: discountType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
            discountValue: Number(discountValue),
            expiryDate: new Date(expiryDate),
            affiliateId: user._id
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating custom coupon" });
    }
};

// Get affiliate earnings and conversions
export const getAffiliateData = async (req, res) => {
    try {
        const coupons = await Coupon.find({ affiliateId: req.userId });
        const couponCodes = coupons.map(c => c.code);

        const orders = await Order.find({ couponCode: { $in: couponCodes }, status: "delivered" })
            .populate("user", "fullName email")
            .sort({ createdAt: -1 });

        // Retrieve wallet details
        let wallet = await Wallet.findOne({ userId: req.userId });

        res.status(200).json({
            success: true,
            coupons,
            orders,
            totalConversions: orders.length,
            totalEarnings: wallet ? wallet.totalEarned : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching affiliate data" });
    }
};

// Admin: Get all referral/affiliate data
export const adminGetAffiliateStats = async (req, res) => {
    try {
        const users = await User.find({ $or: [{ referralCount: { $gt: 0 } }, { isAffiliate: true }] })
            .select("fullName email referralCode referralCount isAffiliate commissionBalance totalEarnings");

        const settings = await getSettings();

        // Get total stats
        const totalReferrals = await Referral.countDocuments({});
        const successfulReferrals = await Referral.countDocuments({ status: "SUCCESS" });
        const failedReferrals = await Referral.countDocuments({ status: "FAILED" });
        
        // Sum distributed rewards
        const referralRewards = await Transaction.find({ type: "REFERRAL_BONUS" });
        const rewardsDistributed = referralRewards.reduce((sum, tx) => sum + tx.amount, 0);

        res.status(200).json({ 
            success: true, 
            users, 
            settings,
            stats: {
                total: totalReferrals,
                successful: successfulReferrals,
                failed: failedReferrals,
                rewardsDistributed
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching admin stats" });
    }
};

// Admin: Update settings
export const updateAffiliateSettings = async (req, res) => {
    try {
        const settings = await ReferralSettings.findOneAndUpdate({}, req.body, { upsert: true, new: true });
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating settings" });
    }
};

// Handle Subscription to unlock Affiliate
export const unlockAffiliateViaSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.subscriptionActive = true;
        user.isAffiliate = true;
        await user.save();

        res.status(200).json({ success: true, message: "Affiliate status unlocked successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error unlocking affiliate status" });
    }
};

// Helper: Process Referral Reward on Order Delivery
export const processReferralRewards = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate("user");
        if (!order || order.status !== "delivered" || order.isReferralCounted) return;

        const user = order.user;
        const settings = await getSettings();

        // 1. Process Referral (only for the first purchase)
        // Verify this is the user's first delivered order
        const deliveredOrders = await Order.countDocuments({ user: user._id, status: "delivered" });
        
        // Ensure this is the first delivered order
        if (deliveredOrders === 1) {
            const referral = await Referral.findOne({ referredUserId: user._id, status: "PENDING" });
            if (referral) {
                const referrer = await User.findById(referral.referrerUserId);
                
                // Anti-Abuse Checks:
                const isSelfReferral = referrer && referrer._id.toString() === user._id.toString();
                const isSameDevice = referrer && (
                    referral.deviceFingerprint === referrer.lastDeviceFingerprint || 
                    referral.ipAddress === referrer.lastIpAddress
                );
                
                if (isSelfReferral || isSameDevice) {
                    referral.status = "FAILED";
                    referral.completedAt = new Date();
                    await referral.save();
                    console.log(`Referral marked as FAILED due to abuse: selfReferral=${isSelfReferral}, sameDevice=${isSameDevice}`);
                } else if (referrer) {
                    referral.status = "SUCCESS";
                    referral.completedAt = new Date();
                    referral.orderId = orderId;
                    await referral.save();

                    // Referrer Wallet Reward
                    let referrerWallet = await Wallet.findOne({ userId: referrer._id });
                    if (!referrerWallet) {
                        referrerWallet = await Wallet.create({ userId: referrer._id });
                    }
                    const referrerReward = settings.referralRewardReferrer;
                    referrerWallet.balance += referrerReward;
                    referrerWallet.totalEarned += referrerReward;
                    await referrerWallet.save();

                    await Transaction.create({
                        userId: referrer._id,
                        type: "REFERRAL_BONUS",
                        amount: referrerReward,
                        description: `Referral bonus for inviting ${user.fullName}`,
                        status: "SUCCESS"
                    });

                    // Referred User Wallet Reward
                    let referredWallet = await Wallet.findOne({ userId: user._id });
                    if (!referredWallet) {
                        referredWallet = await Wallet.create({ userId: user._id });
                    }
                    const referredReward = settings.referralRewardReferred;
                    referredWallet.balance += referredReward;
                    referredWallet.totalEarned += referredReward;
                    await referredWallet.save();

                    await Transaction.create({
                        userId: user._id,
                        type: "REFERRAL_BONUS",
                        amount: referredReward,
                        description: `Welcome bonus for using referral code from ${referrer.fullName}`,
                        status: "SUCCESS"
                    });

                    // Increment referrer count
                    referrer.referralCount += 1;

                    // Evaluate milestones dynamically
                    // Reached Tier 1 Milestone
                    if (referrer.referralCount === settings.tier1Threshold) {
                        referrerWallet.balance += settings.tier1Reward;
                        referrerWallet.totalEarned += settings.tier1Reward;
                        await referrerWallet.save();

                        await Transaction.create({
                            userId: referrer._id,
                            type: "REFERRAL_BONUS",
                            amount: settings.tier1Reward,
                            description: `Milestone bonus for reaching Tier 1 (${settings.tier1Threshold} referrals)`,
                            status: "SUCCESS"
                        });
                    }

                    // Update affiliate status flags based on tiers
                    if (referrer.referralCount >= settings.tier2Threshold) {
                        referrer.isAffiliate = true;
                    }
                    
                    await referrer.save();
                }
            }
        }

        // 2. Process Affiliate Commission (if affiliate coupon used)
        if (order.couponCode) {
            const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
            if (coupon && coupon.affiliateId) {
                const affiliate = await User.findById(coupon.affiliateId);
                if (affiliate) {
                    const successfulRefs = await Referral.countDocuments({ referrerUserId: affiliate._id, status: "SUCCESS" });
                    
                    // Determine commission rate based on dynamic milestones
                    let commissionPercent = settings.baseCommission;
                    if (successfulRefs >= settings.tier3Threshold) {
                        commissionPercent = settings.tier3Commission;
                    }

                    const commissionAmount = (order.totalAmount * commissionPercent) / 100;
                    
                    let affiliateWallet = await Wallet.findOne({ userId: affiliate._id });
                    if (!affiliateWallet) {
                        affiliateWallet = await Wallet.create({ userId: affiliate._id });
                    }
                    
                    affiliateWallet.balance += commissionAmount;
                    affiliateWallet.totalEarned += commissionAmount;
                    await affiliateWallet.save();

                    // Sync values to User model for compatibility
                    affiliate.commissionBalance = affiliateWallet.balance;
                    affiliate.totalEarnings = affiliateWallet.totalEarned;
                    await affiliate.save();

                    await Transaction.create({
                        userId: affiliate._id,
                        type: "CASHBACK",
                        amount: commissionAmount,
                        description: `Affiliate commission for order ${order._id}`,
                        status: "SUCCESS"
                    });

                    order.referrer = affiliate._id;
                    order.referralCommission = commissionAmount;
                }
            }
        }

        order.isReferralCounted = true;
        await order.save();
    } catch (err) {
        console.error("Error processing referral rewards:", err);
    }
};
