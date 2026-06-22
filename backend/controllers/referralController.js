import User from "../models/usermodel.js";
import Referral from "../models/referralModel.js";
import AffiliateSettings from "../models/affiliateSettingsModel.js";
import Coupon from "../models/couponModel.js";
import Order from "../models/ordermodel.js";

// Get referral stats for the logged-in user
export const getReferralStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Ensure user has a referral code if missing
        if (!user.referralCode) {
            user.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            await User.findByIdAndUpdate(user._id, { referralCode: user.referralCode });
        }

        let settings = await AffiliateSettings.findOne();
        if (!settings) {
            settings = {
                tier1Threshold: 3, tier1Reward: 50,
                tier2Threshold: 6, tier2Reward: "affiliate_unlock",
                tier3Threshold: 15, tier3Commission: 15,
                baseCommission: 10, referralDiscountType: "percentage",
                referralDiscountValue: 10, subscriptionPrice: 999
            };
        }

        const referrals = await Referral.find({ referrer: req.user._id })
            .populate("referredUser", "fullName createdAt")
            .sort({ createdAt: -1 }) || [];

        const successfulReferrals = await Referral.countDocuments({ referrer: req.user._id, status: "completed" }) || 0;

        // Determine current tier
        let currentTier = 0;
        if (successfulReferrals >= settings.tier3Threshold) currentTier = 3;
        else if (successfulReferrals >= settings.tier2Threshold || user.subscriptionActive) currentTier = 2;
        else if (successfulReferrals >= settings.tier1Threshold) currentTier = 1;

        res.status(200).json({
            success: true,
            referralCode: user.referralCode,
            referralCount: successfulReferrals,
            totalReferrals: referrals.length,
            referrals,
            currentTier,
            isAffiliate: user.isAffiliate || currentTier >= 2 || user.subscriptionActive,
            earnings: user.commissionBalance,
            totalEarnings: user.totalEarnings,
            wallet: user.wallet,
            settings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching referral stats" });
    }
};

// Generate affiliate coupon code
export const generateAffiliateCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate } = req.body;
        const user = await User.findById(req.user._id);
        const settings = await AffiliateSettings.findOne() || await AffiliateSettings.create({});

        // Check if user is eligible (Tier 2 or Subscription)
        const successfulReferrals = await Referral.countDocuments({ referrer: req.user._id, status: "completed" });
        if (successfulReferrals < settings.tier2Threshold && !user.subscriptionActive && !user.isAffiliate) {
            return res.status(403).json({ message: "You are not eligible to generate affiliate coupons yet." });
        }

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists." });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            expiryDate,
            affiliateId: req.user._id
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating coupon" });
    }
};

// Get affiliate earnings and conversions
export const getAffiliateData = async (req, res) => {
    try {
        const coupons = await Coupon.find({ affiliateId: req.user._id });
        const couponCodes = coupons.map(c => c.code);

        const orders = await Order.find({ couponCode: { $in: couponCodes }, status: "delivered" })
            .populate("user", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            coupons,
            orders,
            totalConversions: orders.length,
            totalEarnings: req.user.totalEarnings
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
            .select("fullName email referralCount isAffiliate commissionBalance totalEarnings");

        const settings = await AffiliateSettings.findOne() || await AffiliateSettings.create({});

        res.status(200).json({ success: true, users, settings });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// Admin: Update Settings
export const updateAffiliateSettings = async (req, res) => {
    try {
        const settings = await AffiliateSettings.findOneAndUpdate({}, req.body, { upsert: true, new: true });
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ message: "Error updating settings" });
    }
};

// Handle Subscription to unlock Affiliate
export const unlockAffiliateViaSubscription = async (req, res) => {
    try {
        // In a real app, you'd verify payment with Razorpay/Stripe here
        const user = await User.findById(req.user._id);
        user.subscriptionActive = true;
        user.isAffiliate = true;
        await user.save();

        res.status(200).json({ success: true, message: "Affiliate status unlocked successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// Helper: Process Referral Reward on Order Delivery
export const processReferralRewards = async (orderId) => {
    const order = await Order.findById(orderId).populate("user");
    if (!order || order.status !== "delivered" || order.isReferralCounted) return;

    const user = order.user;
    const settings = await AffiliateSettings.findOne() || await AffiliateSettings.create({});

    // 1. Process Direct Referral (for the first purchase)
    const referral = await Referral.findOne({ referredUser: user._id, status: "pending" });
    if (referral) {
        referral.status = "completed";
        referral.orderId = orderId;
        await referral.save();

        const referrer = await User.findById(referral.referrer);
        if (referrer) {
            referrer.referralCount += 1;
            
            // Check Milestones
            if (referrer.referralCount === settings.tier1Threshold) {
                referrer.wallet += settings.tier1Reward;
            } else if (referrer.referralCount === settings.tier2Threshold) {
                referrer.isAffiliate = true;
            }
            
            await referrer.save();
        }
    }

    // 2. Process Affiliate Commission (if affiliate coupon used)
    if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon && coupon.affiliateId) {
            const affiliate = await User.findById(coupon.affiliateId);
            if (affiliate) {
                // Calculate commission percentage based on tier
                const successfulRefs = await Referral.countDocuments({ referrer: affiliate._id, status: "completed" });
                let commissionPercent = settings.baseCommission;
                if (successfulRefs >= settings.tier3Threshold) {
                    commissionPercent = settings.tier3Commission;
                }

                const commissionAmount = (order.totalAmount * commissionPercent) / 100;
                affiliate.commissionBalance += commissionAmount;
                affiliate.totalEarnings += commissionAmount;
                await affiliate.save();

                order.referrer = affiliate._id;
                order.referralCommission = commissionAmount;
            }
        }
    }

    order.isReferralCounted = true;
    await order.save();
};
