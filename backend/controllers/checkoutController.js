import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Coupon from "../models/couponModel.js";
import ReferralCode from "../models/referralCodeModel.js";
import ReferralUsage from "../models/referralUsageModel.js";
import crypto from "crypto";
import { sendOrderConfirmationMail } from "../utils/mail.js";
import { sendOrderConfirmationSms } from "../utils/sms.js";
import { sendOrderConfirmationWhatsApp } from "../utils/whatsapp.js";
import { awardOrderCommissionCoins } from "./membershipController.js";


// Helper function to generate unique custom order ID without duplicate key collisions
const generateUniqueCustomOrderId = async () => {
  const year = new Date().getFullYear();
  const yearCode = `${year.toString().slice(0, 2)}${year.toString().slice(-1)}`;
  let count = await Order.countDocuments();
  let sequence = count + 1;
  let customId = `MOF/${yearCode}/${String(sequence).padStart(4, "0")}`;
  
  let attempts = 0;
  while ((await Order.exists({ customOrderId: customId })) && attempts < 50) {
    sequence += 1;
    customId = `MOF/${yearCode}/${String(sequence).padStart(4, "0")}`;
    attempts += 1;
  }
  
  if (attempts >= 50) {
    customId = `MOF/${yearCode}/${Date.now().toString().slice(-6)}`;
  }
  return customId;
};

