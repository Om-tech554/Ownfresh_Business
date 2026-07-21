import mongoose from "mongoose";
import User from "../models/usermodel.js";
import Order from "../models/ordermodel.js";
import ReferralCode from "../models/referralCodeModel.js";
import ReferralUsage from "../models/referralUsageModel.js";
import Wallet from "../models/walletModel.js";
import WalletTransaction from "../models/walletTransactionModel.js";
import Notification from "../models/notificationModel.js";
import { logEvent } from "../utils/auditLogger.js";

/**
 * Generate a unique and secure referral code for a user
 */
export const generateUniqueCode = async (fullName) => {
    let prefix = "OWN";
    if (fullName) {
        prefix = fullName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 5);
        if (prefix.length < 3) prefix = "OWN";
    }
    
    let isUnique = false;
    let code = "";
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
        attempts++;
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = `${prefix}${suffix}`;
        const existing = await ReferralCode.findOne({ code });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
};

/**
 * Validate a referral code against checkout purchase rules
 */
export const validateReferralCode = async (req, res) => {
    const { code } = req.body;
    const currentUserId = req.userId;

    try {
        if (!code || typeof code !== "string") {
            return res.status(400).json({ success: false, message: "Referral code is required." });
        }

        const referralCodeRecord = await ReferralCode.findOne({ code: code.toUpperCase() });
        if (!referralCodeRecord) {
            await logEvent({
                eventType: "FAILED_VALIDATION",
                req,
                details: { reason: "Code does not exist", code }
            });
            return res.status(404).json({ success: false, message: "Referral code does not exist." });
        }

        const ownerId = referralCodeRecord.userId.toString();
        if (ownerId === currentUserId.toString()) {
            await logEvent({
                eventType: "FAILED_VALIDATION",
                req,
                details: { reason: "Self-referral", code }
            });
            return res.status(400).json({ success: false, message: "You cannot refer yourself." });
        }

        const hasUsedReferralBefore = await ReferralUsage.findOne({
            referredUserId: currentUserId,
            status: { $in: ["PENDING", "APPROVED"] }
        });
        if (hasUsedReferralBefore) {
            await logEvent({
                eventType: "FAILED_VALIDATION",
                req,
                details: { reason: "User already used a code before", code }
            });
            return res.status(400).json({ success: false, message: "You have already used a referral code before." });
        }

        return res.status(200).json({
            success: true,
            message: "Referral code is valid.",
            ownerId
        });
    } catch (error) {
        console.error("Error validating referral code:", error);
        await logEvent({
            eventType: "API_ERROR",
            req,
            details: { error: error.message, path: "validate-code" }
        });
        return res.status(500).json({ success: false, message: "Server error during validation." });
    }
};

/**
 * Apply referral code during checkout order placement
 */
