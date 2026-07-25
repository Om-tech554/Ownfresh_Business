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

    let frontendHost = process.env.FRONTEND_URL || backendHost;
    if (!isLocal && frontendHost.startsWith("http://")) {
      frontendHost = frontendHost.replace("http://", "https://");
    }
    const redirectUrl = `${frontendHost}/order-success?orderId=${order._id}`;

    const rawMobile = order.deliveryAddress?.phone || order.user?.mobile || "";
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

    // Base64 encode payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    // X-VERIFY Checksum: SHA256(Base64_Payload + API_Endpoint + Salt_Key) + "###" + Salt_Index
    const stringToHash = base64Payload + PHONEPE_PAY_ENDPOINT + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

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
      console.error("PhonePe API Error Response:", response.data);
      return res.status(400).json({
        success: false,
        msg: response.data?.message || response.data?.msg || "Failed to initiate payment with PhonePe",
        error: response.data
      });
    }
  } catch (error) {
    console.error("PhonePe Payment Initiation Error:", error.message, error.response?.data);
    const detailMsg = error.response?.data?.message || error.response?.data?.msg || error.message;
    res.status(400).json({
      success: false,
      msg: `Payment initiation failed: ${detailMsg}`,
      error: error.message
    });
  }
};

/**
 * PHONEPE WEBHOOK CALLBACK (S2S FOR ORDERS)
 * Called by PhonePe servers to notify us of payment status changes.
 */
export const phonepeCallback = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ success: false, msg: "Missing response payload" });
    }

    // Verify Checksum: SHA256(Response_Base64 + Salt_Key) + "###" + Salt_Index
    const receivedChecksum = req.headers["x-verify"];
    const stringToHash = response + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const expectedChecksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

    if (receivedChecksum && receivedChecksum !== expectedChecksum) {
      console.error("⚠️ PhonePe Callback Signature Verification Failed");
      return res.status(400).json({ success: false, msg: "Invalid signature" });
    }

    // Decode Base64 Payload
    const decodedPayloadString = Buffer.from(response, "base64").toString("utf-8");
    const callbackData = JSON.parse(decodedPayloadString);

    console.log("PhonePe S2S Callback Data received:", callbackData);

    const { success, code, data } = callbackData;
    const { merchantTransactionId, transactionId } = data || {};

    if (!merchantTransactionId) {
      return res.status(400).json({ success: false, msg: "Missing transaction ID" });
    }

    // Find the corresponding order
    const order = await Order.findById(merchantTransactionId).populate("user", "fullName email mobile");
    if (!order) {
      console.error(`Order not found for transaction ID: ${merchantTransactionId}`);
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    if (order.paymentStatus === "completed") {
      return res.status(200).json({ success: true, msg: "Order already completed" });
    }

    if (success && code === "PAYMENT_SUCCESS") {
      // 1) Mark order as paid
      order.paymentStatus = "completed";
      order.phonePeTransactionId = transactionId;
      order.phonePeMerchantTransactionId = merchantTransactionId;

      // 2) Deduct wallet balance if applicable
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

      // 3) Increment Coupon usedCount if applicable
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount += 1;
          await coupon.save();
        }
      }

      await order.save();

      // 4) Award 1% Commission Coins if user is Prime Member
      try {
        await awardOrderCommissionCoins(order.user._id, order._id, order.totalAmount);
      } catch (err) {
        console.error("Error awarding commission coins:", err.message);
      }

      // 5) Send Confirmation Email, SMS & WhatsApp
      try { await sendOrderConfirmationMail(order); } catch (err) { console.error("Email error:", err.message); }
      try { await sendOrderConfirmationSms(order); } catch (err) { console.error("SMS error:", err.message); }
      try { await sendOrderConfirmationWhatsApp(order); } catch (err) { console.error("WhatsApp error:", err.message); }

      return res.status(200).json({ success: true, msg: "Payment status updated successfully" });
    } else {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(200).json({ success: true, msg: "Payment marked as failed" });
    }
  } catch (error) {
    console.error("PhonePe Webhook Callback Error:", error);
    res.status(500).json({ success: false, msg: "Webhook processing error", error: error.message });
  }
};

