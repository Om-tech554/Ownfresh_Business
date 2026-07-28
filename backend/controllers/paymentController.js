import crypto from "crypto";
import axios from "axios";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Coupon from "../models/couponModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import CommissionLog from "../models/commissionLogModel.js";
import { sendOrderConfirmationMail } from "../utils/mail.js";
import { sendOrderConfirmationSms } from "../utils/sms.js";
import { sendOrderConfirmationWhatsApp } from "../utils/whatsapp.js";
import { awardOrderCommissionCoins } from "./membershipController.js";

// --- PHONEPE CONFIGURATION ---
const isPlaceholder = (val) => !val || val.includes("your_") || val.includes("placeholder") || val.includes("your-");

const PHONEPE_MERCHANT_ID = !isPlaceholder(process.env.PHONEPE_MERCHANT_ID)
  ? process.env.PHONEPE_MERCHANT_ID
  : "PGTESTPAYUAT86";

const rawSaltKey = !isPlaceholder(process.env.PHONEPE_SALT_KEY)
  ? process.env.PHONEPE_SALT_KEY
  : "96434309-7796-489d-8924-ab56988a6076";

const decodeIfBase64 = (str) => {
  if (!str) return str;
  const trimmed = str.trim();
  if (trimmed.length > 40 && !trimmed.includes("-")) {
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
      if (decoded.includes("-")) return decoded;
    } catch (e) {}
  }
  return trimmed;
};

const PHONEPE_SALT_KEY = decodeIfBase64(rawSaltKey);

const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

const isTestMerchant = (merchantId) => {
  if (!merchantId) return true;
  const m = merchantId.toUpperCase();
  return m.includes("PGTEST") || m.includes("TEST") || m.includes("UAT");
};

// PhonePe V2 OAuth & V1 Dual Client Helpers
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || "SU2607231511279645375609";
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || "f6728113-19a1-4cbc-8054-8bb8ab6d5377";

let cachedOAuthToken = null;
let oAuthTokenExpiry = 0;

