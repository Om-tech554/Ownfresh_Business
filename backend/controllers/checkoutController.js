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
      useWallet
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

    // 3) Wallet Deduction Logic
    if (useWallet) {
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0, totalEarned: 0, totalRedeemed: 0 });
      }

      if (wallet.balance > 0) {
        walletDeducted = Math.min(wallet.balance, finalPayableAmount);
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

        finalPayableAmount -= walletDeducted;
      }
    }

    // 4) Coupon Usage Incrementation
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Determine initial payment status
    let paymentStatus = 'pending';
    if (finalPayableAmount <= 0) {
      paymentStatus = 'completed';
    } else if (paymentMethod === 'online') {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ msg: "Missing Razorpay details for online payment" });
      }

      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ msg: "Payment signature verification failed" });
      }

      paymentStatus = 'completed';
    }

    // 5) Create Order logic
    const order = await Order.create({
      user: userId,
      items: items, 
      PaymentMethod: paymentMethod,
      paymentStatus,
      status: 'pending',
      deliveryAddress,
      totalAmount: finalPayableAmount,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || "",
      razorpayOrderId: req.body.razorpayOrderId || undefined,
      razorpayPaymentId: req.body.razorpayPaymentId || undefined,
      razorpaySignature: req.body.razorpaySignature || undefined,
      walletDeductedAmount: walletDeducted
    });

    res.status(201).json({
      success: true,
      msg: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
