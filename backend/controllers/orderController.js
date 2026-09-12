import mongoose from "mongoose";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";
import ProductVariant from "../models/productVariantModel.js";

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Order ID" });
    }

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Order ID" });
    }
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ msg: "Order cannot be cancelled at this stage" });
    }

    // Restrict cancellation to within 1 hour of placing the order
    const orderAgeInMs = Date.now() - new Date(order.createdAt).getTime();
    const oneHourInMs = 60 * 60 * 1000;
    if (orderAgeInMs > oneHourInMs) {
      return res.status(400).json({ msg: "Orders can only be cancelled within 1 hour of placing them." });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Order ID" });
    }
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Order ID" });
    }
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Order ID" });
    }
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

// CREATE MANUAL ORDER (ADMIN)
export const createManualOrder = async (req, res) => {
  try {
    const {
      customerDetails,
      deliveryAddress,
      items,
      paymentMethod,
      paymentStatus,
      status,
      orderDate,
      deliveryCharge = 0,
      discountAmount = 0,
      taxAmount = 0,
      cgst = 0,
      sgst = 0,
      couponCode = "",
      adminNotes = "",
      transactionId = "",
      deductStock = true,
      clientType = "Non-GST"
    } = req.body;

    if (!customerDetails?.fullName || (!customerDetails?.mobile && !customerDetails?.email)) {
      return res.status(400).json({ success: false, msg: "Customer Name and Mobile or Email are required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, msg: "At least one item is required in the order" });
    }

    // 1. Find existing customer or create a new user profile
    let user = null;
    if (customerDetails.email && customerDetails.email.trim()) {
      user = await User.findOne({ email: customerDetails.email.toLowerCase().trim() });
    }
    if (!user && customerDetails.mobile && customerDetails.mobile.trim()) {
      user = await User.findOne({ mobile: customerDetails.mobile.trim() });
    }

    if (!user) {
      const tempEmail = (customerDetails.email && customerDetails.email.trim())
        ? customerDetails.email.toLowerCase().trim()
        : `offline_${Date.now()}@ownfresh.com`;
      const tempMobile = (customerDetails.mobile && customerDetails.mobile.trim())
        ? customerDetails.mobile.trim()
        : `OFF${Date.now()}`;

      user = await User.create({
        fullName: customerDetails.fullName.trim(),
        email: tempEmail,
        mobile: tempMobile,
        password: "ManualOrderPassword123!",
        role: "user",
        isOtpVerified: true,
        clientType: clientType || "Non-GST"
      });
    } else {
      // Sync clientType if mismatch
      if (clientType && user.clientType !== clientType) {
        user.clientType = clientType;
        await user.save();
      }
    }

    // 2. Compute Total Amount
    const itemsSubtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    
    // Tax / GST calculation
    const isGST = clientType === "GST";
    let finalCgst = Number(cgst) || 0;
    let finalSgst = Number(sgst) || 0;
    let finalTaxAmount = Number(taxAmount) || 0;

    if (isGST) {
      // Compute standard 5% tax (2.5% CGST + 2.5% SGST) from items subtotal minus discount if not provided
      const taxable = Math.max(0, itemsSubtotal - Number(discountAmount || 0));
      if (finalCgst === 0 && finalSgst === 0) {
        finalCgst = taxable * 0.025;
        finalSgst = taxable * 0.025;
        finalTaxAmount = finalCgst + finalSgst;
      }
    }

    const finalDeliveryCharge = Number(deliveryCharge) || 0;
    const finalTotalAmount = Math.max(0, itemsSubtotal - Number(discountAmount || 0) + Number(finalTaxAmount || 0) + finalDeliveryCharge);

    // 3. Generate Sequential Custom Order ID (GST/ or MOF/ based on clientType)
    const orderDateObj = orderDate ? new Date(orderDate) : new Date();
    const year = orderDateObj.getFullYear();
    const yearCode = `${year.toString().slice(0, 2)}${year.toString().slice(-1)}`;
    const prefix = isGST ? "GST" : "MOF";
    const orderCount = await Order.countDocuments({ customOrderId: new RegExp(`^${prefix}/`) });
    const sequenceStr = String(orderCount + 1).padStart(4, "0");
    let customOrderId = `${prefix}/${yearCode}/${sequenceStr}`;

    let attempts = 0;
    while ((await Order.exists({ customOrderId })) && attempts < 50) {
      const nextSeqStr = String(orderCount + 1 + attempts + 1).padStart(4, "0");
      customOrderId = `${prefix}/${yearCode}/${nextSeqStr}`;
      attempts += 1;
    }

    // Map Order Items
    const orderItems = items.map((item) => ({
      productId: item.productId || null,
      variantId: item.variantId || null,
      name: item.name || "Product Item",
      variantName: item.variantName || "",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1/blogs/default_placeholder"
    }));

    // 4. Create Order document
    const newOrderData = {
      customOrderId,
      user: user._id,
      items: orderItems,
      PaymentMethod: paymentMethod || "cod",
      paymentStatus: paymentStatus || "completed",
      status: status || "processing",
      deliveryAddress: {
        roomNumber: deliveryAddress?.roomNumber || "",
        areaName: deliveryAddress?.areaName || "",
        text: deliveryAddress?.text || `${customerDetails.fullName}, ${customerDetails.mobile || ""}`,
        phone: deliveryAddress?.phone || customerDetails.mobile || ""
      },
      totalAmount: finalTotalAmount,
      deliveryCharge: finalDeliveryCharge,
      discountAmount: Number(discountAmount) || 0,
      taxAmount: finalTaxAmount,
      cgst: finalCgst,
      sgst: finalSgst,
      couponCode: couponCode || "",
      adminNotes: adminNotes || "Manual Entry for Offline/WhatsApp Order",
      transactionId: transactionId || undefined,
      clientType: clientType || "Non-GST",
      createdAt: orderDateObj,
      updatedAt: orderDateObj
    };

    const order = await Order.create(newOrderData);

    // 5. Deduct Variant Stock if enabled
    if (deductStock) {
      for (const item of items) {
        if (item.variantId) {
          try {
            await ProductVariant.findByIdAndUpdate(item.variantId, {
              $inc: { stockQuantity: -Math.abs(Number(item.quantity) || 1) }
            });
          } catch (err) {
            console.error(`Failed to update stock for variant ${item.variantId}:`, err);
          }
        }
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email mobile")
      .populate("items.productId", "name image");

    return res.status(201).json({
      success: true,
      msg: "Manual order created successfully",
      order: populatedOrder
    });

  } catch (error) {
    console.error("CREATE MANUAL ORDER EXCEPTION:", error);
    return res.status(500).json({ success: false, msg: "Failed to create manual order: " + error.message });
  }
};