const getPhonePeV2AuthToken = async (clientId, clientSecret, isProd) => {
  const now = Date.now();
  if (cachedOAuthToken && oAuthTokenExpiry > now + 60000) {
    return cachedOAuthToken;
  }

  const authHost = isProd
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/identity-manager/v1/oauth/token";

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("client_version", "1");
  params.append("grant_type", "client_credentials");

  const response = await axios.post(authHost, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  if (response.data && (response.data.access_token || response.data.token)) {
    const token = response.data.access_token || response.data.token;
    const expiresIn = response.data.expires_in || 3600;
    cachedOAuthToken = token;
    oAuthTokenExpiry = now + (expiresIn * 1000);
    return token;
  }
  throw new Error(response.data?.message || response.data?.msg || "Failed to obtain PhonePe OAuth Token");
};

const PHONEPE_PAY_ENDPOINT = "/pg/v1/pay";
const PHONEPE_STATUS_ENDPOINT = "/pg/v1/status";

/**
 * INITIATE PHONEPE PAYMENT (FOR ORDERS)
 * Prepares the payload, calculates SHA256 X-VERIFY header, and returns the PhonePe redirect URL.
 */
export const initiatePhonePePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, msg: "Order ID is required" });
    }

    const order = await Order.findById(orderId).populate("user", "fullName email mobile");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // PhonePe expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const merchantTransactionId = order._id.toString();
    const merchantUserId = order.user._id.toString();

    const host = req.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocal ? "http" : "https";

    const backendHost = `${protocol}://${host}`;
    const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${backendHost}/api/payment/phonepe-callback`;

    const origin = req.get("origin") || req.get("referer") || "";
    const isClientLocal = isLocal || origin.includes("localhost") || origin.includes("127.0.0.1");

    let frontendHost;
    if (isClientLocal && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
      const match = origin.match(/(https?:\/\/[^\/]+)/);
      frontendHost = match ? match[1] : "http://localhost:5173";
    } else {
      frontendHost = process.env.FRONTEND_URL || backendHost;
    }

    if (!isClientLocal && frontendHost.startsWith("http://")) {
      frontendHost = frontendHost.replace("http://", "https://");
    }
    const redirectUrl = `${frontendHost}/order-success?orderId=${order._id}`;

    const rawMobile = order.deliveryAddress?.phone || order.user?.mobile || "";
    const digitsOnly = rawMobile.replace(/\D/g, "");
    const cleanMobile = (digitsOnly.length >= 10) ? digitsOnly.slice(-10) : "9999999999";

    // PhonePe V2 Standard Checkout API (Official V2 Flow as per PhonePe Support)
    const isProd = (process.env.PHONEPE_ENV || "").toLowerCase() === "production";
    const v2PayUrl = isProd
      ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

    const v2Payload = {
      merchantOrderId: merchantTransactionId,
      amount: amountInPaise,
      expireAfter: 1800,
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl
        }
      }
    };

    let redirectUrlFromPhonePe = null;
    let v2Success = false;

    try {
      console.log(`🚀 Initiating PhonePe V2 Payment on ${v2PayUrl}...`);
      const token = await getPhonePeV2AuthToken(PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, isProd);
      
      const v2Res = await axios.post(v2PayUrl, v2Payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${token}`
        }
      });

      console.log("PhonePe V2 Response Data:", v2Res.data);

      redirectUrlFromPhonePe = v2Res.data?.redirectUrl || 
                               v2Res.data?.data?.redirectUrl || 
                               v2Res.data?.data?.instrumentResponse?.redirectInfo?.url ||
                               v2Res.data?.payload?.redirectUrl;

      if (v2Res.data && (v2Res.data.state === "PENDING" || v2Res.data.success || redirectUrlFromPhonePe)) {
        v2Success = true;
      }
    } catch (v2Error) {
      console.error("⚠️ PhonePe V2 API Call Error:", v2Error.message, v2Error.response?.data);
      // If V2 returns error, attempt V1 legacy fallback
      try {
        console.log(`⚠️ Trying V1 Legacy fallback...`);
        const legacyTargetUrl = isProd
          ? "https://api.phonepe.com/apis/hermes/pg/v1/pay"
          : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

        const legacyPayload = {
          merchantId: PHONEPE_MERCHANT_ID,
          merchantTransactionId,
          merchantUserId,
          amount: amountInPaise,
          redirectUrl,
          redirectMode: "REDIRECT",
          callbackUrl,
          mobileNumber: cleanMobile,
          paymentInstrument: { type: "PAY_PAGE" }
        };

        const base64Payload = Buffer.from(JSON.stringify(legacyPayload)).toString("base64");
        const stringToHash = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
        const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
        const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

        const v1Res = await axios.post(
          legacyTargetUrl,
          { request: base64Payload },
          { headers: { "Content-Type": "application/json", "X-VERIFY": checksum } }
        );

        if (v1Res.data && v1Res.data.success) {
          redirectUrlFromPhonePe = v1Res.data.data.instrumentResponse.redirectInfo.url;
          v2Success = true;
        }
      } catch (v1Err) {
        console.error("⚠️ V1 Legacy fallback also failed:", v1Err.message, v1Err.response?.data);
        throw v2Error; // Re-throw primary V2 error for detailed message
      }
    }

    if (v2Success && redirectUrlFromPhonePe) {
      return res.status(200).json({
        success: true,
        redirectUrl: redirectUrlFromPhonePe,
        merchantTransactionId
      });
    } else {
      return res.status(400).json({
        success: false,
        msg: "Failed to obtain checkout URL from PhonePe",
      });
    }
  } catch (error) {
    console.error("PhonePe Payment Initiation Error:", error.message, error.response?.data);
    const detailMsg = error.response?.data?.message || error.response?.data?.msg || error.message;
    const isPendingKey = detailMsg.toLowerCase().includes("key_not_configured") || detailMsg.toLowerCase().includes("key not found") || error.response?.status === 400;
    
    const userMsg = isPendingKey 
      ? `PhonePe Account Status is Pending Activation. PhonePe will enable live payments once account review completes. (Details: ${detailMsg})`
      : `Payment initiation failed: ${detailMsg}`;

    res.status(400).json({
      success: false,
      msg: userMsg,
      error: error.response?.data || error.message
    });
  }
};

