import Order from "../models/orderModel.js";
import User from "../models/usermodel.js";

// CREATE ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod, deliveryAddress, totalAmount } = req.body;

    // 1) Validate
    if (!userId || !items || items.length === 0 || !paymentMethod || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2) Check User Exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 3) Create Order logic
    const { couponCode, useRewards } = req.body;
    let discount = 0;

    // Apply points reward discount if requested
    if (useRewards && user.rewardPoints > 0) {
      const pointsToUse = Math.min(user.rewardPoints, totalAmount);
      discount += pointsToUse;
      user.rewardPoints -= pointsToUse;
      await user.save();
    }

    const order = await Order.create({
      user: userId,
      items: items, // [NEW] Save order items
      PaymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending',
      status: 'pending',
      deliveryAddress,
      totalAmount: totalAmount, // This should be the final amount sent from frontend
      discountAmount: discount,
      couponCode: couponCode || "",
    });

    // 4) Referral Reward Logic (Credit referrer on first order)
    const previousOrders = await Order.countDocuments({ user: userId });
    if (previousOrders === 1 && user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const rewardAmount = 100;
        referrer.rewardPoints += rewardAmount;
        referrer.referralHistory.push({
          userName: user.fullName,
          rewardAmount: rewardAmount,
          date: new Date()
        });
        await referrer.save();
      }
    }

    res.status(201).json({
      success: true,
      msg: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
