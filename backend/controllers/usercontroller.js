import User from "../models/usermodel.js";
import Order from "../models/ordermodel.js";
import CartActivity from "../models/cartActivityModel.js";
import jwt from "jsonwebtoken";

/**
 * Ensures user profile includes cross-device transferable data (saved address, phone, active cart)
 * so that when logging in from any device or via OTP, user experience is seamless without manual re-entry.
 */
export const populateUserTransferableData = async (user) => {
  if (!user) return null;
  const userDoc = user.toObject ? user.toObject() : { ...user };

  // 1. Resolve Delivery Address (From profile, latest order, or cart activity)
  let address = userDoc.deliveryAddress || null;
  if (!address || (!address.text && !address.street && !address.address)) {
    const lastOrder = await Order.findOne({ 
      $or: [
        { user: userDoc._id },
        ...(userDoc.mobile ? [{ "deliveryAddress.phone": userDoc.mobile }] : []),
        ...(userDoc.email ? [{ "deliveryAddress.email": userDoc.email }] : [])
      ]
    }).sort({ createdAt: -1 }).lean();
    if (lastOrder && lastOrder.deliveryAddress) {
      address = lastOrder.deliveryAddress;
    }
  }

  // Also check CartActivity if still no address or phone
  if (!address || (!address.text && !address.street && !address.address)) {
    const lastCartAct = await CartActivity.findOne({
      $or: [{ user: userDoc._id }, { userEmail: userDoc.email }],
      "customerDetails.phone": { $exists: true, $ne: "" }
    }).sort({ createdAt: -1 }).lean();
    if (lastCartAct && lastCartAct.customerDetails) {
      const cd = lastCartAct.customerDetails;
      address = {
        text: [cd.address, cd.city, cd.state, cd.zipCode].filter(Boolean).join(", "),
        street: cd.address || "",
        address: cd.address || "",
        city: cd.city || "",
        state: cd.state || "",
        pincode: cd.zipCode || "",
        zipCode: cd.zipCode || "",
        phone: cd.phone || lastCartAct.userPhone || "",
        landmark: ""
      };
    }
  }

  let normalizedAddress = null;
  if (address) {
    const street = address.street || address.address || address.roomNumber || address.text || "";
    const city = address.city || address.areaName || "";
    const state = address.state || "";
    const pincode = address.pincode || address.zipCode || "";
    const phone = address.phone || userDoc.mobile || "";
    const landmark = address.landmark || address.areaName || "";
    const text = address.text || [street, landmark, city, state, pincode].filter(Boolean).join(", ");
    normalizedAddress = {
      fullName: address.fullName || userDoc.fullName || "",
      text,
      street,
      address: street,
      city,
      state,
      pincode,
      zipCode: pincode,
      phone,
      landmark,
      latitude: address.latitude || null,
      longitude: address.longitude || null
    };
  }

  // 2. Resolve Active Cart (From profile or latest unpurchased cart activity)
  let cart = userDoc.cart || [];
  if (!cart || cart.length === 0) {
    const lastCartAct = await CartActivity.findOne({
      $or: [{ user: userDoc._id }, { userEmail: userDoc.email }],
      isPurchased: false
    }).sort({ createdAt: -1 }).lean();
    if (lastCartAct && Array.isArray(lastCartAct.cartItems) && lastCartAct.cartItems.length > 0) {
      cart = lastCartAct.cartItems.map(it => ({
        _id: String(it.productId || it._id || Math.random()),
        productId: it.productId,
        name: it.name,
        variantName: it.variantName || it.size || "",
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        image: it.image || "",
        size: it.size || it.variantName || ""
      }));
    }
  }

  const resolvedMobile = userDoc.mobile || normalizedAddress?.phone || "";

  // Auto-persist mobile and address if they were empty on user profile
  if (userDoc._id && ((!userDoc.mobile && resolvedMobile) || (!userDoc.deliveryAddress && normalizedAddress))) {
    User.findByIdAndUpdate(userDoc._id, {
      ...(resolvedMobile ? { mobile: resolvedMobile } : {}),
      ...(normalizedAddress ? { deliveryAddress: normalizedAddress } : {})
    }).catch(() => {});
  }

  return {
    _id: userDoc._id,
    fullName: userDoc.fullName,
    userName: userDoc.userName,
    email: userDoc.email,
    mobile: resolvedMobile,
    role: userDoc.role,
    isVerified: userDoc.isVerified,
    wallet: userDoc.wallet || 0,
    walletBalance: userDoc.walletBalance || 0,
    commissionCoins: userDoc.commissionCoins || 0,
    cart,
    deliveryAddress: normalizedAddress,
    cookieConsent: userDoc.cookieConsent || null,
    token: userDoc.token
  };
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }

    const enrichedUser = await populateUserTransferableData(user);
    if (!enrichedUser.token && req.token) {
      enrichedUser.token = req.token;
    }
    return res.status(200).json(enrichedUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get current user error ${error.message || error}` });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin: Update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, wallet, mobile, clientType } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (role) user.role = role;
    if (wallet !== undefined) user.wallet = wallet;
    if (mobile !== undefined) {
      user.mobile = (mobile === null || mobile === "") ? undefined : mobile;
    }
    if (clientType) user.clientType = clientType;

    await user.save();

    return res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mobile number already in use" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin: Manually Create a Single Customer Profile
export const createCustomer = async (req, res) => {
  try {
    const { fullName, email, mobile, password, role, wallet, clientType } = req.body;

    if (!fullName || (!email && !mobile)) {
      return res.status(400).json({
        success: false,
        message: "Full Name and either Email or Mobile are required"
      });
    }

    // Check existing
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Customer email already exists" });
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile: mobile.trim() });
      if (existingMobile) {
        return res.status(400).json({ success: false, message: "Customer mobile number already exists" });
      }
    }

    const bcrypt = (await import("bcryptjs")).default;
    const rawPass = password && password.trim() ? password.trim() : "OwnFresh@123";
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      mobile: mobile ? mobile.trim() : undefined,
      password: hashedPassword,
      role: role || "user",
      wallet: wallet ? Number(wallet) : 0,
      isMember: false,
      clientType: clientType || "Non-GST"
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: "Customer profile created successfully",
      user: userObj
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate email or mobile number" });
    }
    return res.status(500).json({ success: false, message: "Failed to create customer" });
  }
};

// Admin: Bulk Import Customers from CSV/XLS
export const bulkCreateCustomers = async (req, res) => {
  try {
    const { customers } = req.body; // Array of customer objects

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ success: false, message: "No customer records provided for import" });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const defaultHashedPassword = await bcrypt.hash("OwnFresh@123", 10);

    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      const item = customers[i];
      const fullName = (item.fullName || item.name || item.Name || "").toString().trim();
      const email = (item.email || item.Email || "").toString().toLowerCase().trim();
      const mobile = (item.mobile || item.Mobile || item.phone || item.Phone || "").toString().trim();

      if (!fullName) {
        skippedCount++;
        errors.push(`Row ${i + 1}: Missing Full Name`);
        continue;
      }

      if (!email && !mobile) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${fullName}): Needs email or mobile number`);
        continue;
      }

      // Check duplicates
      let isDuplicate = false;
      if (email) {
        const existEmail = await User.findOne({ email });
        if (existEmail) isDuplicate = true;
      }
      if (!isDuplicate && mobile) {
        const existMobile = await User.findOne({ mobile });
        if (existMobile) isDuplicate = true;
      }

      if (isDuplicate) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${fullName}): Duplicate email or mobile`);
        continue;
      }

      const passToUse = item.password && item.password.toString().trim()
        ? await bcrypt.hash(item.password.toString().trim(), 10)
        : defaultHashedPassword;

      await User.create({
        fullName,
        email: email || undefined,
        mobile: mobile || undefined,
        password: passToUse,
        role: "user",
        wallet: Number(item.wallet || 0) || 0
      });

      createdCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Bulk import completed! Successfully imported ${createdCount} customers (${skippedCount} skipped/duplicates).`,
      createdCount,
      skippedCount,
      errors
    });
  } catch (error) {
    console.error("Error bulk creating customers:", error);
    return res.status(500).json({ success: false, message: "Bulk import failed" });
  }
};