/**
 * PHONEPE WEBHOOK CALLBACK (S2S FOR ORDERS) - V2 Format
 * PhonePe V2 sends JSON: { event, payload: { merchantOrderId, state, ... } }
 * Event types: checkout.order.completed | checkout.order.failed
 */
export const phonepeCallback = async (req, res) => {
  try {
    const body = req.body;

    if (!body) {
      return res.status(400).json({ success: false, msg: "Missing webhook payload" });
    }

    console.log("PhonePe V2 Webhook received:", JSON.stringify(body));

    // --- PhonePe V2 JSON Webhook Format ---
    if (body.event && body.payload) {
      const { event, payload } = body;
      const merchantOrderId = payload?.merchantOrderId || payload?.orderId;
      const state = payload?.state;

      if (!merchantOrderId) {
        return res.status(400).json({ success: false, msg: "Missing merchantOrderId in webhook" });
      }

      const order = await Order.findById(merchantOrderId).populate("user", "fullName email mobile");
      if (!order) {
        console.error(`Order not found for merchantOrderId: ${merchantOrderId}`);
        return res.status(404).json({ success: false, msg: "Order not found" });
      }

      if (order.paymentStatus === "completed") {
        return res.status(200).json({ success: true, msg: "Order already completed" });
      }

      if (event === "checkout.order.completed" && state === "COMPLETED") {
        order.paymentStatus = "completed";
        order.phonePeTransactionId = payload?.transactionId || payload?.paymentDetails?.[0]?.transactionId;
        order.phonePeMerchantTransactionId = merchantOrderId;
        await order.save();

        // Deduct wallet balance if applicable
        if (order.walletDeductedAmount > 0) {
          let wallet = await Wallet.findOne({ userId: order.user._id });
          if (wallet && wallet.balance >= order.walletDeductedAmount) {
            wallet.balance -= order.walletDeductedAmount;
            wallet.totalRedeemed += order.walletDeductedAmount;
            await wallet.save();
            await Transaction.create({
              userId: order.user._id,
              type: "REDEEM",
              amount: order.walletDeductedAmount,
              description: `Paid for order #${order._id} using wallet balance`,
              status: "SUCCESS"
            });
          }
        }

        // Increment Coupon usedCount if applicable
        if (order.couponCode) {
          const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
          if (coupon) { coupon.usedCount += 1; await coupon.save(); }
        }

        // Award Commission Coins
        try { await awardOrderCommissionCoins(order.user._id, order._id, order.totalAmount); }
        catch (err) { console.error("Error awarding commission coins:", err.message); }

        // Send notifications
        try { await sendOrderConfirmationMail(order); } catch (err) { console.error("Email error:", err.message); }
        try { await sendOrderConfirmationSms(order); } catch (err) { console.error("SMS error:", err.message); }
        try { await sendOrderConfirmationWhatsApp(order); } catch (err) { console.error("WhatsApp error:", err.message); }

        return res.status(200).json({ success: true, msg: "Payment completed successfully" });
      } else {
        order.paymentStatus = "failed";
        await order.save();
        return res.status(200).json({ success: true, msg: `Payment ${state || "failed"}` });
      }
    }

    // --- PhonePe V1 Legacy Webhook Format (base64 response field) ---
    const { response } = body;
    if (response) {
      const receivedChecksum = req.headers["x-verify"];
      const stringToHash = response + PHONEPE_SALT_KEY;
      const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
      const expectedChecksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

      if (receivedChecksum && receivedChecksum !== expectedChecksum) {
        console.error("⚠️ PhonePe V1 Callback Signature Verification Failed");
        return res.status(400).json({ success: false, msg: "Invalid signature" });
      }

      const callbackData = JSON.parse(Buffer.from(response, "base64").toString("utf-8"));
      console.log("PhonePe V1 Callback Data:", callbackData);
      const { success: v1Success, code, data } = callbackData;
      const { merchantTransactionId, transactionId } = data || {};

      if (!merchantTransactionId) {
        return res.status(400).json({ success: false, msg: "Missing transaction ID" });
      }

      const order = await Order.findById(merchantTransactionId).populate("user", "fullName email mobile");
      if (!order) return res.status(404).json({ success: false, msg: "Order not found" });
      if (order.paymentStatus === "completed") return res.status(200).json({ success: true, msg: "Already completed" });

      if (v1Success && code === "PAYMENT_SUCCESS") {
        order.paymentStatus = "completed";
        order.phonePeTransactionId = transactionId;
        await order.save();
        try { await sendOrderConfirmationMail(order); } catch (e) {}
        try { await sendOrderConfirmationSms(order); } catch (e) {}
        try { await sendOrderConfirmationWhatsApp(order); } catch (e) {}
        return res.status(200).json({ success: true, msg: "Payment completed" });
      } else {
        order.paymentStatus = "failed";
        await order.save();
        return res.status(200).json({ success: true, msg: "Payment failed" });
      }
    }

    return res.status(400).json({ success: false, msg: "Unrecognized webhook format" });
  } catch (error) {
    console.error("PhonePe Webhook Callback Error:", error);
    res.status(500).json({ success: false, msg: "Webhook processing error", error: error.message });
  }
};

