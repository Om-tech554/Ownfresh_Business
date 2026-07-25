import crypto from "crypto";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/usermodel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import CommissionLog from "../models/commissionLogModel.js";

// --- PHONEPE CONFIGURATION FOR MEMBERSHIP ---
const isPlaceholder = (val) => !val || val.includes("your_") || val.includes("placeholder") || val.includes("your-");

const PHONEPE_MERCHANT_ID = !isPlaceholder(process.env.PHONEPE_MERCHANT_ID)
  ? process.env.PHONEPE_MERCHANT_ID
  : "PGTESTPAYUAT86";

const PHONEPE_SALT_KEY = !isPlaceholder(process.env.PHONEPE_SALT_KEY)
  ? process.env.PHONEPE_SALT_KEY
  : "96434309-7796-489d-8924-ab56988a6076";

const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

const isTestMerchant = (merchantId) => {
  if (!merchantId) return true;
  const m = merchantId.toUpperCase();
  return m.includes("PGTEST") || m.includes("TEST") || m.includes("UAT");
};

const getPhonePeBaseUrl = () => {
  if (process.env.PHONEPE_HOST_URL) {
    let host = process.env.PHONEPE_HOST_URL.trim().replace(/\/+$/, "");
    if (host.endsWith("/pg")) {
      host = host.slice(0, -3);
    }
    return host;
  }
  const env = (process.env.PHONEPE_ENV || "").toLowerCase();
  if (env === "production" && !isTestMerchant(PHONEPE_MERCHANT_ID)) {
    return "https://api.phonepe.com/apis/hermes";
  }
  return "https://api-preprod.phonepe.com/apis/pg-sandbox";
};

const PHONEPE_BASE_URL = getPhonePeBaseUrl();

const PHONEPE_PAY_ENDPOINT = "/pg/v1/pay";
const PHONEPE_STATUS_ENDPOINT = "/pg/v1/status";

/**
 * DEACTIVATE ALL EXISTING MEMBERS
 * Resets isMember = false and membershipExpiresAt = null for all existing users,
 * ensuring everyone must pay via PhonePe to access Prime 1%.
 */
export const deactivateAllExistingMembers = async (req, res) => {
  try {
    const result = await User.updateMany(
      {},
      {
        $set: {
          isMember: false,
          membershipExpiresAt: null,
          membershipPlanName: ""
        }
      }
    );
    console.log(`✅ Deactivated all existing members (${result.modifiedCount} users updated).`);
    if (res) {
      return res.status(200).json({
        success: true,
        msg: `Deactivated all existing members (${result.modifiedCount} users updated). Everyone must subscribe via PhonePe.`
      });
    }
  } catch (error) {
    console.error("Error deactivating existing members:", error);
    if (res) {
      return res.status(500).json({ success: false, msg: "Failed to deactivate members" });
    }
  }
};

/**
 * POST /api/membership/initiate-phonepe-payment
 * User: Initiate PhonePe payment to subscribe to Prime 1% Membership plan.
 */
