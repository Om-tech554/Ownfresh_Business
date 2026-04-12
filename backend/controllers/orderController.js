import Order from "../models/orderModel.js";

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, deletedByUser: false })
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL ORDERS (ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE ORDER STATUS & PAYMENT (ADMIN)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, trackingId, courierPartner, adminNotes } = req.body;
    const { id } = req.params;

    const updateFields = {};
    if (status) {
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cancellation_requested'].includes(status)) {
        return res.status(400).json({ msg: "Invalid order status" });
      }
      updateFields.status = status;
    }

    if (paymentStatus) {
      if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
        return res.status(400).json({ msg: "Invalid payment status" });
      }
      updateFields.paymentStatus = paymentStatus;
    }

    if (trackingId !== undefined) updateFields.trackingId = trackingId;
    if (courierPartner !== undefined) updateFields.courierPartner = courierPartner;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!order) return res.status(404).json({ msg: "Order not found" });

    res.status(200).json({
      success: true,
      msg: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// REQUEST CANCELLATION (USER)
export const requestOrderCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ msg: "Order cannot be cancelled at this stage" });
    }

    order.status = 'cancellation_requested';
    order.cancellationReason = reason || "No reason provided";
    await order.save();

    res.status(200).json({
      success: true,
      msg: "Cancellation requested. Waiting for admin approval.",
      order
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// HANDLE CANCELLATION REVIEW (ADMIN)
export const handleCancellationReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.status !== 'cancellation_requested') {
      return res.status(400).json({ msg: "No cancellation request for this order" });
    }

    if (approved) {
      order.status = 'cancelled';
      order.paymentStatus = 'failed'; // Assuming refund processed or not paid
    } else {
      order.status = 'processing'; // Revert back
      order.cancellationReason = `[REJECTED] ${order.cancellationReason}`;
    }

    await order.save();

    res.status(200).json({
      success: true,
      msg: approved ? "Order cancelled successfully" : "Cancellation request rejected",
      order
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE USER ORDER (SOFT-DELETE)
export const deleteUserOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Only allow clearing cancelled orders
    if (order.status !== 'cancelled') {
      return res.status(400).json({ msg: "Only cancelled orders can be cleared from history" });
    }

    order.deletedByUser = true;
    await order.save();

    res.status(200).json({
      success: true,
      msg: "Order cleared from history"
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN DELETE ORDER (HARD-DELETE)
export const adminDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) return res.status(404).json({ msg: "Order not found" });

    res.status(200).json({
      success: true,
      msg: "Order permanently deleted"
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