export const applyReferralCodeOnOrder = async (req, res) => {
    const { orderId, code } = req.body;
    const currentUserId = req.userId;

    try {
        if (!orderId || !code) {
            return res.status(400).json({ success: false, message: "Order ID and Referral Code are required." });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.user.toString() !== currentUserId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized order link." });
        }

        const referralCodeRecord = await ReferralCode.findOne({ code: code.toUpperCase() });
        if (!referralCodeRecord) {
            return res.status(404).json({ success: false, message: "Referral code does not exist." });
        }

        const ownerId = referralCodeRecord.userId.toString();
        if (ownerId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot refer yourself." });
        }

        const hasUsedReferralBefore = await ReferralUsage.findOne({
            referredUserId: currentUserId,
            status: { $in: ["PENDING", "APPROVED"] }
        });
        if (hasUsedReferralBefore) {
            return res.status(400).json({ success: false, message: "You have already used a referral code before." });
        }

        const existingUsageForOrder = await ReferralUsage.findOne({ orderId });
        if (existingUsageForOrder) {
            return res.status(400).json({ success: false, message: "Referral benefits already applied to this order." });
        }

        // Create the PENDING referral record
        const usage = new ReferralUsage({
            referrerUserId: ownerId,
            referredUserId: currentUserId,
            referralCodeId: referralCodeRecord._id,
            orderId,
            status: "PENDING",
            rewardAmount: 100, // Points to referrer
            refereeRewardAmount: 50 // Points to referred user
        });
        await usage.save();

        // Update the Order with the referral code
        order.referralCode = code.toUpperCase();
        await order.save();

        await logEvent({
            eventType: "REFERRAL_USED",
            req,
            userId: currentUserId,
            details: { orderId, code, referrerId: ownerId }
        });

        // Notify referrer
        await new Notification({
            userId: ownerId,
            title: "Your referral code was used!",
            message: `A friend placed an order using your code ${code.toUpperCase()}. Your reward points are pending admin review.`,
            type: "REFERRAL_USED"
        }).save();

        return res.status(200).json({
            success: true,
            message: "Referral code successfully applied to order.",
            referralUsage: usage
        });
    } catch (error) {
        console.error("Error applying referral code:", error);
        await logEvent({
            eventType: "API_ERROR",
            req,
            details: { error: error.message, path: "apply-code" }
        });
        return res.status(500).json({ success: false, message: "Server error while applying code." });
    }
};

/**
 * Approve a pending referral (Admin only)
 */