export const initiateMembershipPhonePePayment = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    let plan = null;
    if (planId && mongoose.Types.ObjectId.isValid(planId)) {
      plan = await MembershipPlan.findById(planId);
    }
    if (!plan) {
      plan = await MembershipPlan.findOne({ status: "Active" });
    }
    if (!plan) {
      // Auto-create default Prime Plan if none exists in DB yet
      plan = await MembershipPlan.create({
        name: "OwnFresh Prime Membership",
        price: 299,
        durationDays: 365,
        commissionRatePercentage: 1,
        description: "Join OwnFresh Prime to earn 1% Commission Coins on every transaction.",
        features: [
          "Earn 1% Commission Credit Coins on all orders",
          "Redeem coins directly at checkout (150 threshold)",
          "Coins reset after 45 days of earning",
          "Exclusive Prime member offers & priority support"
        ],
        status: "Active"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const amountInPaise = Math.round((plan.price || 299) * 100);
    const merchantTransactionId = `PRIME_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const merchantUserId = userId.toString().replace(/[^a-zA-Z0-9]/g, "");

    const host = req.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocal ? "http" : "https";

    const backendHost = `${protocol}://${host}`;
    const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${backendHost}/api/membership/phonepe-callback`;

    let frontendHost = process.env.FRONTEND_URL || backendHost;
    if (!isLocal && frontendHost.startsWith("http://")) {
      frontendHost = frontendHost.replace("http://", "https://");
    }
    const redirectUrl = `${frontendHost}/membership?payment=success&txnId=${merchantTransactionId}`;

    const rawMobile = user.mobile || "";
    const digitsOnly = rawMobile.replace(/\D/g, "");
    const cleanMobile = (digitsOnly.length >= 10) ? digitsOnly.slice(-10) : "9999999999";

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId,
      amount: amountInPaise,
      redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl,
      mobileNumber: cleanMobile,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const initialTargetUrl = `${PHONEPE_BASE_URL}${PHONEPE_PAY_ENDPOINT}`;
    let response;

    const executePayRequest = async (mId, sKey, sIndex, targetUrl) => {
      const currentPayload = { ...payload, merchantId: mId };
      const base64Payload = Buffer.from(JSON.stringify(currentPayload)).toString("base64");
      const stringToHash = base64Payload + PHONEPE_PAY_ENDPOINT + sKey;
      const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
      const checksum = `${sha256}###${sIndex}`;

      return await axios.post(
        targetUrl,
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum
          }
        }
      );
    };

    try {
      response = await executePayRequest(
        PHONEPE_MERCHANT_ID,
        PHONEPE_SALT_KEY,
        PHONEPE_SALT_INDEX,
        initialTargetUrl
      );
    } catch (apiErr) {
      const errCode = apiErr.response?.data?.code || "";
      const errMsg = apiErr.response?.data?.message || apiErr.response?.data?.msg || "";
      const isKeyProblem = errCode === "KEY_NOT_CONFIGURED" || errCode === "KEY_NOT_FOUND" || errMsg.toLowerCase().includes("key not found");
      const is404 = apiErr.response?.status === 404;

      if (is404 || isKeyProblem) {
        const altUrl = initialTargetUrl.includes("api.phonepe.com/apis/hermes")
          ? initialTargetUrl.replace("api.phonepe.com/apis/hermes", "api-preprod.phonepe.com/apis/pg-sandbox")
          : initialTargetUrl.replace("api-preprod.phonepe.com/apis/pg-sandbox", "api.phonepe.com/apis/hermes");

        try {
          console.log(`⚠️ PhonePe ${errCode || '404'} on ${initialTargetUrl}. Retrying alternate URL: ${altUrl}`);
          response = await executePayRequest(
            PHONEPE_MERCHANT_ID,
            PHONEPE_SALT_KEY,
            PHONEPE_SALT_INDEX,
            altUrl
          );
        } catch (altErr) {
          const altCode = altErr.response?.data?.code || "";
          const altMsg = altErr.response?.data?.message || altErr.response?.data?.msg || "";
          if (altCode === "KEY_NOT_CONFIGURED" || altCode === "KEY_NOT_FOUND" || altMsg.toLowerCase().includes("key not found") || altErr.response?.status === 404) {
            console.log(`⚠️ Custom merchant key not active on PhonePe yet. Falling back to PGTESTPAYUAT86 sandbox...`);
            response = await executePayRequest(
              "PGTESTPAYUAT86",
              "96434309-7796-489d-8924-ab56988a6076",
              "1",
              "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
            );
          } else {
            throw altErr;
          }
        }
      } else {
        throw apiErr;
      }
    }

    if (response.data && response.data.success) {
      const redirectUrlFromPhonePe = response.data.data.instrumentResponse.redirectInfo.url;
      return res.status(200).json({
        success: true,
        redirectUrl: redirectUrlFromPhonePe,
        merchantTransactionId
      });
    } else {
      console.error("PhonePe Membership API Error Response:", response.data);
      return res.status(400).json({
        success: false,
        msg: response.data?.message || response.data?.msg || "Failed to initiate membership payment with PhonePe",
        error: response.data
      });
    }

  } catch (error) {
    console.error("Initiate membership PhonePe payment error:", error.message, error.response?.data);
    const detailMsg = error.response?.data?.message || error.response?.data?.msg || error.message;
    return res.status(400).json({
      success: false,
      msg: `PhonePe initiation failed: ${detailMsg}`,
      error: error.message,
      details: error.response?.data
    });
  }
};

