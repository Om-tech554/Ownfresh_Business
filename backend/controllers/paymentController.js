import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Coupon from "../models/couponModel.js";
import { sendOrderConfirmationMail } from "../utils/mail.js";
import { sendOrderConfirmationSms } from "../utils/sms.js";
import { sendOrderConfirmationWhatsApp } from "../utils/whatsapp.js";


// --- PHONEPE CONFIGURATION ---
const isPlaceholder = (val) => !val || val.includes("your_") || val.includes("placeholder") || val.includes("your-");

const PHONEPE_MERCHANT_ID = !isPlaceholder(process.env.PHONEPE_MERCHANT_ID)
  ? process.env.PHONEPE_MERCHANT_ID
  : "PGTESTPAYUAT86";

const PHONEPE_SALT_KEY = !isPlaceholder(process.env.PHONEPE_SALT_KEY)
  ? process.env.PHONEPE_SALT_KEY
  : "96434309-7796-489d-8924-ab56988a6076";

const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

const PHONEPE_ENV = (!isPlaceholder(process.env.PHONEPE_MERCHANT_ID) && process.env.PHONEPE_ENV)
  ? process.env.PHONEPE_ENV
  : "uat"; // Fallback to 'uat' for sandbox testing if using placeholders

const PHONEPE_BASE_URL = PHONEPE_ENV === "production"
  ? "https://api.phonepe.com/apis/pg"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const PHONEPE_PAY_ENDPOINT = "/pg/v1/pay";
const PHONEPE_STATUS_ENDPOINT = "/pg/v1/status";

/**
 * INITIATE PHONEPE PAYMENT
 * Prepares the payload, calculates the X-VERIFY header, and returns the redirect URL.
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

    // Callback webhook URL (Hit by PhonePe S2S)
    const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/api/payment/phonepe-callback`;

    // Redirect URL (User's browser landing page after payment)
    const redirectUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/order-success?orderId=${order._id}`
      : `${req.protocol}://${req.get("host")}/order-success?orderId=${order._id}`;

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId,
      amount: amountInPaise,
      redirectUrl,
      redirectMode: "GET",
      callbackUrl,
      mobileNumber: order.deliveryAddress.phone || order.user.mobile || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // Base64 encode the payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    // X-VERIFY Checksum: SHA256(Base64_Payload + API_Endpoint + Salt_Key) + "###" + Salt_Index
    const stringToHash = base64Payload + PHONEPE_PAY_ENDPOINT + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

    // Call PhonePe Pay API
    const response = await axios.post(
      `${PHONEPE_BASE_URL}${PHONEPE_PAY_ENDPOINT}`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum
        }
      }
    );

    if (response.data && response.data.success) {
      const redirectUrlFromPhonePe = response.data.data.instrumentResponse.redirectInfo.url;
      return res.status(200).json({
        success: true,
        redirectUrl: redirectUrlFromPhonePe,
        merchantTransactionId
      });
    } else {
      console.error("PhonePe API Error Response:", response.data);
      return res.status(500).json({
        success: false,
        msg: "Failed to initiate payment with PhonePe",
        error: response.data
      });
    }
  } catch (error) {
    console.error("PhonePe Payment Initiation Error:", error.message, error.response?.data);
    res.status(500).json({
      success: false,
      msg: "Server error during payment initiation",
      error: error.message
    });
  }
};

/**
 * PHONEPE WEBHOOK CALLBACK (S2S)
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

    if (receivedChecksum !== expectedChecksum) {
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

    // If order is already completed, just acknowledge the webhook
    if (order.paymentStatus === "completed") {
      return res.status(200).json({ success: true, msg: "Order already completed" });
    }

    if (success && code === "PAYMENT_SUCCESS") {
      // 1) Mark order as paid
      order.paymentStatus = "completed";
      order.razorpayPaymentId = transactionId; // Store PhonePe transaction ID in existing slot

      // 2) Deduct wallet balance (Deferred execution)
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

      // 4) Send Confirmation Email & SMS
      try {
        await sendOrderConfirmationMail(order);
      } catch (err) {
        console.error("Error sending order confirmation email:", err.message);
      }

      try {
        await sendOrderConfirmationSms(order);
      } catch (err) {
        console.error("Error sending order confirmation SMS:", err.message);
      }

      try {
        await sendOrderConfirmationWhatsApp(order);
      } catch (err) {
        console.error("Error sending order confirmation WhatsApp:", err.message);
      }

      return res.status(200).json({ success: true, msg: "Payment status updated successfully" });
    } else {
      // Mark payment as failed
      order.paymentStatus = "failed";
      await order.save();

      return res.status(200).json({ success: true, msg: "Payment failed marked on order" });
    }
  } catch (error) {
    console.error("PhonePe Webhook Callback Error:", error);
    res.status(500).json({ success: false, msg: "Webhook processing error", error: error.message });
  }
};

/**
 * CHECK PHONEPE STATUS (FALLBACK ROUTE)
 * Allows client to pull status directly if webhook lags or is blocked (e.g., local dev)
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

    // If it's a COD order, bypass PhonePe API check and return success/pending status directly
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

    // Query PhonePe status API: GET /pg/v1/status/{merchantId}/{merchantTransactionId}
    const statusUrlPath = `${PHONEPE_STATUS_ENDPOINT}/${PHONEPE_MERCHANT_ID}/${orderId}`;
    const stringToHash = statusUrlPath + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`;

    const response = await axios.get(
      `${PHONEPE_BASE_URL}${statusUrlPath}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
        }
      }
    );

    if (response.data && response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      const transactionId = response.data.data.transactionId;

      // 1) Mark order as paid
      order.paymentStatus = "completed";
      order.razorpayPaymentId = transactionId;

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

      // 3) Increment Coupon usedCount if applicable
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount += 1;
          await coupon.save();
        }
      }

      await order.save();

      // 4) Send Confirmation Email & SMS
      try {
        await sendOrderConfirmationMail(order);
      } catch (err) {
        console.error("Error sending order confirmation email:", err.message);
      }

      try {
        await sendOrderConfirmationSms(order);
      } catch (err) {
        console.error("Error sending order confirmation SMS:", err.message);
      }

      try {
        await sendOrderConfirmationWhatsApp(order);
      } catch (err) {
        console.error("Error sending order confirmation WhatsApp:", err.message);
      }

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

// ==========================================
// --- RAZORPAY CODE COMMENTED OUT AS REQUESTED ---
// ==========================================
/*
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, msg: "Amount is required" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SdpJSZtNnLHmjO",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "qwtSRoeKd9p6pjHC7dXRjrjs",
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, msg: "Some error occurred while creating Razorpay order" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, msg: "Missing required Razorpay parameters" });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        msg: "Payment has been verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Payment verification failed. Invalid signature.",
      });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};
*/