export const approveReferral = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.userId;

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const referral = await ReferralUsage.findById(id).session(session);
        if (!referral) {
            return res.status(404).json({ success: false, message: "Referral record not found." });
        }

        if (referral.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Referral is already processed." });
        }

        // Verify order payment success
        const order = await Order.findById(referral.orderId).session(session);
        if (!order) {
            return res.status(404).json({ success: false, message: "Linked order not found." });
        }

        if (order.paymentStatus !== "completed") {
            return res.status(400).json({
                success: false,
                message: `Order payment status is '${order.paymentStatus}'. Referrals can only be approved for paid orders.`
            });
        }

        // Double-check order hasn't received points
        if (order.isReferralRewarded || order.rewardCredited) {
            return res.status(400).json({ success: false, message: "Referral rewards have already been credited for this order." });
        }

        // Process rewards using sessions (Atomic Transaction)
        // 1. Credit Referrer Wallet
        let referrerWallet = await Wallet.findOneAndUpdate(
            { userId: referral.referrerUserId },
            { $setOnInsert: { userId: referral.referrerUserId } },
            { upsert: true, new: true, session }
        );
        referrerWallet.balance += referral.rewardAmount;
        referrerWallet.totalEarned += referral.rewardAmount;
        await referrerWallet.save({ session });

        // Update Referrer User document
        const referrerUser = await User.findById(referral.referrerUserId).session(session);
        if (referrerUser) {
            referrerUser.wallet = (referrerUser.wallet || 0) + referral.rewardAmount;
            referrerUser.walletBalance = (referrerUser.walletBalance || 0) + referral.rewardAmount;
            referrerUser.referralPoints = (referrerUser.referralPoints || 0) + referral.rewardAmount;
            await referrerUser.save({ session });
        }

        // Immutable Transaction log for Referrer
        const referrerTx = new WalletTransaction({
            walletId: referrerWallet._id,
            userId: referral.referrerUserId,
            type: "REFERRAL_BONUS",
            amount: referral.rewardAmount,
            description: `Referral bonus for referring User ID: ${referral.referredUserId}`,
            referenceOrderId: referral.orderId,
            adminId,
            timestamp: new Date()
        });
        await referrerTx.save({ session });

        // 2. Credit Referee Wallet
        let refereeWallet = await Wallet.findOneAndUpdate(
            { userId: referral.referredUserId },
            { $setOnInsert: { userId: referral.referredUserId } },
            { upsert: true, new: true, session }
        );
        refereeWallet.balance += referral.refereeRewardAmount;
        refereeWallet.totalEarned += referral.refereeRewardAmount;
        await refereeWallet.save({ session });

        // Update Referee User document
        const refereeUser = await User.findById(referral.referredUserId).session(session);
        if (refereeUser) {
            refereeUser.wallet = (refereeUser.wallet || 0) + referral.refereeRewardAmount;
            refereeUser.walletBalance = (refereeUser.walletBalance || 0) + referral.refereeRewardAmount;
            refereeUser.hasRedeemedReferral = true;
            await refereeUser.save({ session });
        }

        // Immutable Transaction log for Referee
        const refereeTx = new WalletTransaction({
            walletId: refereeWallet._id,
            userId: referral.referredUserId,
            type: "REFERRAL_BONUS",
            amount: referral.refereeRewardAmount,
            description: `Welcome bonus for using a referral code.`,
            referenceOrderId: referral.orderId,
            adminId,
            timestamp: new Date()
        });
        await refereeTx.save({ session });

        // 3. Mark Referral Approved and Order Rewarded
        referral.status = "APPROVED";
        referral.approvedAt = new Date();
        referral.adminId = adminId;
        referral.approvedBy = adminId;
        referral.notes = notes || "Approved by Admin.";
        await referral.save({ session });

        order.isReferralRewarded = true;
        order.rewardCredited = true;
        order.referralStatus = "APPROVED";
        await order.save({ session });

        // Commit transaction
        await session.commitTransaction();

        // Audit log
        await logEvent({
            eventType: "REFERRAL_APPROVED",
            req,
            adminId,
            details: { referralId: referral._id, orderId: order._id, referrerReward: referral.rewardAmount, refereeReward: referral.refereeRewardAmount }
        });

        // Notifications (outside transaction in case of separate delivery failure)
        await new Notification({
            userId: referral.referrerUserId,
            title: "Referral Approved!",
            message: `Congratulations! Your referral for order ${order._id} was approved. ₹${referral.rewardAmount} credited to your wallet.`,
            type: "REFERRAL_APPROVED"
        }).save();

        await new Notification({
            userId: referral.referredUserId,
            title: "Welcome Bonus Credited!",
            message: `Congratulations! Your welcome bonus of ₹${referral.refereeRewardAmount} has been approved and credited to your wallet.`,
            type: "WALLET_CREDITED"
        }).save();

        return res.status(200).json({
            success: true,
            message: "Referral successfully approved and wallet rewards credited."
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction Error during referral approval:", error);
        await logEvent({
            eventType: "API_ERROR",
            req,
            adminId,
            details: { error: error.message, path: "approve-referral" }
        });
        return res.status(500).json({ success: false, message: "Error approving referral transaction." });
    } finally {
        session.endSession();
    }
};

/**
 * Reject a pending referral (Admin only)
 */
export const rejectReferral = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.userId;

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const referral = await ReferralUsage.findById(id).session(session);
        if (!referral) {
            return res.status(404).json({ success: false, message: "Referral record not found." });
        }

        if (referral.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Referral is already processed." });
        }

        referral.status = "REJECTED";
        referral.rejectedAt = new Date();
        referral.adminId = adminId;
        referral.notes = notes || "Rejected by Admin.";
        await referral.save({ session });

        // Update Order
        const order = await Order.findById(referral.orderId).session(session);
        if (order) {
            order.referralStatus = "REJECTED";
            await order.save({ session });
        }

        // Reset buyer hasRedeemedReferral = false, since this referral usage was rejected
        const refereeUser = await User.findById(referral.referredUserId).session(session);
        if (refereeUser) {
            refereeUser.hasRedeemedReferral = false;
            await refereeUser.save({ session });
        }

        await session.commitTransaction();

        await logEvent({
            eventType: "REFERRAL_REJECTED",
            req,
            adminId,
            details: { referralId: referral._id, orderId: referral.orderId, notes }
        });

        // Notifications
        await new Notification({
            userId: referral.referrerUserId,
            title: "Referral Rejected",
            message: `Your referral reward for order ${referral.orderId} was rejected. Note: ${referral.notes}`,
            type: "REFERRAL_REJECTED"
        }).save();

        await new Notification({
            userId: referral.referredUserId,
            title: "Referral Code Bonus Rejected",
            message: `Your referral code welcome bonus for order ${referral.orderId} was rejected. Note: ${referral.notes}`,
            type: "REFERRAL_REJECTED"
        }).save();

        return res.status(200).json({
            success: true,
            message: "Referral successfully rejected."
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error rejecting referral:", error);
        await logEvent({
            eventType: "API_ERROR",
            req,
            adminId,
            details: { error: error.message, path: "reject-referral" }
        });
        return res.status(500).json({ success: false, message: "Error rejecting referral." });
    } finally {
        session.endSession();
    }
};

