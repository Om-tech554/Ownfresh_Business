import Order from "../models/orderModel.js";
import User from "../models/usermodel.js";

// CREATE ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const { userId, paymentMethod, deliveryAddress, totalAmount } = req.body;

    // 1) Validate
    if (!userId || !paymentMethod || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2) Check User Exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 3) Create Order
    const order = await Order.create({
      user: userId,
      PaymentMethod: paymentMethod,
      deliveryAddress,
      totalAmount,
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
