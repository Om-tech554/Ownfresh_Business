import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";

// CREATE ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod, deliveryAddress, totalAmount, discountAmount, couponCode } = req.body;

    // 1) Validate
    if (!userId || !items || items.length === 0 || !paymentMethod || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2) Check User Exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 3) Create Order logic
    const order = await Order.create({
      user: userId,
      items: items, 
      PaymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending',
      status: 'pending',
      deliveryAddress,
      totalAmount: totalAmount,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || "",
      razorpayOrderId: req.body.razorpayOrderId || undefined,
      razorpayPaymentId: req.body.razorpayPaymentId || undefined,
      razorpaySignature: req.body.razorpaySignature || undefined,
    });

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
