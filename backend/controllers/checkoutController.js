import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Coupon from "../models/couponModel.js";
import crypto from "crypto";

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

    // 5) Create Order logic
    const order = await Order.create({
      user: userId,
      items: orderItems, 
      PaymentMethod: paymentMethod,
      paymentStatus,
      status: 'pending',
      deliveryAddress,
      totalAmount: finalPayableAmount,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || "",
      cgst: cgst || 0,
      sgst: sgst || 0,
      taxAmount: taxAmount || 0,
      transactionId: razorpayPaymentId || undefined,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      walletDeductedAmount: walletDeducted
    });

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