/**
 * GET /api/membership/check-phonepe-status/:txnId
 * User/Callback: Check PhonePe payment status for membership and activate user if completed.
 */
export const checkMembershipPhonePeStatus = async (req, res) => {
  try {
    const { txnId } = req.params;
    const userId = req.user._id;

    if (!txnId) {
      return res.status(400).json({ success: false, msg: "Transaction ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    // If already an active member, return status
    const now = new Date();
    if (user.isMember && user.membershipExpiresAt && new Date(user.membershipExpiresAt) > now) {
      return res.status(200).json({
        success: true,
        isMember: true,
        membershipPlanName: user.membershipPlanName,
        membershipExpiresAt: user.membershipExpiresAt,
        msg: "Your Prime 1% Membership is active!"
      });
    }

    // Verify status with PhonePe API
    const statusUrlPath = `${PHONEPE_STATUS_ENDPOINT}/${PHONEPE_MERCHANT_ID}/${txnId}`;
    const stringToHash = statusUrlPath + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

    let response;
    const initialStatusUrl = `${PHONEPE_BASE_URL}${statusUrlPath}`;
    try {
      response = await axios.get(
        initialStatusUrl,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
          }
        }
      );
    } catch (apiErr) {
      if (apiErr.response?.status === 404) {
        const altUrl = initialStatusUrl.includes("api.phonepe.com/apis/hermes")
          ? initialStatusUrl.replace("api.phonepe.com/apis/hermes", "api-preprod.phonepe.com/apis/pg-sandbox")
          : initialStatusUrl.replace("api-preprod.phonepe.com/apis/pg-sandbox", "api.phonepe.com/apis/hermes");

        response = await axios.get(
          altUrl,
          {
            headers: {
              "Content-Type": "application/json",
              "X-VERIFY": checksum,
              "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
            }
          }
        );
      } else {
        throw apiErr;
      }
    }

    if (response.data && response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      let plan = await MembershipPlan.findOne({ status: "Active" });
      const durationMs = ((plan?.durationDays) || 365) * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + durationMs);

      user.isMember = true;
      user.membershipPlanName = plan?.name || "OwnFresh Prime Membership";
      user.membershipExpiresAt = expiresAt;
      await user.save();

      // Log event if not logged already
      const existingLog = await CommissionLog.findOne({ userId, note: { $regex: txnId } });
      if (!existingLog) {
        await CommissionLog.create({
          userId,
          coinsEarned: 0,
          coinsRemaining: 0,
          expiresAt,
          status: "MEMBERSHIP_PURCHASE",
          type: "PLAN_PURCHASE",
          note: `Activated ${user.membershipPlanName} via PhonePe (Txn: ${txnId})`
        });
      }

      return res.status(200).json({
        success: true,
        isMember: true,
        membershipPlanName: user.membershipPlanName,
        membershipExpiresAt: user.membershipExpiresAt,
        msg: `🎉 Congratulations! Your ${user.membershipPlanName} is now active!`
      });
    } else {
      return res.status(200).json({
        success: false,
        isMember: false,
        msg: response.data?.message || "Payment for membership was not completed."
      });
    }

  } catch (error) {
    console.error("Check membership PhonePe status error:", error.message, error.response?.data);
    res.status(500).json({ success: false, msg: "Failed to verify membership payment status" });
  }
};

/**
 * POST /api/membership/phonepe-callback
 * Webhook S2S for PhonePe Membership Payments
 */
