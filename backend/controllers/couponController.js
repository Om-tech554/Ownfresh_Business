import Coupon from "../models/couponModel.js";

// CREATE COUPON (Admin)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const newCoupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      expiryDate,
      usageLimit,
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

// DELETE COUPON (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VALIDATE COUPON (User)
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon code" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon code has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimal order amount for this coupon is ₹${coupon.minOrderAmount}` 
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      discount,
      couponCode: coupon.code,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PUBLIC COUPONS (User)
export const getPublicCoupons = async (req, res) => {
  try {
    // BRUTE FORCE: Return every coupon in the system to see what's going on
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    console.log(`Found ${coupons.length} total coupons in DB`); // Server log
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

