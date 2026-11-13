import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Coupon from "../models/couponModel.js";
import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";

/**
 * Robust helper: Resolves any user inputs (full ObjectIds, 6-char short IDs,
 * emails, phones, usernames, or bracketed/quoted strings) into valid mongoose ObjectIds
 * AND extracts normalized email addresses.
 */
export const resolveSelectedUsersAndEmails = async (rawInput) => {
  if (!rawInput) return { users: [], emails: [] };

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
      else if (t.email) cleanTokens.push(String(t.email));
    }
  });

  if (cleanTokens.length === 0) return { users: [], emails: [] };

  // Load all users from DB once for quick, flexible matching
  const allUsers = await User.find().select("_id email fullName userName mobile").lean();
  const resolvedUsersMap = new Map();
  const resolvedEmailsSet = new Set();

  for (const token of cleanTokens) {
    let matchedUser = null;
    const lower = token.toLowerCase();

    // 1. Direct Email address detection
    if (token.includes("@")) {
      resolvedEmailsSet.add(lower);
      matchedUser = allUsers.find(u => (u.email || "").toLowerCase() === lower);
      if (!matchedUser) {
        const directUser = await User.findOne({ email: lower }).select("_id email").lean();
        if (directUser) matchedUser = directUser;
      }
    }

    // 2. Exact 24-char ObjectId match
    if (!matchedUser && mongoose.Types.ObjectId.isValid(token) && token.length === 24) {
      matchedUser = allUsers.find(u => u._id.toString().toLowerCase() === lower);
      if (!matchedUser) {
        const directUser = await User.findById(token).select("_id email").lean();
        if (directUser) matchedUser = directUser;
      }
    }

    // 3. Short / Partial ID (e.g. 'f4d292')
    if (!matchedUser && /^[0-9a-fA-F]{4,24}$/.test(token)) {
      matchedUser = allUsers.find(u => 
        u._id.toString().toLowerCase().endsWith(lower) || 
        u._id.toString().toLowerCase().includes(lower)
      );
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
      resolvedUsersMap.set(matchedUser._id.toString(), new mongoose.Types.ObjectId(matchedUser._id));
      if (matchedUser.email) {
        resolvedEmailsSet.add(matchedUser.email.toLowerCase().trim());
      }
    }
  }

  return {
    users: Array.from(resolvedUsersMap.values()),
    emails: Array.from(resolvedEmailsSet.values())
  };
};