// CREATE ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      paymentMethod, 
      deliveryAddress, 
      totalAmount, 
      discountAmount, 
      couponCode,
      referralCode,
      useWallet,
      cgst,
      sgst,
      taxAmount,
      phonePeTransactionId
    } = req.body;

    const targetUserId = req.userId || userId;

    // 1) Validate essential fields
    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ msg: "Valid User ID is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Cart items are required to place an order" });
    }
    if (!paymentMethod || !['cod', 'online'].includes(paymentMethod)) {
      return res.status(400).json({ msg: "Valid payment method (cod/online) is required" });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ msg: "Delivery address is required" });
    }
    if (totalAmount === undefined || totalAmount === null || isNaN(Number(totalAmount))) {
      return res.status(400).json({ msg: "Valid total amount is required" });
    }

    // 2) Check User Exists
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Validate Referral Code if provided
    let referralCodeRecord = null;
    if (referralCode && String(referralCode).trim() !== "") {
      const cleanRefCode = String(referralCode).trim().toUpperCase();
      referralCodeRecord = await ReferralCode.findOne({ code: cleanRefCode });
      if (!referralCodeRecord) {
        return res.status(400).json({ msg: "Referral code does not exist" });
      }

      if (referralCodeRecord.userId && referralCodeRecord.userId.toString() === targetUserId.toString()) {
        return res.status(400).json({ msg: "You cannot use your own referral code" });
      }

      if (user.hasRedeemedReferral) {
        return res.status(400).json({ msg: "You have already redeemed a referral code before" });
      }

      const existingUsage = await ReferralUsage.findOne({
        referredUserId: targetUserId,
        status: { $in: ["PENDING", "APPROVED"] }
      });
      if (existingUsage) {
        return res.status(400).json({ msg: "You have already redeemed a referral code before" });
      }

      const priorCompletedOrder = await Order.findOne({ user: targetUserId, paymentStatus: "completed" });
      if (priorCompletedOrder) {
        return res.status(400).json({ msg: "Referral code can only be applied before your first purchase" });
      }
    }

    let finalPayableAmount = Math.max(0, Number(totalAmount));
    let walletDeducted = 0;

    const isInstantOrder = (paymentMethod === 'cod');

    // 3) Wallet Deduction Calculation
    if (useWallet) {
      let wallet = await Wallet.findOne({ userId: targetUserId });
      if (!wallet) {
        wallet = await Wallet.create({ userId: targetUserId, balance: 0, totalEarned: 0, totalRedeemed: 0 });
      }

      if (wallet.balance > 0) {
        walletDeducted = Math.min(wallet.balance, finalPayableAmount);
        finalPayableAmount -= walletDeducted;

        // Perform instant deduction if applicable
        if (isInstantOrder || finalPayableAmount <= 0) {
          wallet.balance -= walletDeducted;
          wallet.totalRedeemed += walletDeducted;
          await wallet.save();

          // Create transaction log
          await Transaction.create({
            userId: targetUserId,
            type: "REDEEM",
            amount: walletDeducted,
            description: `Paid for order using wallet balance`,
            status: "SUCCESS"
          });
        }
      }
    }

    // 4) Coupon Usage Calculation
    if (couponCode && String(couponCode).trim() !== "") {
      const cleanCouponCode = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCouponCode });
      if (coupon) {
        if (isInstantOrder || finalPayableAmount <= 0) {
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Determine initial payment status
    let paymentStatus = 'pending';
    if (finalPayableAmount <= 0) {
      paymentStatus = 'completed';
    } else if (paymentMethod === 'online') {
      paymentStatus = 'pending';
    }

    // Map items & sanitize invalid ObjectIds
    const orderItems = items.map(item => {
      let pId = item.productId;
      let vId = item.variantId;

      // Extract from composite _id if needed
      if ((!pId || !vId) && typeof item._id === 'string' && item._id.includes('_')) {
        const parts = item._id.split('_');
        if (!pId) pId = parts[0];
        if (!vId) vId = parts[1];
      }

      return {
        productId: pId && mongoose.Types.ObjectId.isValid(pId) ? pId : null,
        variantId: vId && mongoose.Types.ObjectId.isValid(vId) ? vId : null,
        name: item.name || item.title || "Product",
        variantName: item.variantName || "",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || (Array.isArray(item.images) ? item.images[0] : item.images) || ""
      };
    });

    // Generate unique custom order ID without collisions
    const customOrderId = await generateUniqueCustomOrderId();

    // 5) Create Order logic
    const order = await Order.create({
      customOrderId,
      user: targetUserId,
      items: orderItems, 
      PaymentMethod: paymentMethod,
      paymentStatus,
      status: 'pending',
      deliveryAddress,
      totalAmount: finalPayableAmount,
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",
      referralCode: referralCode ? String(referralCode).trim().toUpperCase() : "",
      referralStatus: referralCode ? "PENDING" : "NONE",
      rewardCredited: false,
      cgst: Number(cgst) || 0,
      sgst: Number(sgst) || 0,
      taxAmount: Number(taxAmount) || 0,
      phonePeTransactionId: phonePeTransactionId || undefined,
      walletDeductedAmount: walletDeducted
    });

    // Create Referral Usage record and update User if referral code is applied
    if (referralCode && referralCodeRecord) {
      const cleanRefCode = String(referralCode).trim().toUpperCase();
      await ReferralUsage.create({
        referralCode: cleanRefCode,
        referrerUserId: referralCodeRecord.userId,
        referrerId: referralCodeRecord.userId,
        referredUserId: targetUserId,
        referralCodeId: referralCodeRecord._id,
        orderId: order._id,
        status: "PENDING",
        rewardAmount: 100,
        rewardPoints: 100,
        refereeRewardAmount: 50
      });

      // Mark the user as having redeemed a referral
      user.hasRedeemedReferral = true;
      await user.save();
    }

    // Award 1% Commission Credit Coins to member (if active member)
    try {
      const grossAmount = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
      await awardOrderCommissionCoins(targetUserId, order._id, finalPayableAmount > 0 ? finalPayableAmount : grossAmount);
    } catch (commErr) {
      console.error("Failed to award membership commission coins:", commErr);
    }

    // Respond immediately to client to prevent Render 30-second gateway timeouts & ERR_CONNECTION_RESET
    res.status(201).json({
      success: true,
      msg: "Order placed successfully",
      order,
    });

    // Send confirmation notifications asynchronously in background
    if (isInstantOrder || finalPayableAmount <= 0) {
      setImmediate(async () => {
        try {
          const populatedOrder = await Order.findById(order._id).populate("user", "fullName email mobile");
          if (populatedOrder) {
            sendOrderConfirmationMail(populatedOrder).catch(err => console.error("Error sending order confirmation email:", err.message));
            sendOrderConfirmationSms(populatedOrder).catch(err => console.error("Error sending order confirmation SMS:", err.message));
            sendOrderConfirmationWhatsApp(populatedOrder).catch(err => console.error("Error sending order confirmation WhatsApp:", err.message));
          }
        } catch (err) {
          console.error("Error during COD/zero-amount background notifications:", err.message);
        }
      });
    }

  } catch (error) {
    console.error("Order creation error details:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ msg: `Validation Error: ${error.message}`, error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Duplicate order ID detected. Please try placing your order again.", error: error.message });
    }
    res.status(500).json({ msg: "Failed to create order on server", error: error.message });
  }
};