export const phonepeMembershipCallback = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) return res.status(400).json({ success: false, msg: "Missing response payload" });

    const decodedPayloadString = Buffer.from(response, "base64").toString("utf-8");
    const callbackData = JSON.parse(decodedPayloadString);

    const { success, code, data } = callbackData;
    const { merchantTransactionId, merchantUserId } = data || {};

    if (success && code === "PAYMENT_SUCCESS" && merchantUserId) {
      const user = await User.findById(merchantUserId);
      if (user) {
        let plan = await MembershipPlan.findOne({ status: "Active" });
        const durationMs = ((plan?.durationDays) || 365) * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + durationMs);

        user.isMember = true;
        user.membershipPlanName = plan?.name || "OwnFresh Prime Membership";
        user.membershipExpiresAt = expiresAt;
        await user.save();

        await CommissionLog.create({
          userId: user._id,
          coinsEarned: 0,
          coinsRemaining: 0,
          expiresAt,
          status: "MEMBERSHIP_PURCHASE",
          type: "PLAN_PURCHASE",
          note: `Activated ${user.membershipPlanName} via PhonePe Webhook (Txn: ${merchantTransactionId})`
        });
      }
    }

    return res.status(200).json({ success: true, msg: "Membership callback processed" });
  } catch (error) {
    console.error("PhonePe membership callback error:", error);
    res.status(500).json({ success: false, msg: "Webhook error" });
  }
};

const MIN_REDEMPTION_THRESHOLD = 150;
const RESET_EXPIRATION_DAYS = 45;

/**
 * Helper: Processes and cleans up expired 45-day commission coin batches for a user.
 */
export const processCoinExpirations = async (userId) => {
  try {
    const now = new Date();

    // 1. Mark expired active batches
    const expiredLogs = await CommissionLog.find({
      userId,
      status: "ACTIVE",
      expiresAt: { $lte: now }
    });

    if (expiredLogs.length > 0) {
      for (const log of expiredLogs) {
        log.status = "EXPIRED";
        await log.save();

        // Create an explicit EXPIRED_RESET log entry for transparency
        await CommissionLog.create({
          userId,
          coinsEarned: 0,
          coinsRemaining: 0,
          expiresAt: now,
          status: "EXPIRED",
          type: "RESET_EXPIRED",
          note: `Batch of ${log.coinsRemaining} coins reset/expired after 45 days.`
        });
      }
    }

    // 2. Sum remaining active non-expired coins
    const activeBatches = await CommissionLog.find({
      userId,
      status: "ACTIVE",
      expiresAt: { $gt: now }
    });

    const activeTotalCoins = activeBatches.reduce((acc, curr) => acc + (curr.coinsRemaining || 0), 0);

    // Update user model
    await User.findByIdAndUpdate(userId, { commissionCoins: activeTotalCoins });

    return activeTotalCoins;
  } catch (error) {
    console.error("Error processing coin expirations:", error);
    return 0;
  }
};

/**
 * GET /api/membership/plans
 * Public: Get active membership plans (Auto-seeds default if empty).
 */
export const getPlans = async (req, res) => {
  try {
    let plans = await MembershipPlan.find({ status: "Active" }).sort({ price: 1 });

    if (plans.length === 0) {
      // Auto-seed default Prime Membership Plan
      const defaultPlan = await MembershipPlan.create({
        name: "OwnFresh Prime Membership",
        price: 299,
        durationDays: 365,
        commissionRatePercentage: 1,
        description: "Join OwnFresh Prime to earn 1% Commission Coins on every transaction. Coins reset in 45 days. Minimum 150 coins to redeem.",
        features: [
          "Earn 1% Commission Credit Coins on all orders",
          "Redeem coins directly at checkout (150 threshold)",
          "Coins reset after 45 days of earning",
          "Exclusive Prime member offers & priority support"
        ],
        status: "Active"
      });
      plans = [defaultPlan];
    }

    res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    console.error("Get membership plans error:", error);
    res.status(500).json({ success: false, msg: "Failed to fetch membership plans" });
  }
};

/**
 * POST /api/membership/purchase
 * User: Purchase/Activate a membership plan.
 */
export const purchaseMembership = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    let plan = null;
    if (planId) {
      plan = await MembershipPlan.findById(planId);
    }
    if (!plan) {
      plan = await MembershipPlan.findOne({ status: "Active" });
    }

    if (!plan) {
      return res.status(404).json({ success: false, msg: "Membership plan not found" });
    }

    const durationMs = (plan.durationDays || 365) * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    const user = await User.findById(userId);
    user.isMember = true;
    user.membershipPlanName = plan.name;
    user.membershipExpiresAt = expiresAt;
    await user.save();

    // Log membership purchase event
    await CommissionLog.create({
      userId,
      coinsEarned: 0,
      coinsRemaining: 0,
      expiresAt,
      status: "MEMBERSHIP_PURCHASE",
      type: "PLAN_PURCHASE",
      note: `Activated ${plan.name} (Valid until ${expiresAt.toLocaleDateString()})`
    });

    res.status(200).json({
      success: true,
      msg: `Congratulations! You are now an active ${plan.name} member.`,
      user: {
        isMember: user.isMember,
        membershipPlanName: user.membershipPlanName,
        membershipExpiresAt: user.membershipExpiresAt,
        commissionCoins: user.commissionCoins
      }
    });

  } catch (error) {
    console.error("Purchase membership error:", error);
    res.status(500).json({ success: false, msg: "Failed to purchase membership" });
  }
};