export const resolveSelectedUsers = async (rawInput) => {
  const result = await resolveSelectedUsersAndEmails(rawInput);
  return result.users;
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
      selectedUsersList,
      eliminateDeliveryCharge: rawEliminateDelivery,
      isSpecialCoupon: rawIsSpecial
    } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    const isSpecial = Boolean(applicableUsers === "SPECIAL_MEMBER" || rawIsSpecial);
    const eliminateDeliveryCharge = Boolean(rawEliminateDelivery);

    let resolvedUsers = [];
    let resolvedEmails = [];
    if (applicableUsers === "SELECTED_USERS" && !isSpecial) {
      const resData = await resolveSelectedUsersAndEmails(selectedUsersList || req.body.selectedEmailsList);
      resolvedUsers = resData.users;
      resolvedEmails = resData.emails;

      const hasRawUsers = selectedUsersList && (Array.isArray(selectedUsersList) ? selectedUsersList.length > 0 : String(selectedUsersList).trim().length > 0);
      const hasRawEmails = req.body.selectedEmailsList && (Array.isArray(req.body.selectedEmailsList) ? req.body.selectedEmailsList.length > 0 : String(req.body.selectedEmailsList).trim().length > 0);

      if ((hasRawUsers || hasRawEmails) && resolvedUsers.length === 0 && resolvedEmails.length === 0) {
        return res.status(400).json({
          message: "No registered customers or valid emails found matching your input. Please verify and provide valid emails or customer IDs."
        });
      }
    }

    const requiresDeliveryCharge = !eliminateDeliveryCharge && (isSpecial || (req.body.requiresDeliveryCharge !== undefined 
      ? Boolean(req.body.requiresDeliveryCharge)
      : (applicableUsers === "SELECTED_USERS")));

    const finalUsageLimit = isSpecial ? 1 : (usageLimit ? Number(usageLimit) : null);
    const finalPerUserLimit = isSpecial ? 1 : (Number(perUserLimit) || 1);
    const finalApplicableUsers = isSpecial ? "SPECIAL_MEMBER" : (applicableUsers || "ALL_USERS");

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType === "percentage" ? "PERCENTAGE" : discountType === "fixed" ? "FIXED_AMOUNT" : discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscountAmount: maximumDiscountAmount ? Number(maximumDiscountAmount) : null,
      usageLimit: finalUsageLimit,
      perUserLimit: finalPerUserLimit,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      applicableUsers: finalApplicableUsers,
      isSpecialCoupon: isSpecial,
      selectedUsersList: isSpecial ? [] : resolvedUsers,
      selectedEmailsList: isSpecial ? [] : resolvedEmails,
      eliminateDeliveryCharge,
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
    if (updateData.eliminateDeliveryCharge !== undefined) {
      updateData.eliminateDeliveryCharge = Boolean(updateData.eliminateDeliveryCharge);
      if (updateData.eliminateDeliveryCharge) {
        updateData.requiresDeliveryCharge = false;
      }
    }
    if (updateData.applicableUsers === "SELECTED_USERS" && (updateData.selectedUsersList !== undefined || updateData.selectedEmailsList !== undefined)) {
      const resData = await resolveSelectedUsersAndEmails(updateData.selectedUsersList || updateData.selectedEmailsList);
      updateData.selectedUsersList = resData.users;
      updateData.selectedEmailsList = resData.emails;
      if (!updateData.eliminateDeliveryCharge && updateData.requiresDeliveryCharge === undefined) {
        updateData.requiresDeliveryCharge = true;
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true })
      .populate("selectedUsersList", "fullName userName email mobile");
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
    const { code, amount, shippingCost = 0, userId: bodyUserId, email: bodyEmail, customerDetails } = req.body;
    let userId = bodyUserId || req.userId;

    // If userId not explicitly provided, attempt to decode from auth cookie if present
    if (!userId && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        if (decoded?.userId) userId = decoded.userId;
      } catch (e) {}
    }

    if (!code || amount === undefined || amount === null) {
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

    // Check total usage limit (especially critical for single-use / special family member coupons)
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        message: (coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon || coupon.usageLimit === 1)
          ? "This special one-time promo code has already been redeemed and is no longer valid."
          : "Promo code usage limit has been reached" 
      });
    }

    // MANDATORY SIGN-IN ENFORCEMENT: Customer MUST be logged in to redeem special family member promo codes
    if (coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon) {
      if (!userId) {
        return res.status(401).json({ 
          message: "Please sign in or create an account to apply this special promo code." 
        });
      }
    }

    // Check per-user limit
    if (userId && coupon.perUserLimit) {
      const userUsageCount = await Order.countDocuments({
        user: userId,
        couponCode: coupon.code,
        status: { $ne: "cancelled" }
      });
      if (userUsageCount >= coupon.perUserLimit) {
        return res.status(400).json({ 
          message: (coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon || coupon.perUserLimit === 1)
            ? "You have already redeemed this promo code on your account."
            : `You have reached your limit of ${coupon.perUserLimit} uses for this code` 
        });
      }
    }

    // Check minimum order amount
    if (amount < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount to use this promo code is ₹${coupon.minimumOrderAmount}` 
      });
    }

    // Check user / email eligibility
    if (coupon.applicableUsers === "NEW_USERS") {
      if (userId) {
        const deliveredCount = await Order.countDocuments({ user: userId, status: "delivered" });
        if (deliveredCount > 0) {
          return res.status(400).json({ message: "This offer is only valid for your first order" });
        }
      }
    } else if (coupon.applicableUsers === "SELECTED_USERS") {
      let isEligible = false;
      const cleanEmail = (bodyEmail || customerDetails?.email || "").toLowerCase().trim();

      // 1. Check by authenticated userId
      if (userId && Array.isArray(coupon.selectedUsersList)) {
        if (coupon.selectedUsersList.some(id => id.toString() === userId.toString())) {
          isEligible = true;
        }
      }

      // 2. Check by user's email from DB
      if (!isEligible && userId) {
        const dbUser = await User.findById(userId).select("email").lean();
        if (dbUser?.email && Array.isArray(coupon.selectedEmailsList)) {
          if (coupon.selectedEmailsList.includes(dbUser.email.toLowerCase().trim())) {
            isEligible = true;
          }
        }
      }

      // 3. Check by email passed in request body
      if (!isEligible && cleanEmail && Array.isArray(coupon.selectedEmailsList)) {
        if (coupon.selectedEmailsList.includes(cleanEmail)) {
          isEligible = true;
        }
      }

      // 4. Also check if the body email matches any user in selectedUsersList
      if (!isEligible && cleanEmail && Array.isArray(coupon.selectedUsersList) && coupon.selectedUsersList.length > 0) {
        const userWithEmail = await User.findOne({ email: cleanEmail }).select("_id").lean();
        if (userWithEmail && coupon.selectedUsersList.some(id => id.toString() === userWithEmail._id.toString())) {
          isEligible = true;
        }
      }

      if (!isEligible) {
        return res.status(400).json({ 
          message: "This exclusive coupon is only valid for selected accounts / email addresses." 
        });
      }
    }

    const eliminateDeliveryCharge = Boolean(coupon.eliminateDeliveryCharge === true);
    const effectiveShippingCost = eliminateDeliveryCharge ? 0 : Number(shippingCost || 0);

    // Calculate discount amount based on total
    const baseTotal = Number(amount || 0) + effectiveShippingCost;
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
      discountAmount = (baseTotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.round(Math.min(discountAmount, baseTotal) * 100) / 100;
    const finalAmount = Math.round(Math.max(0, baseTotal - discountAmount) * 100) / 100;

    const isSpecialCoupon = Boolean(coupon.applicableUsers === "SPECIAL_MEMBER" || coupon.isSpecialCoupon);
    const requiresDeliveryCharge = Boolean(!eliminateDeliveryCharge && (
      isSpecialCoupon ||
      coupon.applicableUsers === "SELECTED_USERS" || 
      coupon.requiresDeliveryCharge === true || 
      (Array.isArray(coupon.selectedUsersList) && coupon.selectedUsersList.length > 0)
    ));

    res.status(200).json({
      success: true,
      discountAmount,
      finalAmount,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      applicableUsers: coupon.applicableUsers,
      isSpecialCoupon,
      eliminateDeliveryCharge,
      requiresDeliveryCharge,
      message: eliminateDeliveryCharge
        ? `🎉 Exclusive promo ${coupon.code} applied! 100% Free Delivery unlocked for your account${discountAmount > 0 ? ` + ₹${discountAmount} discount` : ''}!`
        : (isSpecialCoupon
          ? `🌟 Special one-time promo ${coupon.code} applied! Saved ₹${discountAmount}. (Standard delivery charges apply)`
          : requiresDeliveryCharge 
          ? `Exclusive promo ${coupon.code} applied! Saved ₹${discountAmount}. (Standard delivery charges apply)` 
          : `Coupon ${coupon.code} applied! Saved ₹${discountAmount}.`)
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
    // Return active, non-expired coupons that are for all users or new users (excluding special/secret coupons)
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
      applicableUsers: { $in: ["ALL_USERS", "NEW_USERS"] },
      isSpecialCoupon: { $ne: true },
      usageLimit: { $ne: 1 },
      affiliateId: null // Exclude custom affiliate coupons
    }).sort({ createdAt: -1 });

    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
