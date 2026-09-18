import mongoose from "mongoose";
import Coupon from "../models/couponModel.js";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";

/**
 * Robust helper: Resolves any user inputs (full ObjectIds, 6-char short IDs,
 * emails, phones, usernames, or bracketed/quoted strings) into valid mongoose ObjectIds.
 */
export const resolveSelectedUsers = async (rawInput) => {
  if (!rawInput) return [];

  // 1. Normalize rawInput into array of string tokens
  let tokens = [];
  if (Array.isArray(rawInput)) {
    tokens = rawInput;
  } else if (typeof rawInput === "string") {
    let cleaned = rawInput.trim();
    if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
      try {
        tokens = JSON.parse(cleaned.replace(/'/g, '"'));
      } catch (e) {
        cleaned = cleaned.replace(/[\[\]'"`]/g, " ");
        tokens = cleaned.split(/[\s,]+/);
      }
    } else {
      tokens = cleaned.split(/[\s,]+/);
    }
  }

  // Flatten and strip any lingering quotes or brackets
  const cleanTokens = [];
  tokens.forEach(t => {
    if (typeof t === "string") {
      const stripped = t.replace(/[\[\]'"`]/g, "").trim();
      if (stripped) cleanTokens.push(stripped);
    } else if (t && typeof t === "object") {
      if (t._id) cleanTokens.push(String(t._id));
      else if (t.id) cleanTokens.push(String(t.id));
    }
  });

  if (cleanTokens.length === 0) return [];

  // Load all users from DB once for quick, flexible matching
  const allUsers = await User.find().select("_id email fullName userName mobile").lean();
  const resolvedMap = new Map();

  for (const token of cleanTokens) {
    let matchedUser = null;
    const lower = token.toLowerCase();

    // 1. Exact 24-char ObjectId match
    if (mongoose.Types.ObjectId.isValid(token) && token.length === 24) {
      matchedUser = allUsers.find(u => u._id.toString().toLowerCase() === lower);
      if (!matchedUser) {
        // Even if not in loaded list, if valid 24 hex chars check directly in DB
        const directUser = await User.findById(token).select("_id").lean();
        if (directUser) matchedUser = directUser;
      }
    }

    // 2. Short / Partial ID (e.g. 'f4d292')
    if (!matchedUser && /^[0-9a-fA-F]{4,24}$/.test(token)) {
      matchedUser = allUsers.find(u => 
        u._id.toString().toLowerCase().endsWith(lower) || 
        u._id.toString().toLowerCase().includes(lower)
      );
    }

    // 3. Email address
    if (!matchedUser && token.includes("@")) {
      matchedUser = allUsers.find(u => (u.email || "").toLowerCase() === lower);
    }

    // 4. Mobile / Phone number
    if (!matchedUser && /\d{4,}/.test(token)) {
      const digits = token.replace(/[^0-9]/g, "");
      matchedUser = allUsers.find(u => (u.mobile || "").replace(/[^0-9]/g, "").includes(digits));
    }

    // 5. Username or Full Name
    if (!matchedUser) {
      matchedUser = allUsers.find(u =>
        (u.userName && u.userName.toLowerCase() === lower) ||
        (u.fullName && u.fullName.toLowerCase() === lower)
      );
    }

    if (matchedUser) {
      resolvedMap.set(matchedUser._id.toString(), new mongoose.Types.ObjectId(matchedUser._id));
    }
  }

  return Array.from(resolvedMap.values());
};

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

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    let resolvedUsers = [];
    if (applicableUsers === "SELECTED_USERS") {
      resolvedUsers = await resolveSelectedUsers(selectedUsersList);
      if (selectedUsersList && (Array.isArray(selectedUsersList) ? selectedUsersList.length > 0 : String(selectedUsersList).trim().length > 0) && resolvedUsers.length === 0) {
        return res.status(400).json({
          message: "No registered customers found matching the provided customer IDs or emails. Please verify and select valid customers."
        });
      }
    }

    const requiresDeliveryCharge = req.body.requiresDeliveryCharge !== undefined 
      ? Boolean(req.body.requiresDeliveryCharge)
      : (applicableUsers === "SELECTED_USERS");

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType === "percentage" ? "PERCENTAGE" : discountType === "fixed" ? "FIXED_AMOUNT" : discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscountAmount: maximumDiscountAmount ? Number(maximumDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: Number(perUserLimit) || 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      applicableUsers: applicableUsers || "ALL_USERS",
      selectedUsersList: resolvedUsers,
      requiresDeliveryCharge
    });

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error("createCoupon error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL COUPONS (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("selectedUsersList", "fullName userName email mobile")
      .sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT COUPON (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    if (updateData.discountType) {
      updateData.discountType = updateData.discountType === "percentage" ? "PERCENTAGE" : updateData.discountType === "fixed" ? "FIXED_AMOUNT" : updateData.discountType;
    }
    if (updateData.applicableUsers === "SELECTED_USERS" && updateData.selectedUsersList !== undefined) {
      updateData.selectedUsersList = await resolveSelectedUsers(updateData.selectedUsersList);
      if (updateData.requiresDeliveryCharge === undefined) {
        updateData.requiresDeliveryCharge = true;
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error("updateCoupon error:", error);
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

    // Check per-user limit
    if (userId && coupon.perUserLimit) {
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

    const requiresDeliveryCharge = Boolean(
      coupon.applicableUsers === "SELECTED_USERS" || 
      coupon.requiresDeliveryCharge === true || 
      (Array.isArray(coupon.selectedUsersList) && coupon.selectedUsersList.length > 0)
    );

    res.status(200).json({
      success: true,
      discountAmount,
      finalAmount,
      couponCode: coupon.code,
      applicableUsers: coupon.applicableUsers,
      requiresDeliveryCharge,
      message: requiresDeliveryCharge 
        ? `Exclusive coupon ${coupon.code} applied! Standard delivery charges apply.` 
        : `Coupon ${coupon.code} applied! Saved ₹${discountAmount}.`
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