// Sync active cart cross-device
export const syncUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    const rawItems = req.body.cart || req.body.cartItems || [];
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (Array.isArray(rawItems)) {
      user.cart = rawItems.map(it => ({
        _id: String(it._id || it.productId || Math.random()),
        productId: it.productId || (it._id && String(it._id).length === 24 ? it._id : null),
        variantId: it.variantId || null,
        name: it.name || "",
        variantName: it.variantName || it.size || "",
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        image: it.image || "",
        size: it.size || it.variantName || ""
      }));
      await user.save();

      // Log to CartActivity for live analytics and cross-device recovery
      await CartActivity.create({
        action: rawItems.length > 0 ? "add" : "remove",
        user: user._id,
        userName: user.fullName,
        userEmail: user.email,
        userPhone: user.mobile || "",
        cartItems: user.cart,
        itemCount: user.cart.length,
        cartValue: user.cart.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
      }).catch(err => console.warn("CartActivity non-blocking log error:", err.message));
    }

    return res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("SYNC_CART_ERROR:", error);
    return res.status(500).json({ message: "Failed to sync cart" });
  }
};

// Sync delivery address cross-device
export const syncUserAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { deliveryAddress } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (deliveryAddress) {
      user.deliveryAddress = deliveryAddress;
      if (deliveryAddress.phone) {
        user.mobile = deliveryAddress.phone;
      }
      if (deliveryAddress.fullName && !user.fullName) {
        user.fullName = deliveryAddress.fullName;
      }
      await user.save();
    }

    return res.status(200).json({ success: true, deliveryAddress: user.deliveryAddress, mobile: user.mobile });
  } catch (error) {
    console.error("SYNC_ADDRESS_ERROR:", error);
    return res.status(500).json({ message: "Failed to sync address" });
  }
};

// Standard authenticated & verified cookie consent system (GDPR / DPDPA 2023)
export const recordCookieConsent = async (req, res) => {
  try {
    let userId = req.userId;
    if (!userId) {
      let token = req.cookies?.token;
      if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded?.userId) userId = decoded.userId;
        } catch (e) {
          // Non-fatal if token is invalid or expired
        }
      }
    }
    const { essential = true, functional = true, analytics = false } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "";

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        cookieConsent: {
          accepted: true,
          essential: Boolean(essential),
          functional: Boolean(functional),
          analytics: Boolean(analytics),
          consentDate: new Date(),
          ip: String(ip)
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cookie privacy preferences recorded successfully",
      consent: {
        accepted: true,
        essential: Boolean(essential),
        functional: Boolean(functional),
        analytics: Boolean(analytics),
        consentDate: new Date()
      }
    });
  } catch (error) {
    console.error("COOKIE_CONSENT_ERROR:", error);
    return res.status(500).json({ message: "Failed to record cookie consent" });
  }
};