/**
 * CHECK PHONEPE STATUS (FOR ORDERS)
 * Uses PhonePe V2 Order Status API (checkout/v2/order/{merchantOrderId}/status) with OAuth Bearer Token.
 */
export const checkPhonePeStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, msg: "Order ID is required" });
    }

    const order = await Order.findById(orderId).populate("user", "fullName email mobile");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // COD orders bypass PhonePe API check
    if (order.PaymentMethod === "cod") {
      return res.status(200).json({
        success: true,
        paymentStatus: order.paymentStatus,
        order
      });
    }

    // If already marked completed, return success immediately
    if (order.paymentStatus === "completed") {
      return res.status(200).json({
        success: true,
        paymentStatus: "completed",
        order
      });
    }

    const isProd = (process.env.PHONEPE_ENV || "").toLowerCase() === "production";
    let isPaymentSuccess = false;
    let rawStatusData = null;

    // 1) Try V2 Order Status API
    try {
      const token = await getPhonePeV2AuthToken(PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, isProd);
      const v2StatusUrl = isProd
        ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status`
        : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${orderId}/status`;

      console.log(`🔍 Checking PhonePe V2 Status on ${v2StatusUrl}...`);
      const v2Res = await axios.get(v2StatusUrl, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${token}`
        }
      });

      rawStatusData = v2Res.data;
      console.log("PhonePe V2 Status Response:", rawStatusData);

      // V2 status response: { orderId, state, expireAt, ... }
      // Use payload.state if present, fallback to root state
      const state = rawStatusData?.payload?.state || rawStatusData?.state;
      if (state === "COMPLETED") {
        isPaymentSuccess = true;
      }
    } catch (v2StatusErr) {
      console.error("⚠️ V2 Status API Error:", v2StatusErr.message, v2StatusErr.response?.data);

      // Fallback: Try V1 Status Check
      try {
        const urlPath = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${orderId}`;
        const stringToHash = urlPath + PHONEPE_SALT_KEY;
        const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
        const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

        const legacyBaseUrl = isProd ? "https://api.phonepe.com/apis/hermes" : "https://api-preprod.phonepe.com/apis/pg-sandbox";
        const v1Res = await axios.get(`${legacyBaseUrl}${urlPath}`, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
          }
        });

        rawStatusData = v1Res.data;
        if (v1Res.data && v1Res.data.success && v1Res.data.code === "PAYMENT_SUCCESS") {
          isPaymentSuccess = true;
        }
      } catch (v1StatusErr) {
        console.error("⚠️ V1 Status Fallback also failed:", v1StatusErr.message);
      }
    }

    if (isPaymentSuccess) {
      order.paymentStatus = "completed";
      await order.save();

      return res.status(200).json({
        success: true,
        paymentStatus: "completed",
        order
      });
    } else {
      return res.status(200).json({
        success: false,
        paymentStatus: order.paymentStatus,
        msg: rawStatusData?.message || rawStatusData?.msg || "Payment is pending or failed",
        statusDetails: rawStatusData
      });
    }
  } catch (error) {
    console.error("Error in checkPhonePeStatus:", error.message);
    res.status(500).json({ success: false, msg: "Failed to check PhonePe status", error: error.message });
  }
};