/**
 * Get customer-facing referral dashboard stats
 */
export const getReferralStats = async (req, res) => {
    const userId = req.userId;

    try {
        // Get user referral code
        let referralCodeRecord = await ReferralCode.findOne({ userId });
        if (!referralCodeRecord) {
            // Self-healing: create code if it is missing
            const code = await generateUniqueCode(req.user.fullName);
            referralCodeRecord = new ReferralCode({ userId, code });
            await referralCodeRecord.save();
            
            // Also update the User record for convenience
            await User.findByIdAndUpdate(userId, { referralCode: code });
        }

        // Get user's wallet
        const wallet = await Wallet.findOne({ userId }) || { balance: 0, totalEarned: 0, totalRedeemed: 0 };

        // Get transactions
        const transactions = await WalletTransaction.find({ userId }).sort({ timestamp: -1 }).limit(10);

        // Get referral histories where this user is the referrer
        const referrals = await ReferralUsage.find({ referrerUserId: userId })
            .populate("referredUserId", "fullName createdAt")
            .populate("orderId", "paymentStatus totalAmount status")
            .sort({ createdAt: -1 });

        // Calculate reward totals
        const pendingCount = referrals.filter(r => r.status === "PENDING").length;
        const approvedCount = referrals.filter(r => r.status === "APPROVED").length;
        const rejectedCount = referrals.filter(r => r.status === "REJECTED").length;

        return res.status(200).json({
            success: true,
            referralCode: referralCodeRecord.code,
            wallet,
            transactions,
            referrals,
            counts: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                total: referrals.length
            }
        });
    } catch (error) {
        console.error("Error fetching referral stats:", error);
        return res.status(500).json({ success: false, message: "Error loading referral stats." });
    }
};

/**
 * Get admin-facing referral lists with pagination, search, filter
 */
export const getAdminReferrals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search;
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            // Find users matching search keyword to filter by owner or customer
            const users = await User.find({
                $or: [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }).select("_id");
            const userIds = users.map(u => u._id);

            // Also check for matching code
            const codes = await ReferralCode.find({
                code: { $regex: search, $options: "i" }
            }).select("_id");
            const codeIds = codes.map(c => c._id);

            query.$or = [
                { referrerUserId: { $in: userIds } },
                { referredUserId: { $in: userIds } },
                { referralCodeId: { $in: codeIds } }
            ];
        }

        const total = await ReferralUsage.countDocuments(query);
        const referrals = await ReferralUsage.find(query)
            .populate("referrerUserId", "fullName email")
            .populate("referredUserId", "fullName email")
            .populate("referralCodeId", "code")
            .populate("orderId", "paymentStatus totalAmount status createdAt")
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            success: true,
            referrals,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching admin referrals:", error);
        return res.status(500).json({ success: false, message: "Error loading admin referral details." });
    }
};

/**
 * Get admin analytics stats and chart data
 */