/**
 * GET /api/membership/my-status
 * User: Get full membership status, active commission coins, 150-coin threshold gauge, and 45-day expiration log.
 */
export const getMyMembershipStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Process 45-day expirations and get fresh balance
    const activeCoins = await processCoinExpirations(userId);

    const now = new Date();
    const isMemberActive = Boolean(user.isMember && user.membershipExpiresAt && new Date(user.membershipExpiresAt) > now);

    // Calculate 150 coins threshold metrics
    const canRedeem = activeCoins >= MIN_REDEMPTION_THRESHOLD;
    const coinsNeededToRedeem = Math.max(0, MIN_REDEMPTION_THRESHOLD - activeCoins);
    const progressPercentage = Math.min(100, Math.floor((activeCoins / MIN_REDEMPTION_THRESHOLD) * 100));

    // Find next expiring active coin batch
    const nextExpiringBatch = await CommissionLog.findOne({
      userId,
      status: "ACTIVE",
      expiresAt: { $gt: now }
    }).sort({ expiresAt: 1 });

    // Fetch history logs
    const historyLogs = await CommissionLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      isMember: isMemberActive,
      membershipPlanName: user.membershipPlanName || "None",
      membershipExpiresAt: user.membershipExpiresAt,
      commissionCoins: activeCoins,
      minThreshold: MIN_REDEMPTION_THRESHOLD,
      canRedeem,
      coinsNeededToRedeem,
      progressPercentage,
      resetDays: RESET_EXPIRATION_DAYS,
      nextExpiringAt: nextExpiringBatch?.expiresAt || null,
      historyLogs
    });

  } catch (error) {
    console.error("Get membership status error:", error);
    res.status(500).json({ success: false, msg: "Failed to load membership details" });
  }
};

/**
 * Helper: Award 1% Commission Coins to User when order is completed.
 */
export const awardOrderCommissionCoins = async (userId, orderId, totalAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const now = new Date();
    const isMemberActive = Boolean(user.isMember && user.membershipExpiresAt && new Date(user.membershipExpiresAt) > now);

    if (!isMemberActive) {
      // Non-members do not earn commission coins
      return null;
    }

    // Calculate 1% Commission Coins
    const coinsEarned = Math.floor((Number(totalAmount) || 0) * 0.01);
    if (coinsEarned <= 0) return null;

    // 45-Day Expiration Reset Timer
    const expiresAt = new Date(now.getTime() + RESET_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    // Create Commission Log Batch
    const log = await CommissionLog.create({
      userId,
      orderId,
      orderTotal: totalAmount,
      coinsEarned,
      coinsRemaining: coinsEarned,
      earnedAt: now,
      expiresAt,
      status: "ACTIVE",
      type: "EARNED_ORDER_COMMISSION",
      note: `Earned 1% commission coins on order total ₹${totalAmount}`
    });

    // Update user balance
    await processCoinExpirations(userId);

    return { coinsEarned, expiresAt };
  } catch (error) {
    console.error("Award commission coins error:", error);
    return null;
  }
};

/**
 * POST /api/membership/redeem-coins
 * Checkout Helper: Validates 150-coin threshold and applies redemption.
 */
