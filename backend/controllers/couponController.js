import Coupon from "../models/couponModel.js";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";

// CREATE COUPON (Admin)
export const createCoupon = async (req, res) => {
  try {
    const { 
      code, 
      discountType, 
      discountValue, 
      minimumOrderAmount, 
      maximumDiscountAmount, 
      usageLimit, 
      perUserLimit, 
      startDate, 
      expiryDate, 
      applicableUsers, 
      selectedUsersList 
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    const newCoupon = await Coupon.create({
      code,
      discountType: discountType === "percentage" ? "PERCENTAGE" : discountType === "fixed" ? "FIXED_AMOUNT" : discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount: maximumDiscountAmount || null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      applicableUsers: applicableUsers || "ALL_USERS",
      selectedUsersList: selectedUsersList || []
    });

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL COUPONS (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT COUPON (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COUPON (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VALIDATE & APPLY COUPON (User)
export const validateCoupon = async (req, res) => {
  try {
    const { code, amount, userId: bodyUserId } = req.body;
    const userId = bodyUserId || req.userId;

    if (!code || !amount) {
      return res.status(400).json({ message: "Code and amount are required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: "Promo code does not exist" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Promo code is currently inactive" });
    }

    const now = new Date();
    if (new Date(coupon.startDate) > now) {
      return res.status(400).json({ message: "Promo code promotion has not started yet" });
    }

    if (new Date(coupon.expiryDate) < now) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Promo code has expired" });
    }

    // Check overall usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Promo code usage limit has been reached" });
    }

    // Check user-specific limit
    if (userId) {
      const userUsageCount = await Order.countDocuments({
        user: userId,
        couponCode: coupon.code,
        status: { $ne: "cancelled" }
      });
      if (userUsageCount >= coupon.perUserLimit) {
        return res.status(400).json({ message: `You have reached your limit of ${coupon.perUserLimit} uses for this code` });
      }
    }

    // Check minimum order amount
    if (amount < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount to use this promo code is ₹${coupon.minimumOrderAmount}` 
      });
    }

    // Check user eligibility
    if (userId) {
      if (coupon.applicableUsers === "NEW_USERS") {
        const deliveredCount = await Order.countDocuments({ user: userId, status: "delivered" });
        if (deliveredCount > 0) {
          return res.status(400).json({ message: "This offer is only valid for your first order" });
        }
      } else if (coupon.applicableUsers === "SELECTED_USERS") {
        const isEligible = coupon.selectedUsersList.some(id => id.toString() === userId.toString());
        if (!isEligible) {
          return res.status(400).json({ message: "You are not eligible to apply this coupon" });
        }
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount is not greater than the order amount itself
    discountAmount = Math.min(discountAmount, amount);
    const finalAmount = amount - discountAmount;

    res.status(200).json({
      success: true,
      discountAmount,
      finalAmount,
      couponCode: coupon.code
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET PUBLIC COUPONS (User)
export const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    // Return active, non-expired coupons that are for all users or new users
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
      applicableUsers: { $in: ["ALL_USERS", "NEW_USERS"] },
      affiliateId: null // Exclude custom affiliate coupons
    }).sort({ createdAt: -1 });

    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ADMIN COUPONS ANALYTICS
export const getCouponsAnalytics = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.isActive).length;
    const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);

    res.status(200).json({
      success: true,
      analytics: {
        totalCoupons,
        activeCoupons,
        totalUses
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