export const getAdminStats = async (req, res) => {
    try {
        const totalCodes = await ReferralCode.countDocuments({});
        const pending = await ReferralUsage.countDocuments({ status: "PENDING" });
        const approved = await ReferralUsage.countDocuments({ status: "APPROVED" });
        const rejected = await ReferralUsage.countDocuments({ status: "REJECTED" });

        // Sum wallet rewards paid out (referral rewards)
        const walletRewardsTx = await WalletTransaction.aggregate([
            { $match: { type: "REFERRAL_BONUS" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const rewardsTotal = walletRewardsTx.length > 0 ? walletRewardsTx[0].total : 0;

        // Today's Referrals (created today)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCount = await ReferralUsage.countDocuments({ createdAt: { $gte: todayStart } });

        // Conversion Rate (referred orders paid out vs total users)
        const totalUsers = await User.countDocuments({});
        const conversionRate = totalUsers > 0 ? ((approved / totalUsers) * 100).toFixed(1) : 0;

        // Top Referrers
        const topReferrers = await ReferralUsage.aggregate([
            { $match: { status: "APPROVED" } },
            { $group: { _id: "$referrerUserId", count: { $sum: 1 }, totalEarned: { $sum: "$rewardAmount" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        await User.populate(topReferrers, { path: "_id", select: "fullName email" });

        // Top Customers
        const topCustomers = await ReferralUsage.aggregate([
            { $match: { status: "APPROVED" } },
            { $group: { _id: "$referredUserId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        await User.populate(topCustomers, { path: "_id", select: "fullName email" });

        // Monthly Rewards paid out (Grouped by month, past 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyData = await WalletTransaction.aggregate([
            { 
                $match: { 
                    type: "REFERRAL_BONUS",
                    timestamp: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" }
                    },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formattedMonthly = monthlyData.map(d => {
            const date = new Date(d._id.year, d._id.month - 1);
            return {
                month: date.toLocaleString("default", { month: "short", year: "numeric" }),
                rewards: d.amount
            };
        });

        return res.status(200).json({
            success: true,
            summary: {
                totalCodes,
                pending,
                approved,
                rejected,
                rewardsTotal,
                todayCount,
                conversionRate
            },
            topReferrers,
            topCustomers,
            monthlyRewards: formattedMonthly
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return res.status(500).json({ success: false, message: "Error loading admin analytics." });
    }
};

/**
 * Export all referral stats as CSV format
 */
export const exportReferrals = async (req, res) => {
    try {
        const referrals = await ReferralUsage.find({})
            .populate("referrerUserId", "fullName email")
            .populate("referredUserId", "fullName email")
            .populate("referralCodeId", "code")
            .populate("orderId", "paymentStatus totalAmount");

        let csv = "Referral Code,Owner,Owner Email,Customer,Customer Email,Order ID,Payment Status,Order Amount,Status,Used Date,Approved Date,Notes\n";
        
        referrals.forEach(r => {
            const code = r.referralCodeId?.code || "N/A";
            const owner = r.referrerUserId?.fullName || "N/A";
            const ownerEmail = r.referrerUserId?.email || "N/A";
            const customer = r.referredUserId?.fullName || "N/A";
            const customerEmail = r.referredUserId?.email || "N/A";
            const orderId = r.orderId?._id || "N/A";
            const paymentStatus = r.orderId?.paymentStatus || "N/A";
            const amount = r.orderId?.totalAmount || 0;
            const status = r.status;
            const used = r.usedAt ? new Date(r.usedAt).toISOString().split("T")[0] : "N/A";
            const approved = r.approvedAt ? new Date(r.approvedAt).toISOString().split("T")[0] : "N/A";
            const notes = r.notes ? r.notes.replace(/,/g, " ") : "";

            csv += `"${code}","${owner}","${ownerEmail}","${customer}","${customerEmail}","${orderId}","${paymentStatus}",${amount},"${status}","${used}","${approved}","${notes}"\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=referral_report.csv");
        return res.status(200).send(csv);
    } catch (error) {
        console.error("Error exporting referrals:", error);
        return res.status(500).json({ success: false, message: "Error exporting CSV file." });
    }
};
