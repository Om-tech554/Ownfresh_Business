import mongoose from "mongoose";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import ReferralCode from "../models/referralCodeModel.js";
import ReferralUsage from "../models/referralUsageModel.js";
import crypto from "crypto";
import { sendOrderConfirmationMail } from "../utils/mail.js";
import { sendOrderConfirmationSms } from "../utils/sms.js";
import { sendOrderConfirmationWhatsApp } from "../utils/whatsapp.js";
import { awardOrderCommissionCoins, processCoinExpirations } from "./membershipController.js";
import CommissionLog from "../models/commissionLogModel.js";


// Helper function to generate unique custom order ID without duplicate key collisions
const generateUniqueCustomOrderId = async (clientType = "Non-GST") => {
  const year = new Date().getFullYear();
  const yearCode = `${year.toString().slice(0, 2)}${year.toString().slice(-1)}`;
  const prefix = clientType === "GST" ? "GST" : "MOF";
  let count = await Order.countDocuments({ customOrderId: new RegExp(`^${prefix}/`) });
  let sequence = count + 1;
  let customId = `${prefix}/${yearCode}/${String(sequence).padStart(4, "0")}`;
  
  let attempts = 0;
  while ((await Order.exists({ customOrderId: customId })) && attempts < 50) {
    sequence += 1;
    customId = `${prefix}/${yearCode}/${String(sequence).padStart(4, "0")}`;
    attempts += 1;
  }
  
  if (attempts >= 50) {
    customId = `${prefix}/${yearCode}/${Date.now().toString().slice(-6)}`;
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
      useCommissionCoins,
      cgst,
      sgst,
      taxAmount,
      phonePeTransactionId,
      deliveryMethodId
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

    let walletDeducted = 0;
    let coinsDeducted = 0;

    const isInstantOrder = (paymentMethod === 'cod');
    const now = new Date();

    // 1) Recalculate true prices and totals from the database to prevent price manipulation
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ msg: "Product ID is required for each cart item" });
      }

      let price = 0;
      let variantName = item.variantName || "";
      let name = item.name || "";
      let image = item.image || "";

      // Resolve Composite ID if needed
      let pId = item.productId;
      let vId = item.variantId;
      if ((!pId || !vId) && typeof item._id === 'string' && item._id.includes('_')) {
        const parts = item._id.split('_');
        if (!pId) pId = parts[0];
        if (!vId) vId = parts[1];
      }

      if (vId && mongoose.Types.ObjectId.isValid(vId)) {
        const variant = await ProductVariant.findById(vId).populate("product");
        if (!variant) {
          return res.status(404).json({ msg: `Product variant not found` });
        }
        price = variant.salePrice !== null && variant.salePrice !== undefined ? variant.salePrice : variant.price;
        variantName = variant.name;
        name = variant.product?.name || item.name || item.title || "Product";
        image = item.image || (Array.isArray(item.images) ? item.images[0] : item.images) || variant.product?.image || "";
      } else {
        const product = await Product.findById(pId);
        if (!product) {
          return res.status(404).json({ msg: `Product not found` });
        }
        const variants = await ProductVariant.find({ product: pId, status: "Active" }).sort({ price: 1 });
        if (variants.length > 0) {
          price = variants[0].salePrice !== null && variants[0].salePrice !== undefined ? variants[0].salePrice : variants[0].price;
          variantName = variants[0].name;
          image = item.image || (Array.isArray(item.images) ? item.images[0] : item.images) || product.image || "";
        } else {
          return res.status(400).json({ msg: `No active variants found for product ${product.name}` });
        }
        name = product.name;
      }

      const qty = Number(item.quantity) || 1;
      calculatedSubtotal += price * qty;

      validatedItems.push({
        productId: pId && mongoose.Types.ObjectId.isValid(pId) ? pId : null,
        variantId: vId && mongoose.Types.ObjectId.isValid(vId) ? vId : null,
        name,
        variantName,
        price,
        quantity: qty,
        image
      });
    }

    // 2) Recalculate true coupon discount
    let calculatedDiscount = 0;
    let couponRecord = null;
    if (couponCode && String(couponCode).trim() !== "") {
      const cleanCouponCode = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCouponCode });
      
      if (coupon) {
        if (!coupon.isActive) {
          return res.status(400).json({ msg: "Promo code is currently inactive" });
        }
        if (new Date(coupon.startDate) > now) {
          return res.status(400).json({ msg: "Promo code promotion has not started yet" });
        }
        if (new Date(coupon.expiryDate) < now) {
          coupon.isActive = false;
          await coupon.save();
          return res.status(400).json({ msg: "Promo code has expired" });
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ msg: "Promo code usage limit has been reached" });
        }
        if (targetUserId) {
          const userUsageCount = await Order.countDocuments({
            user: targetUserId,
            couponCode: coupon.code,
            status: { $ne: "cancelled" }
          });
          if (userUsageCount >= coupon.perUserLimit) {
            return res.status(400).json({ msg: `You have reached your limit for this promo code` });
          }
        }
        if (calculatedSubtotal < coupon.minimumOrderAmount) {
          return res.status(400).json({ msg: `Minimum order amount to use this promo code is ₹${coupon.minimumOrderAmount}` });
        }
        if (targetUserId) {
          if (coupon.applicableUsers === "NEW_USERS") {
            const deliveredCount = await Order.countDocuments({ user: targetUserId, status: "delivered" });
            if (deliveredCount > 0) {
              return res.status(400).json({ msg: "This offer is only valid for your first order" });
            }
          } else if (coupon.applicableUsers === "SELECTED_USERS") {
            const isEligible = coupon.selectedUsersList.some(id => id.toString() === targetUserId.toString());
            if (!isEligible) {
              return res.status(400).json({ msg: "You are not eligible to apply this coupon" });
            }
          }
        }

        // Calculate true discount amount
        if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
          calculatedDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maximumDiscountAmount) {
            calculatedDiscount = Math.min(calculatedDiscount, coupon.maximumDiscountAmount);
          }
        } else {
          calculatedDiscount = coupon.discountValue;
        }
        calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
        couponRecord = coupon;
      } else {
        return res.status(404).json({ msg: "Promo code does not exist" });
      }
    }

    // 3) Calculate standard shipping cost
    let shippingCost = 0;
    if (deliveryMethodId === 'express') {
      shippingCost = 150;
    } else if (deliveryMethodId === 'priority') {
      shippingCost = 300;
    }

    // 4) Calculate commission coins deduction
    if (useCommissionCoins) {
      const activeCoins = await processCoinExpirations(targetUserId);
      if (activeCoins >= 150) {
        const maxCoinDiscount = Math.max(0, calculatedSubtotal - calculatedDiscount);
        coinsDeducted = Math.min(activeCoins, Math.floor(maxCoinDiscount));

        // Perform instant deduction if COD or total becomes 0
        if (isInstantOrder || (calculatedSubtotal - calculatedDiscount - coinsDeducted <= 0)) {
          let remainingToDeduct = coinsDeducted;
          const activeBatches = await CommissionLog.find({
            userId: targetUserId,
            status: "ACTIVE",
            expiresAt: { $gt: now }
          }).sort({ expiresAt: 1 });

          for (const batch of activeBatches) {
            if (remainingToDeduct <= 0) break;
            const deductFromBatch = Math.min(batch.coinsRemaining, remainingToDeduct);
            batch.coinsRemaining -= deductFromBatch;
            if (batch.coinsRemaining === 0) {
              batch.status = "REDEEMED";
            }
            await batch.save();
            remainingToDeduct -= deductFromBatch;
          }

          // Create a redemption log
          await CommissionLog.create({
            userId: targetUserId,
            coinsEarned: 0,
            coinsRemaining: 0,
            expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            status: "REDEEMED",
            type: "REDEEMED_CHECKOUT",
            note: `Redeemed ${coinsDeducted} commission coins at checkout`
          });

          // Sync user's total coins count
          user.commissionCoins = Math.max(0, user.commissionCoins - coinsDeducted);
          await user.save();
        }
      }
    }

    // 5) Calculate taxes on taxable subtotal
    const taxableAmount = Math.max(0, calculatedSubtotal - calculatedDiscount - coinsDeducted);
    const cgstRecalculated = Math.round(taxableAmount * 0.025 * 100) / 100;
    const sgstRecalculated = Math.round(taxableAmount * 0.025 * 100) / 100;
    const taxRecalculated = cgstRecalculated + sgstRecalculated;

    // Subtotal + Tax + Shipping before wallet is applied
    let finalPayableAmount = taxableAmount + taxRecalculated + shippingCost;

    // 6) Calculate wallet deduction
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

    // 7) Increment coupon usedCount if the order is instant or final total is 0
    if (couponRecord) {
      if (isInstantOrder || finalPayableAmount <= 0) {
        couponRecord.usedCount += 1;
        await couponRecord.save();
      }
    }

    // Determine initial payment status
    let paymentStatus = 'pending';
    if (finalPayableAmount <= 0) {
      paymentStatus = 'completed';
    } else if (paymentMethod === 'online') {
      paymentStatus = 'pending';
    }

    // Generate unique custom order ID without collisions
    const customOrderId = await generateUniqueCustomOrderId(user?.clientType || "Non-GST");

    // Create Order with all verified amounts
    const order = await Order.create({
      customOrderId,
      user: targetUserId,
      items: validatedItems, 
      PaymentMethod: paymentMethod,
      paymentStatus,
      status: 'pending',
      deliveryAddress,
      totalAmount: finalPayableAmount,
      discountAmount: calculatedDiscount,
      couponCode: couponRecord ? couponRecord.code : "",
      referralCode: referralCode ? String(referralCode).trim().toUpperCase() : "",
      referralStatus: referralCode ? "PENDING" : "NONE",
      rewardCredited: false,
      cgst: cgstRecalculated,
      sgst: sgstRecalculated,
      taxAmount: taxRecalculated,
      phonePeTransactionId: phonePeTransactionId || undefined,
      walletDeductedAmount: walletDeducted,
      commissionCoinsDeductedAmount: coinsDeducted,
      clientType: user?.clientType || "Non-GST"
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
    res.status(500).json({ msg: `Failed to create order: ${error.message || "Server Error"}`, error: error.message });
  }
};
