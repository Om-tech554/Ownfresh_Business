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
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    // 1) Validate
    if (!userId || !items || items.length === 0 || !paymentMethod || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2) Check User Exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Validate Referral Code if provided
    let referralCodeRecord = null;
    if (referralCode) {
      referralCodeRecord = await ReferralCode.findOne({ code: referralCode.toUpperCase() });
      if (!referralCodeRecord) {
        return res.status(400).json({ msg: "Referral code does not exist" });
      }

      if (referralCodeRecord.userId.toString() === userId.toString()) {
        return res.status(400).json({ msg: "You cannot use your own referral code" });
      }

      if (user.hasRedeemedReferral) {
        return res.status(400).json({ msg: "You have already redeemed a referral code before" });
      }

      const existingUsage = await ReferralUsage.findOne({
        referredUserId: userId,
        status: { $in: ["PENDING", "APPROVED"] }
      });
      if (existingUsage) {
        return res.status(400).json({ msg: "You have already redeemed a referral code before" });
      }

      const priorCompletedOrder = await Order.findOne({ user: userId, paymentStatus: "completed" });
      if (priorCompletedOrder) {
        return res.status(400).json({ msg: "Referral code can only be applied before your first purchase" });
      }
    }

    let finalPayableAmount = Number(totalAmount);
    let walletDeducted = 0;

    // We only execute state changes (wallet balance deduction and coupon count increment)
    // immediately if it is COD or if the final amount becomes 0 (fully paid by wallet/coupons).
    // For online payments with remaining balances, these changes are executed in the webhook callback.
    const isInstantOrder = (paymentMethod === 'cod');

    // 3) Wallet Deduction Calculation
    if (useWallet) {
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0, totalEarned: 0, totalRedeemed: 0 });
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
            userId,
            type: "REDEEM",
            amount: walletDeducted,
            description: `Paid for order using wallet balance`,
            status: "SUCCESS"
          });
        }
      }
    }

    // 4) Coupon Usage Calculation
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
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
      /* Razorpay Code commented out as requested
      if (!razorpayPaymentId) {
        return res.status(400).json({ msg: "Missing Razorpay Payment ID for online payment" });
      }
      paymentStatus = 'completed'; // Paid via Razorpay
      */
      paymentStatus = 'pending';
    }

    // Map items to strip out the invalid _id from frontend and extra fields
    const orderItems = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variantName: item.variantName,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    // Generate custom sequential order ID (e.g. MOF/206/0035)
    const year = new Date().getFullYear();
    const yearCode = `${year.toString().slice(0, 2)}${year.toString().slice(-1)}`;
    const orderCount = await Order.countDocuments();
    const sequenceStr = String(orderCount + 1).padStart(4, "0");
    const customOrderId = `MOF/${yearCode}/${sequenceStr}`;

    // 5) Create Order logic
    const order = await Order.create({
      customOrderId,
      user: userId,
      items: orderItems, 
      PaymentMethod: paymentMethod,
      paymentStatus,
      status: 'pending',
      deliveryAddress,
      totalAmount: finalPayableAmount,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || "",
      referralCode: referralCode ? referralCode.toUpperCase() : "",
      referralStatus: referralCode ? "PENDING" : "NONE",
      rewardCredited: false,
      cgst: cgst || 0,
      sgst: sgst || 0,
      taxAmount: taxAmount || 0,
      transactionId: razorpayPaymentId || undefined,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      walletDeductedAmount: walletDeducted
    });

    // Create Referral Usage record and update User if referral code is applied
    if (referralCode && referralCodeRecord) {
      await ReferralUsage.create({
        referralCode: referralCode.toUpperCase(),
        referrerUserId: referralCodeRecord.userId,
        referrerId: referralCodeRecord.userId,
        referredUserId: userId,
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

    // Send confirmation notifications for COD or zero-amount orders
    if (isInstantOrder || finalPayableAmount <= 0) {
      try {
        const populatedOrder = await Order.findById(order._id).populate("user", "fullName email mobile");
        if (populatedOrder) {
          try {
            await sendOrderConfirmationMail(populatedOrder);
          } catch (err) {
            console.error("Error sending order confirmation email for COD/zero-amount order:", err.message);
          }
          try {
            await sendOrderConfirmationSms(populatedOrder);
          } catch (err) {
            console.error("Error sending order confirmation SMS for COD/zero-amount order:", err.message);
          }
          try {
            await sendOrderConfirmationWhatsApp(populatedOrder);
          } catch (err) {
            console.error("Error sending order confirmation WhatsApp for COD/zero-amount order:", err.message);
          }
        }
      } catch (err) {
        console.error("Error during COD/zero-amount notifications:", err);
      }
    }

    res.status(201).json({
      success: true,
      msg: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