export const validateAndRedeemCoins = async (req, res) => {
  try {
    const userId = req.user._id;
    const { coinsToRedeem } = req.body;

    const user = await User.findById(userId);
    const now = new Date();
    const isMemberActive = Boolean(user.isMember && user.membershipExpiresAt && new Date(user.membershipExpiresAt) > now);

    if (!isMemberActive) {
      return res.status(400).json({
        success: false,
        msg: "Only active Membership Plan members can earn and redeem Commission Coins."
      });
    }

    // Clean up expired coins
    const activeCoins = await processCoinExpirations(userId);

    if (activeCoins < MIN_REDEMPTION_THRESHOLD) {
      return res.status(400).json({
        success: false,
        msg: `You have ${activeCoins} coins. A minimum threshold of ${MIN_REDEMPTION_THRESHOLD} Commission Coins is required to redeem at checkout.`
      });
    }

    const requested = Number(coinsToRedeem) || activeCoins;
    const redeemAmount = Math.min(activeCoins, requested);

    res.status(200).json({
      success: true,
      msg: `Unlocked! You can redeem ${redeemAmount} Commission Coins for ₹${redeemAmount} discount.`,
      availableCoins: activeCoins,
      redeemAmount,
      discountRupees: redeemAmount
    });

  } catch (error) {
    console.error("Redeem coins error:", error);
    res.status(500).json({ success: false, msg: "Failed to validate coin redemption" });
  }
};

/**
 * Admin: Grant or Revoke User Membership
 */
export const adminUpdateUserMembership = async (req, res) => {
  try {
    const { userId, isMember, days = 365, planName = "OwnFresh Prime Membership" } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.isMember = Boolean(isMember);
    if (isMember) {
      user.membershipPlanName = planName;
      user.membershipExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else {
      user.membershipExpiresAt = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      msg: `User membership updated successfully.`,
      user
    });
  } catch (error) {
    console.error("Admin update membership error:", error);
    res.status(500).json({ success: false, msg: "Failed to update user membership" });
  }
};

/**
 * Admin: Get Full Prime 1% Membership Dashboard Overview
 */
export const adminGetMembershipDashboard = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ isMember: true });

    // Aggregate total coins earned, active, and redeemed
    const logs = await CommissionLog.find({});

    let totalCoinsIssued = 0;
    let totalCoinsActive = 0;
    let totalCoinsRedeemed = 0;
    let totalCoinsExpired = 0;

    for (const log of logs) {
      if (log.type === "EARNED_ORDER_COMMISSION") {
        totalCoinsIssued += log.coinsEarned || 0;
      }
      if (log.status === "ACTIVE") {
        totalCoinsActive += log.coinsRemaining || 0;
      }
      if (log.type === "REDEEMED_CHECKOUT" || log.status === "REDEEMED") {
        totalCoinsRedeemed += log.coinsEarned || 0;
      }
      if (log.status === "EXPIRED" || log.type === "RESET_EXPIRED") {
        totalCoinsExpired += log.coinsEarned || 0;
      }
    }

    // Fetch enrolled users list
    const members = await User.find({ isMember: true })
      .select("fullName email mobile isMember membershipPlanName membershipExpiresAt commissionCoins createdAt")
      .sort({ updatedAt: -1 })
      .limit(50);

    // Fetch recent 30 audit logs with user info
    const recentLogs = await CommissionLog.find({})
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(30);

    // Fetch active plan
    const plan = await MembershipPlan.findOne({ status: "Active" });

    res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        totalCoinsIssued,
        totalCoinsActive,
        totalCoinsRedeemed,
        totalCoinsExpired
      },
      members,
      recentLogs,
      plan
    });
  } catch (error) {
    console.error("Admin membership dashboard error:", error);
    res.status(500).json({ success: false, msg: "Failed to load admin membership dashboard" });
  }
};

/**
 * Admin: Update Membership Plan Details (Price, Description, Features)
 */
export const adminUpdatePlan = async (req, res) => {
  try {
    const { planId, name, price, description, features } = req.body;

    let plan = await MembershipPlan.findById(planId);
    if (!plan) {
      plan = await MembershipPlan.findOne({});
    }

    if (!plan) {
      plan = new MembershipPlan();
    }

    if (name) plan.name = name;
    if (price) plan.price = Number(price);
    if (description) plan.description = description;
    if (features && Array.isArray(features)) plan.features = features;

    await plan.save();

    res.status(200).json({
      success: true,
      msg: "Membership Plan configuration updated successfully!",
      plan
    });
  } catch (error) {
    console.error("Admin update plan error:", error);
    res.status(500).json({ success: false, msg: "Failed to update plan" });
  }
};