/**
 * CHECK PHONEPE STATUS (FOR ORDERS)
 * Allows frontend to verify order payment status with PhonePe API directly.
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

    const executeStatusRequest = async (mId, sKey, sIndex, targetOrderId, baseUrl) => {
      const urlPath = `${PHONEPE_STATUS_ENDPOINT}/${mId}/${targetOrderId}`;
      const stringToHash = urlPath + sKey;
      const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
      const checksum = `${sha256}###${sIndex}`;

      return await axios.get(
        `${baseUrl}${urlPath}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": mId
          }
        }
      );
    };

    let response;
    try {
      response = await executeStatusRequest(
        PHONEPE_MERCHANT_ID,
        PHONEPE_SALT_KEY,
        PHONEPE_SALT_INDEX,
        orderId,
        PHONEPE_BASE_URL
      );
    } catch (apiErr) {
      const errCode = apiErr.response?.data?.code || "";
      const errMsg = apiErr.response?.data?.message || apiErr.response?.data?.msg || "";
      const isKeyProblem = errCode === "KEY_NOT_CONFIGURED" || errCode === "KEY_NOT_FOUND" || errMsg.toLowerCase().includes("key not found");
      const is404 = apiErr.response?.status === 404;

      if (is404 || isKeyProblem) {
        const altBaseUrl = PHONEPE_BASE_URL.includes("api.phonepe.com/apis/hermes")
          ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
          : "https://api.phonepe.com/apis/hermes";

        try {
          response = await executeStatusRequest(
            PHONEPE_MERCHANT_ID,
            PHONEPE_SALT_KEY,
            PHONEPE_SALT_INDEX,
            orderId,
            altBaseUrl
          );
        } catch (altErr) {
          const altCode = altErr.response?.data?.code || "";
          const altMsg = altErr.response?.data?.message || altErr.response?.data?.msg || "";
          if (altCode === "KEY_NOT_CONFIGURED" || altCode === "KEY_NOT_FOUND" || altMsg.toLowerCase().includes("key not found") || altErr.response?.status === 404) {
            console.log(`⚠️ Custom merchant key status check fallback to PGTESTPAYUAT86...`);
            response = await executeStatusRequest(
              "PGTESTPAYUAT86",
              "96434309-7796-489d-8924-ab56988a6076",
              "1",
              orderId,
              "https://api-preprod.phonepe.com/apis/pg-sandbox"
            );
          } else {
            throw altErr;
          }
        }
      } else {
        throw apiErr;
      }
    }

    if (response.data && response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      const transactionId = response.data.data.transactionId;

      // 1) Mark order as completed
      order.paymentStatus = "completed";
      order.phonePeTransactionId = transactionId;
      order.phonePeMerchantTransactionId = orderId;

      // 2) Deduct wallet balance
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

      // 3) Increment Coupon usedCount
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount += 1;
          await coupon.save();
        }
      }

      await order.save();

      // 4) Award 1% Commission Coins if user is Prime Member
      try {
        await awardOrderCommissionCoins(order.user._id, order._id, order.totalAmount);
      } catch (err) {
        console.error("Error awarding commission coins:", err.message);
      }

      // 5) Send Confirmation Email, SMS & WhatsApp
      try { await sendOrderConfirmationMail(order); } catch (err) { console.error("Email error:", err.message); }
      try { await sendOrderConfirmationSms(order); } catch (err) { console.error("SMS error:", err.message); }
      try { await sendOrderConfirmationWhatsApp(order); } catch (err) { console.error("WhatsApp error:", err.message); }

      return res.status(200).json({
        success: true,
        paymentStatus: "completed",
        order
      });
    } else {
      const currentPhonePeStatus = response.data?.code || "PENDING";

      if (["PAYMENT_ERROR", "PAYMENT_DECLINED", "TIMED_OUT"].includes(currentPhonePeStatus)) {
        order.paymentStatus = "failed";
        await order.save();
      }

      return res.status(200).json({
        success: false,
        paymentStatus: order.paymentStatus,
        phonePeCode: currentPhonePeStatus,
        msg: response.data?.message || "Payment is pending or failed"
      });
    }
  } catch (error) {
    console.error("PhonePe Fallback Status Check Error:", error.message, error.response?.data);
    res.status(500).json({
      success: false,
      msg: "Server error during status check",
      error: error.message
    });
  }
};
